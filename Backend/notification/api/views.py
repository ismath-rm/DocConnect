# from rest_framework.response import Response
# from notification.api.serializers import *
# from account.models import *
# from notification.models import *
# from rest_framework import generics, permissions
# from rest_framework import status


# class DoctorNotificationMessagesAPIView(generics.ListAPIView):
#     serializer_class = NotificationSerializer

#     def get_queryset(self, custom_id):
#         print('custum id in notification',custom_id)
#         user = Doctor.objects.get(custom_id=custom_id)
#         print('user in notification',user)
#         return Notification.objects.filter(Doctor=user, receiver_type='doctor').exclude(is_seen=True).order_by('-created')

#     def get(self, request, custom_id, *args, **kwargs):
#         try:
#             queryset = self.get_queryset(custom_id)
#             notification_count = queryset.count()
#             serializer = self.get_serializer(queryset, many=True)
#             response_data = {
#                 'notifications': serializer.data,
#                 'notification_count': notification_count,
#             }
#             return Response(response_data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


# class UpdateNotificationSeenStatusView(generics.UpdateAPIView):
#     queryset = Notification.objects.all()
#     serializer_class = NotificationSerializer

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         instance.is_seen = True
#         instance.save()
#         return Response({'status': 'success', 'message': 'Notification seen status updated'}, status=status.HTTP_200_OK)
    



from rest_framework.response import Response
from rest_framework import generics, permissions, status
from account.models import Doctor, User  # Import both models
from notification.models import Notification
from notification.api.serializers import NotificationSerializer

class NotificationMessagesAPIView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self, custom_id, user_type):
        custom_id = self.kwargs.get('custom_id')
        user_type = self.kwargs.get('user_type')

        print(f"Fetching queryset for custom_id: {custom_id}, user_type: {user_type}")
        if user_type == 'doctor':
            user = Doctor.objects.get(custom_id=custom_id)
            return Notification.objects.filter(Doctor=user, receiver_type='doctor').exclude(is_seen=True).order_by('-created')
        elif user_type == 'patient':
            user = User.objects.get(id=custom_id)
            return Notification.objects.filter(Patient=user, receiver_type='patient').exclude(is_seen=True).order_by('-created')
        else:
            print("Invalid user type encountered")
            raise ValueError("Invalid user type")

    def get(self, request, custom_id, user_type, *args, **kwargs):

        try:
            queryset = self.get_queryset(custom_id, user_type)
            notification_count = queryset.count()
            print(f"Notification count: {notification_count}")
            serializer = self.get_serializer(queryset, many=True)
            response_data = {
                'notifications': serializer.data,
                'notification_count': notification_count,
            }

            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"An error occurred: {e}")
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateNotificationSeenStatusView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_seen = True
        instance.save()
        return Response({'status': 'success', 'message': 'Notification seen status updated'}, status=status.HTTP_200_OK)
