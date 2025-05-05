# """
# URL configuration for health_project project.
# """
# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/users/', include('users.urls')),
#     path('api/health/', include('health_records.urls')),
#     path('api/analytics/', include('analytics.urls')),
#     path('api/reports/', include('reporting.urls')),
#     path('api/admin-portal/', include('admin_portal.urls')),
# ]

# # Serve media files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse  # ✅ Add this line

# ✅ Home view function
def home(request):
    return JsonResponse({"message": "Welcome to the Fitness API"})

urlpatterns = [
    path('', home),  # ✅ Home route
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/health/', include('health_records.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/reports/', include('reporting.urls')),
    path('api/admin-portal/', include('admin_portal.urls')),
]

# ✅ Media file serving (for development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

