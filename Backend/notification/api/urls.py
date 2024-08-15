# from django.urls import path
# from notification.api import views

# urlpatterns = [
    
#     path('doctor-side/doctor-notification/<str:custom_id>/', views.NotificationMessagesAPIView.as_view(), name='doc-notification-messages'),
#     path('update-notification/<int:pk>/', views.UpdateNotificationSeenStatusView.as_view(), name='update-notification'),

    
# ]

from django.urls import path
from notification.api import views

urlpatterns = [
    # This handles notifications for both doctors and patients based on the user_type
    path('notifications/<str:user_type>/<str:custom_id>/', views.NotificationMessagesAPIView.as_view(), name='notification-messages'),
    
    # This remains the same for updating the notification seen status
    path('update-notification/<int:pk>/', views.UpdateNotificationSeenStatusView.as_view(), name='update-notification'),
]
