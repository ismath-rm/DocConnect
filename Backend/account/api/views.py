from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from .serializers import  *
import random
from account.models import *
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import AuthenticationFailed, ParseError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.permissions import AllowAny
from django.utils.encoding import force_bytes, force_str
from datetime import datetime
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from django.db.models import Q
from django.conf import settings


class  RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            
            serializer.save()

            try:
                self.send_otp_email(serializer.data['email'])

            except Exception as e:
                return Response({"Message": "Unknown error", "error": str(e)}, status=500)

        else:
            is_active = False
            content = {
                'message': 'Registration failed',
                'errors': serializer.errors,
                'is_active': is_active
            }
            return Response(content, status=409)

        content = {"Message": "OTP sent successfully",
                   "username": serializer.data['email']
                   }

        return Response(content, status=201)

    def send_otp_email(self, email):

        
        OTPModel.objects.filter(user__email=email).delete()
    
        random_num = random.randint(1000, 9999)
        
        try:
            send_mail(
                "OTP AUTHENTICATING DocConnect",
                f"{random_num} -OTP",
                "ismathrm9@gmail.com",
                [email],
                fail_silently=False,
                )
        except Exception as e:
            raise

        user = User.objects.get(email=email)
       
        try:
            otp_instance = OTPModel.objects.create(
                user=user,
                otp=random_num,
                timestamp=datetime.now(),
            )
        except Exception as e:

            raise
        otp_instance.save()




class OTPVerificationView(APIView):
    def post(self, request):
        try:
            user = User.objects.get(email=request.data['email'])
            otp_instance = OTPModel.objects.get(user=user)
        except ObjectDoesNotExist:
            return Response("User does not exist or OTP not generated", status=404)

        if otp_instance.otp == int(request.data['otp']):
            user.is_active = True
            user.save()

            otp_instance.delete()  

            return Response("User successfully verified", status=200)

        return Response("OTP is wrong", status=400)
    
    

class ResendOTPView(APIView):
    def post(self, request):
        try:
            user = User.objects.get(email=request.data['email'])
        except ObjectDoesNotExist:
            return Response("User does not exist", status=404)

        try:
            otp_instance = OTPModel.objects.get(user=user)
            otp_instance.delete()
        except ObjectDoesNotExist:
            pass

        register_view = RegisterView()
        try:
            register_view.send_otp_email(user.email)
        except Exception as e:
            return Response({"Message": "Failed to resend OTP", "error": str(e)}, status=500)

        return Response("OTP resent successfully", status=200)

class UserLogin(APIView):

    def post(self, request):

        try:
            email = request.data['email']
            password = request.data['password']
          

        except KeyError:
            raise ParseError('All Fields Are Required')

        if not User.objects.filter(email=email).exists():
            return Response({'detail': 'Email Does Not Exist'}, status=status.HTTP_403_FORBIDDEN)

        if not User.objects.filter(email=email, is_active=True).exists():
            raise AuthenticationFailed(
                'You are blocked by admin ! Please contact admin')

        user = authenticate(username=email, password=password)
        if user is None:
            raise AuthenticationFailed('Invalid Password')

        refresh = RefreshToken.for_user(user)

        refresh["first_name"] = str(user.first_name)


        content = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'isAdmin': user.is_superuser,
            'is_doctor': user.is_doctor(),
            'user_id': user.id
        }
    
        return Response(content, status=status.HTTP_200_OK)




class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}auth/resetpassword/{uid}/{token}/"

        
        subject = "Reset your password"
        message = f"Hello {user.username},\n\nPlease click the following link to reset your password:\n{reset_url}"

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

        return Response({"detail": "Password reset link has been sent to your email."}, status=status.HTTP_200_OK)





class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            serializer = ResetPasswordSerializer(data=request.data)
            if serializer.is_valid():
                user.set_password(request.data['password'])
                user.save()
                return Response({
                    "detail": "Password has been reset successfully.",
                    "user_type": user.user_type  
                }, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"detail": "Invalid token or user ID."}, status=status.HTTP_400_BAD_REQUEST)




class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
    



class UserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = get_object_or_404(User, id=request.user.id)
        serializer = UserSerializer(user)
        data = serializer.data

        
        if user.profile_picture:
            data['profile_pic'] = request.build_absolute_uri('/')[:-1] + user.profile_picture.url
        else:
            data['profile_pic'] = None
        
        return Response(data, status=status.HTTP_200_OK)
    

    
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user

        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocProfileUpdate(generics.RetrieveUpdateAPIView):
    queryset = Doctor.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = AdminDocUpdateSerializer
    lookup_field = 'user_id'
    

class AdminDocUpdate(generics.RetrieveUpdateAPIView):
    queryset = Doctor.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = AdminDocUpdateSerializer
    lookup_field = 'pk'

class UpdateAdminDoc(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UpdateAdminDocSerializer
    lookup_field = 'doctor_user__id'

    
class VarificationDoctorView(generics.RetrieveUpdateAPIView):
    serializer_class = VerificationSerializer
    lookup_field = 'user__id'

    def get_queryset(self):
        user_id = self.kwargs.get('user__id')

        user_verification = get_object_or_404(Verification, user__id=user_id)
        return Verification.objects.filter(user=user_verification.user)
    


class AdminPatientUpdate(generics.RetrieveUpdateAPIView):
    queryset = User.objects.filter(user_type='patient')
    permission_classes = [IsAuthenticated]
    serializer_class = AdminPatientUpdateSerializer
    lookup_field = 'pk'


class PatientUseDetailsUpdate(generics.ListAPIView):
    queryset = User.objects.filter(user_type='patient')
    permission_classes = [IsAdminUser]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = PatientUserSerializer
    pagination_class = PageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']






class UserDetailsUpdate(generics.ListAPIView):
    queryset = User.objects.filter(user_type='doctor')
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = UserDetailsUpdateSerializer
    pagination_class = PageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']

    def get_queryset(self):
        queryset = super().get_queryset()

        
        gender = self.request.query_params.get('gender', None)
        if gender:
            queryset = queryset.filter(gender=gender)

        
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(doctor_user__specializations__icontains=specialization)

        return queryset
    

class AdminDocVerificationView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = adminDocVerificationSerializer
    lookup_field = 'user__id'

    def get_queryset(self):
        user_id = self.kwargs.get('user__id')
        user_verification = get_object_or_404(Verification, user__id=user_id)
        return Verification.objects.filter(user=user_verification.user)    
    

class AdminDoctorApprovalListView(generics.ListAPIView):
    queryset = User.objects.filter(
    Q(user_type='doctor') & ~Q(approval_status='APPROVED')  
) 
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]
    serializer_class = UserDetailsUpdateSerializer
    pagination_class = PageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number','approval_status']  


class PatientCustomIdView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserPatientCustomIDSerializer
    lookup_field = 'pk'    


class DoctorCustomIdView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserDoctorCustomIDSerializer
    lookup_field = 'pk' 


    
class WalletAmountView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Wallet.objects.all()
    serializer_class = WalletUpdateSerializer
    lookup_field = 'patient_id'

    def get(self, request, *args, **kwargs):
        try:
            wallet = self.get_object()
            serializer = self.get_serializer(wallet)
            return Response(serializer.data)
        except Wallet.DoesNotExist:

            return Response({'balance': 0}, status=status.HTTP_200_OK)

