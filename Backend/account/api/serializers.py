from rest_framework import serializers
from account.models import *
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['first_name'] = user.first_name
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password', )
    def get_profile_pic(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            return request.build_absolute_uri('/')[:-1] + obj.profile_picture.url
        return None
    
class DOCUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        exclude = ('password', 'id' ,'is_staff','is_superuser','user_type','email') 


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'is_active', 'first_name', 'last_name', 'user_type', 'phone_number']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data.get('password'))
        validated_data['is_active'] = True
        return super(UserRegisterSerializer, self).create(validated_data)



class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data




class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 
            'gender', 'profile_picture', 'street', 'city', 'state', 'zip_code', 'country', 'blood_group',
        ]
        
        extra_kwargs = {
            'email': {'read_only': True},
        }
   
class UpdateAdminDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class AdminDocUpdateSerializer(serializers.ModelSerializer):
    user=DOCUserSerializer()
    class Meta:
        model = Doctor
        fields='__all__' 
        
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {}) 
        user_serializer = DOCUserSerializer(instance.user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            print(user_serializer.errors)
        return super().update(instance, validated_data)



class VerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Verification
        fields = '__all__' 
    


    
class AdminPatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "gender",
            "phone_number",
            "date_of_birth",
            "street",
            "city",
            "state",
            "zip_code",
            "country",
            "is_id_verified",
            "is_email_verified",
            "is_active",
            "blood_group",
        ]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance    

class PatientUserSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = User
        exclude = ('password','is_id_verified', 'is_email_verified', 'is_staff', 'is_superuser', 'user_type')



class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'



class UserDetailsUpdateSerializer(serializers.ModelSerializer):
    doctor_user=DoctorSerializer(read_only=True)
    class Meta:
        model = User
        exclude = ('password','is_id_verified','is_email_verified','is_staff','is_superuser','user_type')


class adminDocVerificationSerializer(serializers.ModelSerializer):
    user=DOCUserSerializer()
    class Meta:
        model = Verification
        fields='__all__'

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {}) 
        user_serializer = UserSerializer(instance.user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        return super().update(instance, validated_data)
    
class PatientCustomIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['custom_id']      


class DoctorCustomIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['custom_id', 'id']     

    
class UserPatientCustomIDSerializer(serializers.ModelSerializer):
    patient_user=PatientCustomIDSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id','first_name','patient_user']   


class UserDoctorCustomIDSerializer(serializers.ModelSerializer):
    doctor_user=DoctorCustomIDSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id','first_name','doctor_user']     
 


class WalletUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        exclude = ['patient']