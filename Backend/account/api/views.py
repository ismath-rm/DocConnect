from django.views import View
from rest_framework.views import APIView
from rest_framework import status
from django.http import JsonResponse
from rest_framework.response import Response
from .serializers import  *
import random
from account.models import *
from datetime import datetime
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import AuthenticationFailed, ParseError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated




class RegisterView(APIView):
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
        # Delete any existing OTPs for this user
        OTPModel.objects.filter(user__email=email).delete()
        random_num = random.randint(1000, 9999)
        print(random_num)
        try:
            send_mail(
                "OTP AUTHENTICATING DocConnect",
                f"{random_num} -OTP",
                "ismathrm9@gmail.com",
                [email],
                fail_silently=False,
                )
        except Exception as e:
            print("**********************8")
            print("Error sending email: ", e)
            raise

        user = User.objects.get(email=email)
        otp_instance = OTPModel.objects.create(
            user=User.objects.get(email=email),
            otp=random_num,
            timestamp=datetime.now(),
        )
        otp_instance.save()




class OTPVerificationView(APIView):
    def post(self, request):
        try:
            user = User.objects.get(email=request.data['email'])
            otp_instance = OTPModel.objects.get(user=user)
        except ObjectDoesNotExist:
            return Response("User does not exist or OTP not generated", status=404)

        if otp_instance.otp == int(request.data['otp']):
            # You can set is_active to True or perform any other necessary actions
            user.is_active = True
            user.save()

            otp_instance.delete()  # Delete the OTP instance after successful verification

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
        print(request.data)

        try:
            email = request.data['email']
            password = request.data['password']
            print(email, password)

        except KeyError:
            raise ParseError('All Fields Are Required')

        if not User.objects.filter(email=email).exists():
            # raise AuthenticationFailed('Invalid Email Address')
            return Response({'detail': 'Email Does Not Exist'}, status=status.HTTP_403_FORBIDDEN)

        if not User.objects.filter(email=email, is_active=True).exists():
            raise AuthenticationFailed(
                'You are blocked by admin ! Please contact admin')

        user = authenticate(username=email, password=password)
        if user is None:
            raise AuthenticationFailed('Invalid Password')

        refresh = RefreshToken.for_user(user)
        print(request.data)
        print(refresh)

        refresh["first_name"] = str(user.first_name)
        # refresh["is_admin"] = str(user.is_superuser)
        print("Ddddddddddddddddddddddddddd")

        content = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'isAdmin': user.is_superuser,
            'is_doctor': user.is_doctor(),
            'user_id': user.id
        }
        print(content)
        return Response(content, status=status.HTTP_200_OK)
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print('log out')
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            print("401 error mannnn")
            return Response(status=status.HTTP_401_UNAUTHORIZED)
    



class UserDetails(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = User.objects.get(id=request.user.id)
       
        data = UserSerializer(user).data
        try :
            profile_pic = user.profile_picture
            data['profile_pic'] = request.build_absolute_uri('/')[:-1]+profile_pic.url
        except:
            profile_pic = ''
            data['profile_pic']=''
            
        content = data
        return Response(content,status=status.HTTP_200_OK)
