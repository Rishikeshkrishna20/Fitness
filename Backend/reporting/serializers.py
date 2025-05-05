"""
Serializers for the reporting app.
"""
from rest_framework import serializers
from .models import SavedReport, ReportTemplate, ExportedReport


class SavedReportSerializer(serializers.ModelSerializer):
    """Serializer for the SavedReport model."""
    
    class Meta:
        model = SavedReport
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for the ReportTemplate model."""
    
    class Meta:
        model = ReportTemplate
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ExportedReportSerializer(serializers.ModelSerializer):
    """Serializer for the ExportedReport model."""
    
    class Meta:
        model = ExportedReport
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class DailyReportSerializer(serializers.Serializer):
    """Serializer for daily reports."""
    
    date = serializers.DateField()
    nutrition = serializers.JSONField()
    activity = serializers.JSONField()
    sleep = serializers.JSONField()
    hydration = serializers.JSONField()
    vitals = serializers.JSONField()
    medications = serializers.JSONField()
    mood = serializers.JSONField()
    health_score = serializers.JSONField()


class WeeklyReportSerializer(serializers.Serializer):
    """Serializer for weekly reports."""
    
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    daily_summaries = serializers.ListField()
    weekly_totals = serializers.JSONField()
    weekly_averages = serializers.JSONField()
    progress = serializers.JSONField()
    insights = serializers.ListField()


class MonthlyReportSerializer(serializers.Serializer):
    """Serializer for monthly reports."""
    
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    weekly_summaries = serializers.ListField()
    monthly_totals = serializers.JSONField()
    monthly_averages = serializers.JSONField()
    trends = serializers.ListField()
    achievements = serializers.ListField()