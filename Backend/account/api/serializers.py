from rest_framework import serializers
from account.models import *
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['first_name'] = user.first_name
        # Add other custom claims if needed
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
        exclude = ('password', 'id' ,'is_staff','is_superuser','user_type','email','profile_picture')    


# class Accountserializer(serializers.ModelSerializer):
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
            'id', 'email','username', 'first_name', 'last_name', 'phone_number', 'blood_group', 'date_of_birth', 
            'gender', 'profile_picture', 'street', 'city', 'state', 'zip_code', 'country'
        ]
        extra_kwargs = {
            'email': {'read_only': True},
        }



class AdminDocUpdateSerializer(serializers.ModelSerializer):
    user=DOCUserSerializer()
    class Meta:
        model = Doctor
        fields='__all__' 
        
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {}) # this is used to pop out the user object and if it is not existing then we will assign a {} to it as default
        user_serializer = UserSerializer(instance.user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        return super().update(instance, validated_data)



class VerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Verification
        fields = '__all__' 
    
