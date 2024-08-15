from django.urls import path
from account.api import views
from rest_framework_simplejwt.views import(TokenObtainPairView,TokenRefreshView)

 


urlpatterns = [
    path('token',TokenObtainPairView.as_view(),name='tocken_obtain_pair'),
    path('token/refresh',TokenRefreshView.as_view,name='tocken_refresh'),

                    
    path ('signup/',views.RegisterView.as_view(),name='signup'),
    path('verify-otp/', views.OTPVerificationView.as_view(), name='verify-otp'),
    path('resend-otp/', views.ResendOTPView.as_view(), name='resend-otp'),
    path("login", views.UserLogin.as_view(), name="user-login"),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', views.ResetPasswordView.as_view(), name='reset_password'),
    path('logout', views.LogoutView.as_view(), name='logout'),



    path("user/details/", views.UserDetails.as_view(), name="user-details"),
    path('user/profile/update/', views.UserProfileView.as_view(), name='user-profile'),
        
    path("doc/pro/<int:user_id>/", views.DocProfileUpdate().as_view(), name="Doc-profile"),
    path('verification/doctor/<int:user__id>/', views.VarificationDoctorView.as_view(), name='verification-doctor'),


    path("admin/patient/<str:pk>", views.AdminPatientUpdate().as_view(), name="adminPatient-Update"),
    path("patient/details/", views.PatientUseDetailsUpdate.as_view(), name="patient-details"),
    
    path("admin/doc/<str:pk>/", views.AdminDocUpdate().as_view(), name="adminDoc-update"),
    path("admin/doc/update/<int:doctor_user__id>/", views.UpdateAdminDoc().as_view(), name="adminDoc-update"),
    path("doctors/details/", views.UserDetailsUpdate.as_view(), name="doctors-details"),


    path("admin/doctor/verication/list/", views.AdminDoctorApprovalListView.as_view(), name="admin-verification-doctor-list"),

      # for verification file for admin

    path('admin/verification/doctor/<str:user__id>/', views.AdminDocVerificationView.as_view(), name='admin-verification-doctor'),

    # for getting the patient cusom id using user id

    path("custom-id/patient/<str:pk>",views.PatientCustomIdView.as_view(),name="custom-id-patient"),

    # for getting the Doctor cusom id using user id

    path("custom-id/doctor/<str:pk>",views.DoctorCustomIdView.as_view(),name="custom-id-doctor"),

    # for getting the patient wallet amount
    path("wallet/amount/<str:patient_id>", views.WalletAmountView.as_view(), name="wallet-amount"),




    
]