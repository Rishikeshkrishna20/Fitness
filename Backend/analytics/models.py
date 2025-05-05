"""
Models for the analytics app.
"""
from django.db import models
from django.conf import settings


class HealthScore(models.Model):
    """Model for calculated health scores."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='health_scores')
    
    # Overall score and component scores
    overall_score = models.DecimalField(max_digits=5, decimal_places=2)
    nutrition_score = models.DecimalField(max_digits=5, decimal_places=2)
    activity_score = models.DecimalField(max_digits=5, decimal_places=2)
    sleep_score = models.DecimalField(max_digits=5, decimal_places=2)
    hydration_score = models.DecimalField(max_digits=5, decimal_places=2)
    vitals_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    mood_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Score metadata
    calculation_date = models.DateField()
    calculation_details = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'calculation_date')
        ordering = ['-calculation_date']
    
    def __str__(self):
        return f"{self.user.email} - Health Score: {self.overall_score} on {self.calculation_date}"


class Recommendation(models.Model):
    """Model for personalized health recommendations."""
    
    RECOMMENDATION_TYPES = [
        ('nutrition', 'Nutrition'),
        ('activity', 'Physical Activity'),
        ('sleep', 'Sleep'),
        ('hydration', 'Hydration'),
        ('vitals', 'Vital Signs'),
        ('medication', 'Medication'),
        ('mental', 'Mental Wellbeing'),
        ('general', 'General Health'),
    ]
    
    PRIORITY_LEVELS = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    priority = models.IntegerField(choices=PRIORITY_LEVELS, default=2)
    based_on = models.JSONField(help_text='Data points used to generate this recommendation')
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class Insight(models.Model):
    """Model for health trend insights generated from user data."""
    
    INSIGHT_TYPES = [
        ('trend', 'Trend Insight'),
        ('correlation', 'Correlation Insight'),
        ('progress', 'Progress Insight'),
        ('anomaly', 'Anomaly Detection'),
        ('milestone', 'Milestone Achieved'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='insights')
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    data_points = models.JSONField(help_text='Data used to generate this insight')
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"