import json
import logging
from django.utils import timezone

# Set up logger
audit_logger = logging.getLogger('audit')

class AuditLogMiddleware:
    """
    Middleware to log sensitive data access for auditing purposes.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process the request
        response = self.get_response(request)
        
        # Log sensitive operations
        self._log_sensitive_operations(request, response)
        
        return response
    
    def _log_sensitive_operations(self, request, response):
        # Define sensitive paths that should be logged
        sensitive_paths = [
            '/api/health/',
            '/api/users/',
            '/api/admin-portal/'
        ]
        
        # Check if current path is sensitive
        is_sensitive = any(request.path.startswith(path) for path in sensitive_paths)
        
        # Only log sensitive operations
        if is_sensitive:
            # Get user if authenticated
            user_id = request.user.id if request.user.is_authenticated else 'anonymous'
            
            # Create log entry
            log_data = {
                'timestamp': timezone.now().isoformat(),
                'user_id': user_id,
                'method': request.method,
                'path': request.path,
                'ip_address': self._get_client_ip(request),
                'status_code': response.status_code,
            }
            
            # Log the entry
            audit_logger.info(json.dumps(log_data))
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip