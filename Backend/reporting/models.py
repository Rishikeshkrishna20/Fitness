"""
Models for the reporting app.
"""
from django.db import models
from django.conf import settings


class SavedReport(models.Model):
    """Model for user-saved reports."""
    
    REPORT_TYPES = [
        ('daily', 'Daily Summary'),
        ('weekly', 'Weekly Summary'),
        ('monthly', 'Monthly Summary'),
        ('custom', 'Custom Report'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parameters = models.JSONField(help_text='Parameters used to generate this report')
    data = models.JSONField(help_text='Actual report data')
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class ReportTemplate(models.Model):
    """Model for custom report templates."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='report_templates')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    sections = models.JSONField(help_text='Sections and metrics to include in this report template')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', 'title']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class ExportedReport(models.Model):
    """Model for tracking exported reports."""
    
    EXPORT_FORMATS = [
        ('pdf', 'PDF'),
        ('excel', 'Excel Spreadsheet'),
        ('csv', 'CSV File'),
        ('json', 'JSON Data'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exported_reports')
    saved_report = models.ForeignKey(SavedReport, on_delete=models.CASCADE, related_name='exports')
    export_format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    file_path = models.FileField(upload_to='exported_reports/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.saved_report.title} ({self.export_format})"