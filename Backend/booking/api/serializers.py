from account.models import *
from rest_framework import serializers
from booking.models import *
from datetime import datetime, timedelta,time
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


class AdvancedSlotUpdateSerializer(serializers.Serializer):
    fromDate = serializers.DateField()
    toDate = serializers.DateField()
    fromTimeInMinutes = serializers.TimeField()
    toTimeInMinutes = serializers.TimeField()
    bufferTimeInMinutes = serializers.IntegerField()
    fromBreakTimeInMinutes = serializers.TimeField()
    toBreakTimeInMinutes = serializers.TimeField()
    workingdaysOfWeek = serializers.ListField(child=serializers.CharField())
    slot_duration = serializers.IntegerField()

    def validate(self, data):
        from_date = data['fromDate']
        to_date = data['toDate']
        from_time = data['fromTimeInMinutes']
        to_time = data['toTimeInMinutes']
        buffer_time = data['bufferTimeInMinutes']
        break_start_time = data['fromBreakTimeInMinutes']
        break_end_time = data['toBreakTimeInMinutes']
        working_days = data['workingdaysOfWeek']
        slot_duration = data['slot_duration']

        if from_date > to_date:
            raise serializers.ValidationError("Invalid date range. 'fromDate' should be before or equal to 'toDate'.")

        if from_time >= to_time:
            raise serializers.ValidationError("Invalid time range. 'fromTimeInMinutes' should be before 'toTimeInMinutes'.")

        if break_start_time >= break_end_time:
            raise serializers.ValidationError("Invalid break time range. 'fromBreakTimeInMinutes' should be before 'toBreakTimeInMinutes'.")

        return data

    def update_doctor_slots(self, doctor):
        try:
            from_date = self.validated_data['fromDate']
            to_date = self.validated_data['toDate']
            working_days = self.validated_data['workingdaysOfWeek']
            slot_duration = self.validated_data['slot_duration']
            break_start_time = self.validated_data['fromBreakTimeInMinutes']
            break_end_time = self.validated_data['toBreakTimeInMinutes']
            from_time = self.validated_data['fromTimeInMinutes']
            to_time = self.validated_data['toTimeInMinutes']
            buffer_time = self.validated_data['bufferTimeInMinutes']

            current_date = from_date
            all_slots = []

            while current_date <= to_date:
                day_str = current_date.strftime('%Y-%m-%d')
                if current_date.weekday() in [self.get_weekday_number(weekday) for weekday in working_days]:
                    slots = self.create_slots_for_day(doctor, current_date, slot_duration, break_start_time, break_end_time, from_time, to_time, buffer_time)
                    all_slots.append({"day": day_str, "slots": slots})
                current_date += timedelta(days=1)

            return all_slots

        except Exception as e:
            raise serializers.ValidationError(f"Error updating doctor slots: {str(e)}")

    def create_slots_for_day(self, doctor, current_date, slot_duration, break_start_time, break_end_time, from_time, to_time, buffer_time):
        working_days = self.validated_data['workingdaysOfWeek']

        if current_date.weekday() not in [self.get_weekday_number(weekday) for weekday in working_days]:
            return []  # No slots for non-working days

        slots = []
        current_time = self.time_to_minutes(from_time)

        while current_time + (slot_duration + buffer_time) <= self.time_to_minutes(to_time):
            # Check if the current time falls within the break time range
            if break_start_time <= self.minutes_to_time(current_time) < break_end_time:
                current_time += slot_duration + buffer_time
                continue  # Skip slot creation during break time

            slot_start_time = self.minutes_to_time(current_time)
            slot_end_time = self.minutes_to_time(current_time + slot_duration)

            # Check for overlap or duplication of slots
            if not DoctorAvailability.objects.filter(doctor=doctor, day=current_date, start_time__lt=slot_end_time, end_time__gt=slot_start_time).exists():
                DoctorAvailability.objects.create(
                    doctor=doctor,
                    day=current_date,
                    start_time=slot_start_time,
                    end_time=slot_end_time
                )
                slots.append({"start_time": slot_start_time.strftime('%H:%M:%S'), "end_time": slot_end_time.strftime('%H:%M:%S')})

            current_time += slot_duration + buffer_time

        return slots


    @staticmethod
    def get_weekday_number(weekday):
        weekdays_map = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6}
        return weekdays_map.get(weekday)

    @staticmethod
    def time_to_minutes(time_obj):
        return time_obj.hour * 60 + time_obj.minute

    @staticmethod
    def minutes_to_time(minutes):
        return time(minutes // 60, minutes % 60)


class TransactionCommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCommission
        fields = '__all__' 



class TranscationModelList(serializers.ModelSerializer):
    
    class Meta:
        model = Transaction
        fields = '__all__'

class TranscationModelListExtra(serializers.ModelSerializer):
    # docter_total=serializers.SerializerMethodField()
    class Meta:
        model = Transaction
        fields = ['transaction_id','patient_id','amount']

    # def get_docter_total(self,obj):
    #     total = 0
    #     transaction = Transaction.objects.filter(transaction_id=obj.transaction_id)
    #     print("inside serializer....",transaction)
    #     for items in transaction:
    #         total += (items.amount*0.8)
    #     return total

class TranscationModelListDoctor(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField()
    class Meta:
        model = Transaction
        fields = '__all__'

    def get_patient_details(self,obj):
        print('Entering get_pateint_details')  # Debugging statement
        print(f'Patient ID: {obj.patient_id}')  # Debugging statement
        try:
            patient = User.objects.get(id=obj.patient_id)
            return AdminPatientUpdateSerializer(patient).data
        except User.DoesNotExist:
            return None


class TranscationModelListPatient(serializers.ModelSerializer):
    doctor_details = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'
    def get_doctor_details(self, obj):
        print('Entering get_doctor_details')  # Debugging statement
        print(f'Doctor ID: {obj.doctor_id}')  # Debugging statement
        try:
            doctor = Doctor.objects.get(id=obj.doctor_id)
            return AdminDocUpdateSerializer(doctor).data
        except Doctor.DoesNotExist:
            return None


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

