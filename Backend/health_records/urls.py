"""
URL patterns for the health_records app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutLogViewSet, MealLogViewSet, WaterLogViewSet, SleepLogViewSet,
    VitalsLogViewSet, MedicationLogViewSet, MoodLogViewSet, HealthGoalViewSet,
    HealthSummaryViewSet
)

router = DefaultRouter()
router.register(r'workouts', WorkoutLogViewSet)
router.register(r'meals', MealLogViewSet)
router.register(r'water', WaterLogViewSet)
router.register(r'sleep', SleepLogViewSet)
router.register(r'vitals', VitalsLogViewSet)
router.register(r'medications', MedicationLogViewSet)
router.register(r'mood', MoodLogViewSet)
router.register(r'goals', HealthGoalViewSet)
router.register(r'summary', HealthSummaryViewSet, basename='summary')

urlpatterns = [
    path('', include(router.urls)),
]