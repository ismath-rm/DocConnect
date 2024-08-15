# from rest_framework import serializers
# from account.models import *
# from notification.models import *



# class DoctorNotifySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Doctor
#         fields = ('custom_id', 'full_name')



# class NotificationSerializer(serializers.ModelSerializer):
#     from_user = DoctorNotifySerializer(read_only=True)

#     class Meta:
#         model = Notification
#         fields = '__all__'
#         read_only_fields = ('notification_type',)

#     def validate_notification_type(self, value):
#         choices = dict(Notification.NOTIFICATION_TYPES)
#         if value not in choices:
#             raise serializers.ValidationError("Invalid notification type.")
#         return value



from rest_framework import serializers
from account.models import Doctor, User
from notification.models import Notification

# class DoctorNotifySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Doctor
#         fields = ('custom_id', 'full_name')
#     def get_full_name(self, obj):
#         print(" obj in doctor",obj)
#         return f"{obj.user.first_name} {obj.user.last_name}"

class DoctorNotifySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()  # Define full_name as a method field

    class Meta:
        model = Doctor
        fields = ('custom_id', 'full_name')  # Include only fields that are in the model or method fields

    def get_full_name(self, obj):
        # Ensure obj has the expected attributes
        if hasattr(obj, 'user'):
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None

class PatientNotifySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('custom_id', 'full_name')

    def get_full_name(self, obj):
        # Concatenate first_name and last_name to form full_name
        return f"{obj.first_name} {obj.last_name}".strip()

    

class NotificationSerializer(serializers.ModelSerializer):
    from_user = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('notification_type',)

    def get_from_user(self, obj):
        if obj.receiver_type == 'doctor':
            return DoctorNotifySerializer(obj.Doctor).data
        elif obj.receiver_type == 'patient':
            return PatientNotifySerializer(obj.Patient).data
        return None

    def validate_notification_type(self, value):
        choices = dict(Notification.NOTIFICATION_TYPES)
        if value not in choices:
            raise serializers.ValidationError("Invalid notification type.")
        return value
