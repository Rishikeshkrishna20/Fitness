"""
Serializers for the admin_portal app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AuditLog, SystemMetric, SystemSetting, SystemNotification

User = get_user_model()


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for the AuditLog model."""
    
    user = serializers.StringRelatedField()
    
    class Meta:
        model = AuditLog
        fields = '__all__'


class SystemMetricSerializer(serializers.ModelSerializer):
    """Serializer for the SystemMetric model."""
    
    class Meta:
        model = SystemMetric
        fields = '__all__'


class SystemSettingSerializer(serializers.ModelSerializer):
    """Serializer for the SystemSetting model."""
    
    updated_by = serializers.StringRelatedField()
    
    class Meta:
        model = SystemSetting
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SystemNotificationSerializer(serializers.ModelSerializer):
    """Serializer for the SystemNotification model."""
    
    created_by = serializers.StringRelatedField()
    
    class Meta:
        model = SystemNotification
        fields = '__all__'
        read_only_fields = ['created_at', 'created_by']


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for user management in the admin portal."""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'date_of_birth',
            'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login'
        ]


class SystemDashboardSerializer(serializers.Serializer):
    """Serializer for the system dashboard data."""
    
    total_users = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    active_users_week = serializers.IntegerField()
    active_users_month = serializers.IntegerField()
    
    total_health_records = serializers.IntegerField()
    records_today = serializers.IntegerField()
    records_week = serializers.IntegerField()
    records_month = serializers.IntegerField()
    
    system_health = serializers.CharField()
    current_errors = serializers.IntegerField()
    average_response_time = serializers.FloatField()
    
    recent_audit_logs = AuditLogSerializer(many=True)
    system_metrics = serializers.DictField()