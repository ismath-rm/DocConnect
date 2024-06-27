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
    