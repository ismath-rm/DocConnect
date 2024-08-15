from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from account.models import *


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('booked', 'New Booked'),
        ('pending', 'New Pending'),
        ('completed', 'New Completed'),
        ('cancelled', 'New Cancelled'),
    ]

    RECEIVER_TYPE = [
        ('patient', 'PATIENT'),
        ('doctor', 'DOCTOR'),
    ]

    Patient = models.ForeignKey(User, related_name="notification_to", on_delete=models.CASCADE, null=True)
    Doctor = models.ForeignKey(Doctor, related_name="notification_from", on_delete=models.CASCADE, null=True)
    receiver_type = models.CharField(choices=RECEIVER_TYPE, max_length=30, null=True)
    message = models.CharField(max_length=250, null=True)
    notification_type = models.CharField(choices=NOTIFICATION_TYPES, max_length=50)
    created = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.Patient.first_name} sent a {self.notification_type} notification to {self.Doctor.user.first_name}"

# Define signal inside the model
# @receiver(post_save, sender=Notification)
# def create_notification_for_Doctor(sender, instance, created, **kwargs):
#     print("Signal triggered!")
#     doctor = instance.Doctor
#     if doctor and created:
#         print("Notification created for Doctor:", doctor)

#         # Send notification using channels to doctor's channel
#         channel_layer = get_channel_layer()
#         doctor_channel = f"notify_{instance.Doctor.custom_id}"
#         serialized_instance = NotificationSerializer(instance).data

#         async_to_sync(channel_layer.group_send)(
#             doctor_channel,
#             {
#                 "type": "send_notification",
#                 "value": json.dumps(serialized_instance),
#             }
#         )


@receiver(post_save, sender=Notification)
def create_notification(sender, instance, created, **kwargs):
    print('haiiiiiiiiiiiiiiiiiiiiiiiigggggggggggggg',instance)
    if created:
        print('haiiiiiiiiiiiiiiiiiiiiiioooooooooooooooooooooo')
        from notification.api.serializers import NotificationSerializer  # Import here to avoid circular import

        channel_layer = get_channel_layer()
        print('got it now',channel_layer)
        try:

            serialized_instance = NotificationSerializer(instance).data
            print('this is sirilizer',serialized_instance)

        except Exception as e:
            print(f"Error serializing instance: {e}")
            return


            

        
        try:
            if instance.receiver_type == 'doctor' and instance.Doctor:
                room_group_name = f"notify_doctor_{instance.Doctor.custom_id}"
            elif instance.receiver_type == 'patient' and instance.Patient:
                room_group_name = f"notify_patient_{instance.Patient.custom_id}"
            else:
                print('Invalid receiver type or missing instance. Receiver type:', instance.receiver_type)
                return

            async_to_sync(channel_layer.group_send)(
                room_group_name,
                {
                    "type": "send_notification",
                    "value": json.dumps(serialized_instance),
                }
            )
            print('Notification sent to room group:', room_group_name)

        except Exception as e:
            print(f"Error sending notification: {e}")