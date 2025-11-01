from django.urls import path
from booking.api import views

urlpatterns = [

    path('doctors/<int:custom_id>/slots/', views.DoctorSlotsAPIView.as_view(), name='doctor-slots-api'),

    
    path('doctors/<str:custom_id>/update_slots/bulk/', views.DoctorSlotBulkUpdateView.as_view(), name='update-doctor-slots-bulk'),

    
    path('doctors/<str:custom_id>/update_slots/advanced/', views.AdvancedSlotUpdateView.as_view(), name='update-doctor-advacedSlot'),


    path('doctors/<str:custom_id>/update_slots/',views.DoctorSlotUpdateView.as_view(), name='update-doctor-slots'),
    path('doctors/<str:custom_id>/delete_slot/',views.DoctorSlotDeleteView.as_view(), name='delete-slot'),

    
    path("doctors/listing/",views.DoctorsUserSideList.as_view(), name="doctors-listing"),

    
    path("detail/doctors/<str:pk>",views.DocDetailList().as_view(), name="Doc-list"),

    
    path("detail/patient/<str:pk>", views.PatientDetailList().as_view(), name="Doc-list"),

    
    path('patient/check/doctor/<str:custom_id>/slots/', views.PatientSlotsCheckingAPIView.as_view(), name='doctor-slots-api'),

    

    path('check-availability/', views.check_availability, name='check-availability'),

    path('create-order/', views.RazorpayOrderAPIView.as_view(), name='create_order'),

    path('complete-order/', views.TransactionAPIView.as_view(), name='complete_order'),

    path('detail/transaction/list/', views.TrasactionListAPIView.as_view(), name='doctor-slots-api'),

    path('detail/transaction/<str:pk>', views.TrasactionRetriveAPIView.as_view(), name='doctor-slots-api'),

    

    path('wallet/payment/', views.PayUsingWalletAPIview.as_view(), name='wallet_order-payment'),



    path('cancel/booking/', views.cancel_booking, name='cancel-booking'),

    path('cancel/booking/doctor/', views.cancel_booking_doctor, name='cancel-booking'),

    path('api/available-slots/<str:transaction_id>/', views.available_slots, name='available-slots'),

    path('api/rebook/<str:transaction_id>/', views.rebook_appointment.as_view(), name='rebook-appointment'),
    


   
    path('booking/details/patient/<str:patient_id>', views.PatientBookingDetailsAPIView, name='booking-details'),

    path('booking/details/doctor/<str:doctor_id>', views.DoctorBookingDetailsAPIView, name='booking-details'),



    path('api/patient-transactions/', views.PatientTransactionsAPIView.as_view(), name='patient-transactions'),


    path('api/doctor-transactions/', views.DoctorTransactionsAPIView.as_view(), name='doctor-transactions'),

    path('update-order/<str:transaction_id>/', views.UpdateOrderAPIView.as_view(), name='update_order'),

    path('geting/transaction/<str:transaction_id>/', views.GetingTransaction.as_view(), name='transaction_'),

    path('transactionCommission/', views.TransactionCommissionView.as_view(), name='transaction_commission'),



    path('api/admin-transactions/', views.AdminDashboardDataAPIView.as_view(), name='admin-transactions'),

    path('api/transactions-doctor-account/<str:doctor_id>/', views.DoctorAccountTransactionsAPIView.as_view(), name='patient-transactions'),
]