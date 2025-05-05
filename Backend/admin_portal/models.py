"""
Models for the admin_portal app.
"""
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """Model for tracking administrative actions."""
    
    ACTION_TYPES = [
        ('user_create', 'User Created'),
        ('user_update', 'User Updated'),
        ('user_delete', 'User Deleted'),
        ('user_login', 'User Login'),
        ('user_logout', 'User Logout'),
        ('data_access', 'Data Accessed'),
        ('data_export', 'Data Exported'),
        ('settings_change', 'Settings Changed'),
        ('system_event', 'System Event'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action_type} by {self.user} at {self.timestamp}"


class SystemMetric(models.Model):
    """Model for tracking system metrics."""
    
    METRIC_TYPES = [
        ('user_count', 'Total Users'),
        ('active_users', 'Active Users'),
        ('data_point_count', 'Total Data Points'),
        ('api_calls', 'API Calls'),
        ('processing_time', 'Processing Time'),
        ('error_count', 'Error Count'),
    ]
    
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPES)
    value = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.metric_type}: {self.value} at {self.timestamp}"


class SystemSetting(models.Model):
    """Model for system-wide settings."""
    
    key = models.CharField(max_length=50, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    data_type = models.CharField(max_length=20, default='string')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='system_settings')
    
    class Meta:
        ordering = ['key']
    
    def __str__(self):
        return f"{self.key}: {self.value}"


class SystemNotification(models.Model):
    """Model for system notifications."""
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    title = models.CharField(max_length=100)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    target_user_groups = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_notifications')
    
    class Meta:
        ordering = ['-priority', '-start_date']
    
    def __str__(self):
        return f"{self.title} ({self.priority})"