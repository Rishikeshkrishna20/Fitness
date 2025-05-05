"""
URL patterns for the reporting app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SavedReportViewSet, ReportTemplateViewSet, ExportedReportViewSet,
    ReportGenerationViewSet, ExportReportViewSet
)

router = DefaultRouter()
router.register(r'saved-reports', SavedReportViewSet)
router.register(r'templates', ReportTemplateViewSet)
router.register(r'exported-reports', ExportedReportViewSet)
router.register(r'generate', ReportGenerationViewSet, basename='generate')
router.register(r'export', ExportReportViewSet, basename='export')

urlpatterns = [
    path('', include(router.urls)),
]