"""
URL patterns for the analytics app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HealthScoreViewSet, RecommendationViewSet, InsightViewSet,
    TrendAnalysisViewSet, CorrelationAnalysisViewSet, GoalTrackingViewSet
)

router = DefaultRouter()
router.register(r'health-scores', HealthScoreViewSet)
router.register(r'recommendations', RecommendationViewSet)
router.register(r'insights', InsightViewSet)
router.register(r'trends', TrendAnalysisViewSet, basename='trends')
router.register(r'correlations', CorrelationAnalysisViewSet, basename='correlations')
router.register(r'goals', GoalTrackingViewSet, basename='goal-tracking')

urlpatterns = [
    path('', include(router.urls)),
]