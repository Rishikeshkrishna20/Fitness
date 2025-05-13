"""
URL patterns for the users app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserRegistrationView, UserProfileView, UserPreferenceView,
    PasswordChangeView, LogoutView,CustomTokenObtainPairView
)

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='custom_token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # User profile endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('preferences/', UserPreferenceView.as_view(), name='preferences'),
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
]