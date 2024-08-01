from django.urls import path
from booking.api import views

urlpatterns = [

     # slot updation for a single data
    path('doctors/<int:custom_id>/slots/', views.DoctorSlotsAPIView.as_view(), name='doctor-slots-api'),

    # slot updation for a bulk data
    path('doctors/<str:custom_id>/update_slots/bulk/', views.DoctorSlotBulkUpdateView.as_view(), name='update-doctor-slots-bulk'),

    path('doctors/<str:custom_id>/update_slots/',views.DoctorSlotUpdateView.as_view(), name='update-doctor-slots'),
    path('doctors/<str:custom_id>/delete_slot/',views.DoctorSlotDeleteView.as_view(), name='delete-slot'),

    
    path("doctors/listing/",views.DoctorsUserSideList.as_view(), name="doctors-listing"),

    #  to get the single Doctor details based on the custom id
    path("detail/doctors/<str:pk>",views.DocDetailList().as_view(), name="Doc-list"),

    #  to get the single Patient details based on the custom id
    path("detail/patient/<str:pk>", views.PatientDetailList().as_view(), name="Doc-list"),

    # for to check the docotr details from the patient side
    path('patient/check/doctor/<str:custom_id>/slots/', views.PatientSlotsCheckingAPIView.as_view(), name='doctor-slots-api'),

    # for booking the slots of the doctor

    path('check-availability/', views.check_availability, name='check-availability'),

    path('create-order/', views.RazorpayOrderAPIView.as_view(), name='create_order'),

    path('complete-order/', views.TransactionAPIView.as_view(), name='complete_order'),

    path('detail/transaction/list/', views.TrasactionListAPIView.as_view(), name='doctor-slots-api'),

    path('detail/transaction/<str:pk>', views.TrasactionRetriveAPIView.as_view(), name='doctor-slots-api'),

    # for cancel the booking from the patient side

    path('cancel/booking/', views.cancel_booking, name='cancel-booking'),

    # for getting the booking details for the perticular patient for Patient side listing

    path('booking/details/patient/<str:patient_id>', views.PatientBookingDetailsAPIView, name='booking-details'),

    # for getting the booking details for the perticular Doctor for docotr side listing

    path('booking/details/doctor/<str:doctor_id>', views.DoctorBookingDetailsAPIView, name='booking-details'),


    # for getting the boking details with doctor profile and name

    path('api/patient-transactions/', views.PatientTransactionsAPIView.as_view(), name='patient-transactions'),

    # for getting the boking details with patient profile and name

    path('api/doctor-transactions/', views.DoctorTransactionsAPIView.as_view(), name='doctor-transactions'),



]