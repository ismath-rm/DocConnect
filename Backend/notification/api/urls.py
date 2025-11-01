from django.urls import path
from notification.api import views

urlpatterns = [
    path('notifications/<str:user_type>/<str:custom_id>/', views.NotificationMessagesAPIView.as_view(), name='notification-messages'),
    
    path('update-notification/<int:pk>/', views.UpdateNotificationSeenStatusView.as_view(), name='update-notification'),
]
