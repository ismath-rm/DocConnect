from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from chat.consumers import ChatConsumer
from notification.consumers import NotificationConsumer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('account.api.urls')),
    path('appointment/', include('booking.api.urls')),
    path('chat/', include('chat.api.urls')),
    path('notification/', include('notification.api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

websocket_urlpatterns = [
    path('ws/chat/<int:appointment_id>/', ChatConsumer.as_asgi()),
    path('ws/notification/<str:user_type>/<str:custom_id>/', NotificationConsumer.as_asgi()),
]