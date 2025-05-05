"""
Serializers for the health_records app.
"""
from rest_framework import serializers
from .models import (
    WorkoutLog, MealLog, WaterLog, SleepLog, VitalsLog,
    MedicationLog, MoodLog, HealthGoal
)


class WorkoutLogSerializer(serializers.ModelSerializer):
    """Serializer for the WorkoutLog model."""
    
    class Meta:
        model = WorkoutLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MealLogSerializer(serializers.ModelSerializer):
    """Serializer for the MealLog model."""
    
    class Meta:
        model = MealLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class WaterLogSerializer(serializers.ModelSerializer):
    """Serializer for the WaterLog model."""
    
    class Meta:
        model = WaterLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class SleepLogSerializer(serializers.ModelSerializer):
    """Serializer for the SleepLog model."""
    
    class Meta:
        model = SleepLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class VitalsLogSerializer(serializers.ModelSerializer):
    """Serializer for the VitalsLog model."""
    
    class Meta:
        model = VitalsLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MedicationLogSerializer(serializers.ModelSerializer):
    """Serializer for the MedicationLog model."""
    
    class Meta:
        model = MedicationLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MoodLogSerializer(serializers.ModelSerializer):
    """Serializer for the MoodLog model."""
    
    class Meta:
        model = MoodLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class HealthGoalSerializer(serializers.ModelSerializer):
    """Serializer for the HealthGoal model."""
    
    class Meta:
        model = HealthGoal
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class DailyHealthSummarySerializer(serializers.Serializer):
    """Serializer for daily health summary."""
    
    date = serializers.DateField()
    total_calories_consumed = serializers.IntegerField()
    total_calories_burned = serializers.IntegerField()
    total_water_intake = serializers.IntegerField()
    sleep_duration = serializers.DecimalField(max_digits=4, decimal_places=2)
    avg_mood = serializers.DecimalField(max_digits=3, decimal_places=1)
    workout_minutes = serializers.IntegerField()