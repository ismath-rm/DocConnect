from rest_framework import serializers
from account.models import Doctor, User
from notification.models import Notification


class DoctorNotifySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField() 

    class Meta:
        model = Doctor
        fields = ('custom_id', 'full_name')  

    def get_full_name(self, obj):
      
        if hasattr(obj, 'user'):
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None

class PatientNotifySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('custom_id', 'full_name')

    def get_full_name(self, obj):
      
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
