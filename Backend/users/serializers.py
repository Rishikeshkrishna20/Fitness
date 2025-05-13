"""
Serializers for the users app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserPreference

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'date_of_birth', 
                  'height', 'weight', 'gender', 'profile_picture',
                  'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True},
            'height': {'required': True},
            'weight': {'required': True},
            'gender': {'required': True},
        }


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 
                  'height', 'weight', 'gender', 'date_of_birth']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        # Remove password_confirm from the data
        validated_data.pop('password_confirm')
        
        # Create the user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            height=validated_data['height'],
            weight=validated_data['weight'],
            gender=validated_data['gender']
        )
        
        # Create default preferences for the user
        UserPreference.objects.create(user=user)
        
        return user


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for the UserPreference model."""
    
    class Meta:
        model = UserPreference
        fields = ['id', 'theme', 'language', 'email_notifications', 
                  'push_notifications', 'measurement_system', 
                  'daily_water_goal', 'daily_calorie_goal', 
                  'daily_step_goal', 'share_health_data']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the complete user profile including preferences."""
    
    preferences = UserPreferenceSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'date_of_birth', 
                  'height', 'weight', 'gender', 'profile_picture', 
                  'preferences', 'date_joined', 'last_login']
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "New passwords do not match."})
        return attrs