from account.models import *
from rest_framework import serializers
from booking.models import *
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError


class DoctorSlotUpdateSerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.DictField())

    def validate(self, data):
        date = data.get('date')
        slots = data.get('slots')

        for slot_data in slots:
            from_time = datetime.strptime(slot_data.get('from_time'), '%H:%M:%S')
            to_time = datetime.strptime(slot_data.get('to_time'), '%H:%M:%S')

            # Check if the slot already exists for the specified date and time range
            if DoctorAvailability.objects.filter(doctor=self.context.get('doctor'), day=date, start_time__lt=to_time, end_time__gt=from_time).exists():
                raise ValidationError("Overlapping slots are not allowed.", code='overlap_error')

        return data

    def update_doctor_slots(self, doctor):
        try:
            date = self.validated_data.get('date')
            for slot_data in self.validated_data.get('slots'):
                from_time = datetime.strptime(slot_data.get('from_time'), '%H:%M:%S')
                to_time = datetime.strptime(slot_data.get('to_time'), '%H:%M:%S')

                DoctorAvailability.objects.create(
                    doctor=doctor,
                    day=date,
                    start_time=from_time,
                    end_time=to_time
                )

            return True

        except Exception as e:
            raise serializers.ValidationError(f"Error updating doctor slots: {str(e)}")



class DoctorSlotBulkUpdateSerializer(serializers.Serializer):
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    slots = serializers.ListField(child=serializers.DictField())

    def validate(self, data):
        from_date = data.get('from_date')
        to_date = data.get('to_date')
        slots = data.get('slots')

        if len(slots) != 1:
            raise ValidationError("Only one time slot is allowed for the entire date range.", code='invalid_slots')

        slot_data = slots[0]
        from_time = datetime.strptime(slot_data.get('from_time'), '%H:%M:%S')
        to_time = datetime.strptime(slot_data.get('to_time'), '%H:%M:%S')

        if from_time >= to_time:
            raise ValidationError("Invalid time range. 'from_time' should be before 'to_time'.", code='invalid_time_range')

        return data

    def update_doctor_slots(self, doctor):
        try:
            from_date = self.validated_data['from_date']
            to_date = self.validated_data['to_date']
            slots = self.validated_data['slots']
            slot_data = slots[0]  # Only one slot is allowed

            current_date = from_date
            while current_date <= to_date:
                date_str = current_date.strftime('%Y-%m-%d')
                from_time = datetime.strptime(slot_data['from_time'], '%H:%M:%S')
                to_time = datetime.strptime(slot_data['to_time'], '%H:%M:%S')

                # Check if the slot already exists for the specified date and time range
                if DoctorAvailability.objects.filter(doctor=doctor, day=current_date, start_time__lt=to_time, end_time__gt=from_time).exists():
                    raise ValidationError(f"Overlapping slots are not allowed for {date_str}.", code='overlap_error')

                DoctorAvailability.objects.create(
                    doctor=doctor,
                    day=current_date,
                    start_time=from_time,
                    end_time=to_time
                )

                current_date += timedelta(days=1)

            return True

        except Exception as e:
            raise serializers.ValidationError(f"Error updating doctor slots: {str(e)}")

class TranscationModelList(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


# serializer used list out all the docotrs based on the filter


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class UserDetailsUpdateSerializer(serializers.ModelSerializer):
    doctor_user=DoctorSerializer(read_only=True)
    class Meta:
        model = User
        exclude = ('password','is_id_verified','is_email_verified','is_staff','is_superuser','user_type')   


class DOCUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password', 'id' ,'is_staff','is_superuser','user_type')

class AdminDocUpdateSerializer(serializers.ModelSerializer):
    user=DOCUserSerializer()
    class Meta:
        model = Doctor
        fields='__all__' 


class AdminPatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password', 'is_staff', 'is_superuser', 'user_type')

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        # Add other fields as needed
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_email_verified = validated_data.get('is_email_verified', instance.is_email_verified)
        instance.is_id_verified = validated_data.get('is_id_verified', instance.is_id_verified)

        instance.save()
        return instance


# Docotr bookin serializer
        
class RazorpayOrderSerializer(serializers.Serializer):
    amount = serializers.IntegerField()
    currency = serializers.CharField()

class TranscationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [ 'payment_id', 'order_id', 'signature', 'amount', 'doctor_id', 'patient_id', 'booked_date', 'booked_from_time', 'booked_to_time']

