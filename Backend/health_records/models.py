"""
Models for the health_records app.
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class WorkoutLog(models.Model):
    """Model for tracking workout activities."""
    
    WORKOUT_TYPES = [
        ('cardio', 'Cardio'),
        ('strength', 'Strength Training'),
        ('flexibility', 'Flexibility & Mobility'),
        ('sports', 'Sports & Recreation'),
        ('crossfit', 'CrossFit'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_logs')
    workout_type = models.CharField(max_length=20, choices=WORKOUT_TYPES)
    activity = models.CharField(max_length=100)
    duration = models.IntegerField(help_text='Duration in minutes')
    calories_burned = models.PositiveIntegerField(null=True, blank=True)
    distance = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Distance in kilometers')
    notes = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.user.email} - {self.activity} on {self.date}"


class MealLog(models.Model):
    """Model for tracking meals and nutrition."""
    
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meal_logs')
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    food_items = models.JSONField(help_text='List of food items with nutritional info')
    total_calories = models.PositiveIntegerField()
    protein = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Protein in grams')
    carbs = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Carbohydrates in grams')
    fat = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Fat in grams')
    notes = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.user.email} - {self.meal_type} on {self.date}"


class WaterLog(models.Model):
    """Model for tracking water intake."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_logs')
    amount = models.PositiveIntegerField(help_text='Amount in milliliters')
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.user.email} - {self.amount}ml on {self.date}"


class SleepLog(models.Model):
    """Model for tracking sleep patterns."""
    
    SLEEP_QUALITY_CHOICES = [
        (1, 'Very Poor'),
        (2, 'Poor'),
        (3, 'Fair'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sleep_logs')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.DecimalField(max_digits=4, decimal_places=2, help_text='Duration in hours')
    quality = models.IntegerField(choices=SLEEP_QUALITY_CHOICES)
    interruptions = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.user.email} - {self.duration}hrs on {self.start_time.date()}"


class VitalsLog(models.Model):
    """Model for tracking vital signs."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vitals_logs')
    heart_rate = models.PositiveSmallIntegerField(null=True, blank=True, help_text='Heart rate in bpm')
    blood_pressure_systolic = models.PositiveSmallIntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.PositiveSmallIntegerField(null=True, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text='Body temperature in °C')
    oxygen_saturation = models.PositiveSmallIntegerField(null=True, blank=True, help_text='Blood oxygen level in percentage')
    glucose = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text='Blood glucose in mg/dL')
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text='Weight in kg')
    notes = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.user.email} - Vitals on {self.date}"


class MedicationLog(models.Model):
    """Model for tracking medication intake."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medication_logs')
    medication_name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    dosage_unit = models.CharField(max_length=20)
    taken = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.user.email} - {self.medication_name} on {self.date}"


class MoodLog(models.Model):
    """Model for tracking mood and emotional wellbeing."""
    
    MOOD_CHOICES = [
        (1, 'Very Poor'),
        (2, 'Poor'),
        (3, 'Neutral'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mood_logs')
    mood = models.IntegerField(choices=MOOD_CHOICES)
    energy = models.IntegerField(choices=MOOD_CHOICES, null=True, blank=True)
    stress = models.IntegerField(choices=MOOD_CHOICES, null=True, blank=True)
    notes = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.user.email} - Mood: {self.get_mood_display()} on {self.date}"


class HealthGoal(models.Model):
    """Model for setting and tracking health goals."""
    
    GOAL_TYPES = [
        ('weight', 'Weight Management'),
        ('activity', 'Physical Activity'),
        ('nutrition', 'Nutrition'),
        ('sleep', 'Sleep'),
        ('water', 'Hydration'),
        ('medication', 'Medication Adherence'),
        ('custom', 'Custom Goal'),
    ]
    
    GOAL_STATUS = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='health_goals')
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    target_value = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=20, blank=True)
    start_date = models.DateField()
    target_date = models.DateField()
    status = models.CharField(max_length=20, choices=GOAL_STATUS, default='active')
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='Progress in percentage')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"