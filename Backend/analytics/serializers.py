"""
Serializers for the analytics app.
"""
from rest_framework import serializers
from .models import HealthScore, Recommendation, Insight


class HealthScoreSerializer(serializers.ModelSerializer):
    """Serializer for the HealthScore model."""
    
    class Meta:
        model = HealthScore
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RecommendationSerializer(serializers.ModelSerializer):
    """Serializer for the Recommendation model."""
    
    class Meta:
        model = Recommendation
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        

class InsightSerializer(serializers.ModelSerializer):
    """Serializer for the Insight model."""
    
    class Meta:
        model = Insight
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class TrendAnalysisSerializer(serializers.Serializer):
    """Serializer for trend analysis results."""
    
    metric = serializers.CharField()
    time_period = serializers.CharField()
    data_points = serializers.ListField()
    trend = serializers.CharField()
    change_percentage = serializers.DecimalField(max_digits=6, decimal_places=2)
    change_direction = serializers.CharField()
    analysis = serializers.CharField()


class CorrelationAnalysisSerializer(serializers.Serializer):
    """Serializer for correlation analysis results."""
    
    metric1 = serializers.CharField()
    metric2 = serializers.CharField()
    correlation_coefficient = serializers.DecimalField(max_digits=4, decimal_places=3)
    strength = serializers.CharField()
    direction = serializers.CharField()
    analysis = serializers.CharField()