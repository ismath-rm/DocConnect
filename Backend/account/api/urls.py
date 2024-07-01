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
    path('verification/doctor/<str:user__id>/', views.VarificationDoctorView.as_view(), name='verification-doctor'),

    path("admin/doc/<int:user__id>/", views.AdminDocUpdate().as_view(), name="adminDoc-update"),
    
]