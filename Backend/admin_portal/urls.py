"""
URL patterns for the admin_portal app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuditLogViewSet, SystemMetricViewSet, SystemSettingViewSet,
    SystemNotificationViewSet, UserManagementViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet)
router.register(r'system-metrics', SystemMetricViewSet)
router.register(r'system-settings', SystemSettingViewSet)
router.register(r'notifications', SystemNotificationViewSet)
router.register(r'users', UserManagementViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]