from xml.dom import ValidationErr
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from booking.models import *
from notification.models import Notification
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from account.models import *
from django.utils import timezone
from django.utils.timezone import now
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.http import JsonResponse
from asgiref.sync import async_to_sync
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from datetime import timedelta,date
from django.db.models import F
from booking.api.razorpay.main import RazorpayClient
from notification.models import *
from django.http import Http404
from django.db.models import Sum
from datetime import datetime



class DoctorSlotsAPIView(APIView):
    def get(self, request, custom_id):
        print("custom_id is :",custom_id)
        try:
            doctor = Doctor.objects.get(id=custom_id)
            print('doctor:',doctor)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Specify the date for which you want to retrieve slots
        date_param = request.query_params.get('date')
        
        if not date_param:
            return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date_object = date.fromisoformat(date_param)
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        # Use prefetch_related to optimize the query and fetch availability in a single query
        doctor_with_availability = Doctor.objects.prefetch_related('doctoravailability_set').get(id=custom_id)

        slots_queryset = doctor_with_availability.doctoravailability_set.filter(day=date_object).order_by('start_time')
        print('slots_queryset',slots_queryset)

        paginator = CustomPageNumberPagination()
        paginated_slots = paginator.paginate_queryset(slots_queryset, request)

        # Retrieve and serialize the available slots for the specified date
        # slots = {
        #     'available_slots': [
        #         {'from': slot.start_time, 'to': slot.end_time, 'is_booked': slot.is_booked} for slot in doctor_with_availability.doctoravailability_set.filter(day=date_object)
        #     ]
        # }

        slots = {
            'available_slots': [
                {'from': slot.start_time, 'to': slot.end_time, 'is_booked': slot.is_booked} for slot in paginated_slots
            ]
        }
        response = {
            "status_code": status.HTTP_200_OK,
            "data": slots['available_slots'],
            "pagination": {
                "current_page": paginator.page.number,
                "total_pages": paginator.page.paginator.num_pages,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link()
            }
        }


        return Response(response, status=status.HTTP_200_OK)


class DoctorSlotUpdateView(APIView):
    def post(self, request, custom_id):
        try:
            doctor = Doctor.objects.get(id=custom_id)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DoctorSlotUpdateSerializer(data=request.data, context={'doctor': doctor})
        try:
            serializer.is_valid(raise_exception=True)
            serializer.update_doctor_slots(doctor)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationErr as e:
            if 'duplicate_slot' in e.get_codes():
                return Response({"error": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DoctorSlotBulkUpdateView(APIView):
    def post(self, request, custom_id):
        try:
            doctor = Doctor.objects.get(id=custom_id)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DoctorSlotBulkUpdateSerializer(data=request.data, context={'doctor': doctor})
        try:
            serializer.is_valid(raise_exception=True)
            serializer.update_doctor_slots(doctor)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            if 'overlap_error' in e.get_codes():
                return Response({"error": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class AdvancedSlotUpdateView(APIView):
    def post(self, request, custom_id):
        try:
            doctor = Doctor.objects.get(id=custom_id)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdvancedSlotUpdateSerializer(data=request.data, context={'doctor': doctor})
        try:
            serializer.is_valid(raise_exception=True)
            slots = serializer.update_doctor_slots(doctor)
            return Response({"message": "Slots created successfully", "slots": slots}, status=status.HTTP_200_OK)
        except ValidationError as e:
            if 'overlap_error' in e.get_codes():
                return Response({"error": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)     



class DoctorSlotDeleteView(APIView):
    def delete(self, request, custom_id):
        try:
            doctor = Doctor.objects.get(id=custom_id)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

        date = request.data.get('date')
        slot = request.data.get('slot')

        try:
            # Assuming DoctorAvailability has a ForeignKey to Doctor named 'doctor'
            doctor_availability = DoctorAvailability.objects.get(doctor=doctor, day=date, start_time=slot['from'], end_time=slot['to'])
            doctor_availability.delete()
            return Response({"message": "Slot deleted successfully"}, status=status.HTTP_200_OK)
        except DoctorAvailability.DoesNotExist:
            return Response({"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error deleting slot: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
         

class DoctorsUserSideList(generics.ListAPIView):
    queryset = User.objects.filter(user_type='doctor', approval_status='APPROVED', is_active=True)
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = UserDetailsUpdateSerializer
    pagination_class = PageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter based on gender
        gender = self.request.query_params.get('gender', None)
        if gender:
            queryset = queryset.filter(gender=gender)

        # Filter based on specialization
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(doctor_user__specializations__icontains=specialization)

        return queryset


class DocDetailList(generics.RetrieveAPIView):
    queryset = Doctor.objects.all()
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = AdminDocUpdateSerializer
    lookup_field = 'pk'

class PatientDetailList(generics.RetrieveAPIView):
    queryset = User.objects.all()
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = AdminPatientUpdateSerializer
    lookup_field = 'pk'


class PatientSlotsCheckingAPIView(APIView):
    def get(self, request, custom_id):
        try:
            doctor = Doctor.objects.get(id=custom_id)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Specify the date for which you want to retrieve slots
        date_param = request.query_params.get('date')
        
        if not date_param:
            return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            requested_date = date.fromisoformat(date_param)
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        # Use prefetch_related to optimize the query and fetch availability in a single query
        doctor_with_availability = Doctor.objects.prefetch_related('doctoravailability_set').get(id=custom_id)

        # Retrieve and serialize the available slots for the specified date
        slots = {
            'available_slots': [
                {'from': slot.start_time, 'to': slot.end_time, 'is_booked': slot.is_booked} for slot in doctor_with_availability.doctoravailability_set.filter(day=requested_date, is_booked=False)
            ]
        }

        return Response(slots, status=status.HTTP_200_OK)
    




# payment integration for razor pay

rz_client = RazorpayClient()

@api_view(['POST'])
def check_availability(request):
    doctor_id = request.data.get('doctor_id')
    print("doctor_id: ",doctor_id)
    selected_from_time = request.data.get('selected_from_time')
    print("selected_from_time:",selected_from_time)
    selected_to_time = request.data.get('selected_to_time')
    print("selected_to_time:",selected_to_time)
    selected_day = request.data.get('selected_day')
    print("selected_day:",selected_day)

    doctor_availability = get_object_or_404(DoctorAvailability, doctor_id=doctor_id, day=selected_day, start_time__lte=selected_from_time, end_time__gte=selected_to_time)
    print("doctor_availability;",doctor_availability)

    available = not doctor_availability.is_booked

    return Response({'available': available}, status=status.HTTP_200_OK)



class RazorpayOrderAPIView(APIView):
    """This API will create an order"""
    
    def post(self, request):
        print("request:",request.data)
        razorpay_order_serializer = RazorpayOrderSerializer(
            data=request.data

        )
        if razorpay_order_serializer.is_valid():
            order_response = rz_client.create_order(
                amount=razorpay_order_serializer.validated_data.get("amount"),
                currency=razorpay_order_serializer.validated_data.get("currency")
            )
            response = {
                "status_code": status.HTTP_201_CREATED,
                "message": "order created",
                "data": order_response
            }
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            response = {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "bad request",
                "error": razorpay_order_serializer.errors
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)


class TransactionAPIView(APIView):
    """This API will complete order and save the 
    transaction"""
    permission_classes = [IsAuthenticated]
    def post(self, request):
        print('complete order:',request.data)
        transaction_serializer = TranscationModelSerializer(data=request.data)
        # print('transaction_serializer:',transaction_serializer)
        if transaction_serializer.is_valid():
            rz_client.verify_payment_signature(
                razorpay_payment_id = transaction_serializer.validated_data.get("payment_id"),
                razorpay_order_id = transaction_serializer.validated_data.get("order_id"),
                razorpay_signature = transaction_serializer.validated_data.get("signature")
            )
            try:
                doctor_id=transaction_serializer.validated_data.get("doctor_id")
                print('doctor_id is:',doctor_id)
                patient_id=transaction_serializer.validated_data.get("patient_id")
                print('patient_id is :',type(patient_id))
                doctor=Doctor.objects.get(id=doctor_id)
                print('doctor:',doctor)
                patient=User.objects.get(id=patient_id)
                print('patient:',patient)
                selected_from_time=transaction_serializer.validated_data.get("booked_from_time")
                print('selected_from_time:',selected_from_time)
                selected_to_time=transaction_serializer.validated_data.get("booked_to_time")
                print('selected_to_time:',selected_to_time)

                selected_day=transaction_serializer.validated_data.get("booked_date")
                print('selected_day:',selected_day)
                
                doctor_availability = get_object_or_404(DoctorAvailability, doctor_id=doctor_id, day=selected_day, start_time__lte=selected_from_time, end_time__gte=selected_to_time)
                doctor_availability.is_booked=True
                doctor_availability.save()

                print('haiiiiii')
                Notification.objects.create(
            Patient=patient, Doctor=doctor, message=f'{patient.first_name} has booked an appointment on {selected_day} @ {selected_from_time}.',
            receiver_type=Notification.RECEIVER_TYPE[1][0],notification_type=Notification.NOTIFICATION_TYPES[0][0]
            )
            
                print(f'Notification ID: {Notification.id}')
                print(f'Patient: {Notification.Patient}')
                print(f'Doctor: {Notification.Doctor}')
                print(f'Message: {Notification.message}')
                print(f'Receiver Type: {Notification.receiver_type}')
                print(f'Notification Type: {Notification.notification_type}')
                print(f'Created At: {Notification.created}')
                
            except Exception as e:
                print(f"Doctor availability not found: {e}")
            
                return Response({"error": "Doctor availability not found"}, status=status.HTTP_404_NOT_FOUND)

                
            transaction_serializer.save()
            response = {
                "status_code": status.HTTP_201_CREATED,
                "message": "transaction created"
            }
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            response = {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "bad request",
                "error": transaction_serializer.errors
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST) 
        

class TrasactionListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Transaction.objects.all().order_by('booked_date','booked_from_time')
    # print('queryset',queryset)
    serializer_class = TranscationModelList
    pagination_class = PageNumberPagination    
    filter_backends = [SearchFilter]
    permission_classes=[IsAdminUser]
    search_fields = ['transaction_id', 'doctor_id','patient_id', 'booked_date']


# class TrasactionRetriveAPIView(generics.RetrieveAPIView):
#     permission_classes = [IsAuthenticated]
#     queryset = Transaction.objects.all()
#     serializer_class = TranscationModelList
#     lookup_field = 'pk'

class TrasactionRetriveAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Transaction.objects.all().order_by('-booked_date','-booked_from_time')  # Sort by booked_date in descending order
    serializer_class = TranscationModelList
    pagination_class = PageNumberPagination
    lookup_field = 'pk'



class PayUsingWalletAPIview(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        transaction_serializer = TranscationModelSerializer(data=request.data)
        print("request data wallet: ",request.data)
        
        if transaction_serializer.is_valid():
            try:
                doctor_id = transaction_serializer.validated_data.get("doctor_id")
                print('doctor_id in wallet :',doctor_id)
                patient_id = transaction_serializer.validated_data.get("patient_id")
                print('patient_id in wallet :',patient_id)
                doctor = Doctor.objects.get(id=doctor_id)
                print('doctor in wallet :',doctor)
                patient = User.objects.get(id=patient_id)
                print('patient in wallet :',patient)
                wallet,isWallet = Wallet.objects.get_or_create(patient=patient)
                print('wallet in wallet:',wallet,isWallet)


                if wallet.balance >= transaction_serializer.validated_data.get("amount"):
                    wallet.balance -= transaction_serializer.validated_data.get("amount")
                    wallet.save()

                    selected_from_time = transaction_serializer.validated_data.get("booked_from_time")
                    selected_to_time = transaction_serializer.validated_data.get("booked_to_time")
                    selected_day = transaction_serializer.validated_data.get("booked_date")

                    doctor_availability = get_object_or_404(
                        DoctorAvailability,
                        doctor_id=doctor_id,
                        day=selected_day,
                        start_time__lte=selected_from_time,
                        end_time__gte=selected_to_time
                    )
                    doctor_availability.is_booked = True
                    doctor_availability.save()

                    Notification.objects.create(
                        Patient=patient,
                        Doctor=doctor,
                        message=f'{patient.first_name} has booked an appointment on {selected_day} @ {selected_from_time}.',
                        receiver_type=Notification.RECEIVER_TYPE[1][0],
                        notification_type=Notification.NOTIFICATION_TYPES[0][0]
                    )

                    transaction_serializer.save()

                    response = {
                        "status_code": status.HTTP_201_CREATED,
                        "message": "Transaction created, and doctor availability updated"
                    }
                    return Response(response, status=status.HTTP_201_CREATED)
                else:
                    return Response({"error": "Insufficient balance in the wallet"}, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                print(e)
                return Response({"error": "Doctor availability not found"}, status=status.HTTP_404_NOT_FOUND)

        else:
            response = {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "Bad request",
                "error": transaction_serializer.errors
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def cancel_booking(request):
    print('cancel booking data:',request.data)
    transaction_id = request.data.get('transaction_id')
    print("here I got the transaction id", transaction_id)

    try:
        transaction = Transaction.objects.get(transaction_id=transaction_id)
        print('transaction id in cancel booking:',transaction)

        patient_id = transaction.patient_id
        print('patient_id in cancel booking:',patient_id)
        
        patient = User.objects.get(id=patient_id)
        print('patient in cancel booking:',patient)

        wallet = Wallet.objects.get(patient=patient)
        print('wallet in cancel booking:',wallet)
                
        try:
            doctor = Doctor.objects.get(id=transaction.doctor_id)
            print("doctor in cancel booking",doctor)
            try:
                doctor_availability = DoctorAvailability.objects.get(
                    doctor=doctor,
                    day=transaction.booked_date,
                    start_time=transaction.booked_from_time,
                    end_time=transaction.booked_to_time
                )

                print('doctor_availability in cancel booking:',doctor_availability)
                wallet.balance += (transaction.amount)
                doctor_availability.is_booked = False
                doctor_availability.save()
                wallet.save()
                print('wallet amount:',wallet.save())
                transaction.is_consultency_completed = 'REFUNDED'
                print('Updated transaction status:', transaction.is_consultency_completed)
                transaction.save()

                formatted_time = transaction.booked_from_time.strftime('%I:%M %p')

                Notification.objects.create(
                    Patient=patient,
                    Doctor=doctor,
                    message=f'{patient.first_name} has cancelled the appointment on {transaction.booked_date} @ {formatted_time}.',
                    receiver_type=Notification.RECEIVER_TYPE[1][0],  # Assuming doctor is the receiver
                    notification_type=Notification.NOTIFICATION_TYPES[3][0]  # 'cancelled'
                )
                

                print('message:', f'{patient.first_name} has cancelled the appointment on {transaction.booked_date} @ {formatted_time}.')

                

                return JsonResponse({"message": "Booking canceled successfully"}, status=status.HTTP_200_OK)

            except DoctorAvailability.DoesNotExist:
                        return JsonResponse({"error": "Doctor availability not found"}, status=status.HTTP_404_NOT_FOUND)

        except Doctor.DoesNotExist:
            return JsonResponse({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

            

        except User.DoesNotExist:
            return JsonResponse({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

    except Transaction.DoesNotExist:
        return JsonResponse({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def cancel_booking_doctor(request):
    transaction_id = request.data.get('transaction_id')
    print("here i got the transaction id", transaction_id)

    try:
        transaction = Transaction.objects.get(transaction_id=transaction_id)

        patient_id = transaction.patient_id
        try:
            patient = User.objects.get(id=patient_id)
            try:
                wallet = Wallet.objects.get(patient=patient)
                try:
                    doctor = Doctor.objects.get(id=transaction.doctor_id)
                    try:
                        print('doctor in cancel doctor:',doctor)
                        print('day in cancel doctor:',transaction.booked_date,)
                        print('start_time in cancel doctor:',transaction.booked_from_time)
                        print('end_time in cancel doctor:',transaction.booked_to_time)
                        print(DoctorAvailability.objects.filter(doctor=doctor, day=transaction.booked_date, end_time=transaction.booked_to_time))
                        doctor_availability = DoctorAvailability.objects.get(
                            doctor=doctor,
                            day=transaction.booked_date,
                            start_time=transaction.booked_from_time,
                            end_time=transaction.booked_to_time
                        )

                        print('aloo ismatheeee')
                        wallet.balance += (transaction.amount)

                       
                        doctor_availability.delete()
                        wallet.save()
                        transaction.is_consultency_completed = 'REFUNDED'
                        print('Updated the doctor transaction status:', transaction.is_consultency_completed)
                        transaction.save()

                        # Sending notification to the patient
                        formatted_time = transaction.booked_from_time.strftime('%I:%M %p')
                        Notification.objects.create(
                            Patient=patient,
                            Doctor=doctor,
                            message=f'{doctor.user.first_name} has cancelled the appointment on {transaction.booked_date} @ {formatted_time}.',
                            receiver_type=Notification.RECEIVER_TYPE[0][0],  # Assuming doctor is the receiver
                            notification_type=Notification.NOTIFICATION_TYPES[3][0]  # 'cancelled'
                        )

                        print('Message:', f'{patient.first_name} has cancelled the appointment on {transaction.booked_date} @ {formatted_time}.')
                        
                        return JsonResponse({"message": "Booking cancelled successfully"}, status=status.HTTP_200_OK)

                    except DoctorAvailability.DoesNotExist:
                        return JsonResponse({"error": "Doctor availability not found"}, status=status.HTTP_404_NOT_FOUND)

                except Doctor.DoesNotExist:
                    return JsonResponse({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

            except Wallet.DoesNotExist:
                return JsonResponse({"error": "Wallet not found"}, status=status.HTTP_404_NOT_FOUND)

        except User.DoesNotExist:
            return JsonResponse({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

    except Transaction.DoesNotExist:
        return JsonResponse({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 5  # Number of items per page
    page_size_query_param = 'page_size'  # Allow client to set the page size
    max_page_size = 100  # Maximum allowed page size


@api_view(['GET'])
def PatientBookingDetailsAPIView(request, patient_id):
    print('bookig details:',request.data)
    try:
        print('Patient ID:', patient_id)
        transactions = Transaction.objects.filter(patient_id=str(patient_id)).order_by('-booked_date', '-booked_from_time')
        # print('SQL Query:', str(transactions.query))
        print('transactions:',transactions)

        # Add pagination
        paginator = PageNumberPagination()
        paginator.page_size = 5  # Set the page size
        paginated_transactions = paginator.paginate_queryset(transactions, request)
        serializer = TranscationModelListPatient(paginated_transactions, many=True)
        # response = {
        #         "status_code": status.HTTP_200_OK,
        #         "data": serializer.data
        #     }
        response = {
            "status_code": status.HTTP_200_OK,
            "data": serializer.data,
            "pagination": {
                "current_page": paginator.page.number,
                "total_pages": paginator.page.paginator.num_pages,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link()
            }
        }

        return Response(response, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def DoctorBookingDetailsAPIView(request, doctor_id):
    print('doctor_id',doctor_id)
    print('user booking details:',request.data)
    try:
        print('doctor_id:',doctor_id)
        transactions = Transaction.objects.filter(doctor_id=str(doctor_id)).order_by('-booked_date', '-booked_from_time')
        # serializer = TranscationModelListDoctor(transactions, many=True)

        # Add pagination
        paginator = PageNumberPagination()
        paginator.page_size = 5  # Set the page size
        paginated_transactions = paginator.paginate_queryset(transactions, request)
        serializer = TranscationModelListDoctor(paginated_transactions, many=True)
        # response = {
        #         "status_code": status.HTTP_200_OK,
        #         "data": serializer.data
        #     }
        
        response = {
            "status_code": status.HTTP_200_OK,
            "data": serializer.data,
            "pagination": {
                "current_page": paginator.page.number,
                "total_pages": paginator.page.paginator.num_pages,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link()
            }
        }
        return Response(response, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
    

class PatientTransactionsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        patient_id = request.query_params.get('patient_id', None)
        print(patient_id)

        if not patient_id:
            return Response({'error': 'Patient ID is required in query parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            patient = User.objects.get(id=patient_id)
        except (User.DoesNotExist, ValueError):
            raise Http404("Patient not found or invalid ID")

        transactions = Transaction.objects.filter(patient_id=patient_id, status='COMPLETED')

        processed_doctor_ids = set()
        data = []

        for transaction in transactions:
            # Check if the doctor ID has been processed before
            if transaction.doctor_id in processed_doctor_ids:
                continue

            doctor = Doctor.objects.get(id=transaction.doctor_id)
            transaction_data = {
                "transaction_id": transaction.transaction_id,
                "payment_id": transaction.payment_id,
                "order_id": transaction.order_id,
                "signature": transaction.signature,
                "amount": transaction.amount,
                "doctor_id": transaction.doctor_id,
                "patient_id": transaction.patient_id,
                "doctor_name": doctor.user.first_name,
                "doctor_profile_picture": (
                    request.build_absolute_uri('/')[:-1] + doctor.user.profile_picture.url
                ) if doctor.user.profile_picture else "",
                "booked_date": transaction.booked_date,
                "booked_from_time": transaction.booked_from_time,
                "booked_to_time": transaction.booked_to_time,
                "status": transaction.status,
                "created_at": transaction.created_at,
            }

            processed_doctor_ids.add(transaction.doctor_id)
            data.append(transaction_data)

        return Response(data, status=status.HTTP_200_OK)




class DoctorTransactionsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        doctor_id = request.query_params.get('doctor_id', None)

        if not doctor_id:
            return Response({'error': 'Doctor ID is required in query parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except (Doctor.DoesNotExist, ValueError):
            raise Http404("Doctor not found or invalid ID")

        transactions = Transaction.objects.filter(doctor_id=doctor_id, status='COMPLETED')

        processed_patient_ids = set()
        data = []

        for transaction in transactions:
            # Check if the patient ID has been processed before
            if transaction.patient_id in processed_patient_ids:
                continue

            patient = User.objects.get(id=transaction.patient_id)
            transaction_data = {
                "transaction_id": transaction.transaction_id,
                "payment_id": transaction.payment_id,
                "order_id": transaction.order_id,
                "signature": transaction.signature,
                "amount": transaction.amount,
                "doctor_id": transaction.doctor_id,
                "patient_id": transaction.patient_id,
                "patient_name": patient.first_name,
                "patient_profile_picture": (
                    request.build_absolute_uri('/')[:-1] + patient.profile_picture.url
                ) if patient.profile_picture else None,
                "booked_date": transaction.booked_date,
                "booked_from_time": transaction.booked_from_time,
                "booked_to_time": transaction.booked_to_time,
                "status": transaction.status,
                "created_at": transaction.created_at,
            }

            processed_patient_ids.add(transaction.patient_id)
            data.append(transaction_data)

        return Response(data, status=status.HTTP_200_OK)
    


class UpdateOrderAPIView(APIView):
    def patch(self, request, transaction_id):
        print('request transaction_id :',request.data)
        print('after video call transaction_id:',transaction_id)
        # Retrieve the order object using the transaction_id
        order = get_object_or_404(Transaction, transaction_id=transaction_id)

        # Update the order's status
        order.is_consultency_completed = 'COMPLETED' # Assuming 'completed' is a valid status
        order.save()

        # Serialize the updated order
        serializer = TranscationModelList(order)

        # Return the serialized order data
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class TransactionCommissionView(APIView):
    def post(self, request):
        print('request commision:',request.data)
        serializer = TransactionCommissionSerializer(data=request.data)
        if serializer.is_valid():
            print('Validated Data:', serializer.validated_data) 
            # Attempt to get the object, or create it if it doesn't exist
            transaction_commission, created = TransactionCommission.objects.get_or_create(
                transaction_id=serializer.validated_data['transaction'],
                defaults=serializer.validated_data
            )
            if created:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                # If the object already exists, update it with the new data
                for attr, value in serializer.validated_data.items():
                    setattr(transaction_commission, attr, value)
                transaction_commission.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class GetingTransaction(generics.RetrieveAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TranscationModelList  # Replace with your serializer

    def get_object(self):
        transaction_id = self.kwargs['transaction_id']
        try:
            return self.queryset.get(transaction_id=transaction_id)
        except Transaction.DoesNotExist:
            return None
        

# admin side dashboard data



class AdminDashboardDataAPIView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request, *args, **kwargs):
        total_patients = User.objects.count()
        total_doctors = Doctor.objects.count()
        total_transactions = Transaction.objects.count()
        total_revenue = Transaction.objects.aggregate(Sum('amount'))['amount__sum']
        print('revenuee ',total_revenue)

        response = {
            'total_patients': total_patients - total_doctors -1,
            'total_doctors': total_doctors,
            'total_transactions': total_transactions,
            'total_revenue': total_revenue
        }

        return JsonResponse(response, safe=False,status=status.HTTP_200_OK)
    

# class DoctorAccountTransactionsAPIView(generics.ListAPIView):
#     queryset = Transaction.objects.all()
#     serializer_class = TranscationModelList
#     pagination_class = None

#     def get_queryset(self):
#         doctor_id = self.kwargs['doctor_id']
#         doctor =Doctor.objects.get(user=doctor_id)
#         print('doctor_id in trans:',doctor_id)
#         print(Transaction.objects.filter(doctor_id=doctor.id))

#         return Transaction.objects.filter(doctor_id=doctor.id)


class DoctorAccountTransactionsAPIView(generics.ListAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TranscationModelListExtra
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        doctor = Doctor.objects.get(user=doctor_id)
        
        # Filter transactions where the consultancy is completed
        completed_transactions = Transaction.objects.filter(
            doctor_id=doctor.id,
            is_consultency_completed='COMPLETED'  # Assuming 'COMPLETED' is the correct value
        ).order_by('-transaction_id')
        
        # Debugging output
        print('doctor_id in trans:', doctor_id)
        print(completed_transactions)

        return completed_transactions
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Calculate the total amount for the doctor across all transactions
        doctor_id = self.kwargs['doctor_id']
        doctor = Doctor.objects.get(user=doctor_id)
        
        total_amount_received = Transaction.objects.filter(
            doctor_id=doctor.id,
            is_consultency_completed='COMPLETED'
        ).aggregate(total=Sum(F('amount') * 0.8))['total'] or 0

        # Add the total_amount_received to the response data
        response.data['total_amount_received'] = total_amount_received
        
        return response
