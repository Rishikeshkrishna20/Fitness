"""
Views for the admin_portal app.
"""
from datetime import datetime, timedelta
from django.db.models import Count, Sum, Avg, Q
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from health_records.models import (
    WorkoutLog, MealLog, WaterLog, SleepLog, VitalsLog,
    MedicationLog, MoodLog, HealthGoal
)
from .models import AuditLog, SystemMetric, SystemSetting, SystemNotification
from .serializers import (
    AuditLogSerializer, SystemMetricSerializer, SystemSettingSerializer,
    SystemNotificationSerializer, AdminUserSerializer, SystemDashboardSerializer
)

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    """
    Permission to only allow admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for audit logs.
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Apply filters if provided
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        action_type = self.request.query_params.get('action_type', None)
        if action_type:
            queryset = queryset.filter(action_type=action_type)
            
        start_date = self.request.query_params.get('start_date', None)
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__gte=start_date)
            except ValueError:
                pass
            
        end_date = self.request.query_params.get('end_date', None)
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__lte=end_date)
            except ValueError:
                pass
            
        return queryset


class SystemMetricViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for system metrics.
    """
    queryset = SystemMetric.objects.all()
    serializer_class = SystemMetricSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get a summary of system metrics.
        """
        # Get current day
        today = datetime.now().date()
        
        # Get metrics for the last 30 days
        start_date = today - timedelta(days=30)
        
        metrics = {}
        
        for metric_type, _ in SystemMetric.METRIC_TYPES:
            # Get most recent value
            latest = SystemMetric.objects.filter(
                metric_type=metric_type
            ).order_by('-timestamp').first()
            
            # Get 30-day trend
            history = SystemMetric.objects.filter(
                metric_type=metric_type,
                timestamp__date__gte=start_date
            ).order_by('timestamp')
            
            trend_data = [
                {
                    'timestamp': item.timestamp.strftime('%Y-%m-%d'),
                    'value': item.value
                }
                for item in history
            ]
            
            metrics[metric_type] = {
                'current_value': latest.value if latest else 0,
                'trend': trend_data
            }
        
        return Response(metrics)


class SystemSettingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for system settings.
    """
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        # Non-admin users can only see public settings
        if not self.request.user.is_staff:
            return self.queryset.filter(is_public=True)
        return self.queryset
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
        
        # Log the setting change
        AuditLog.objects.create(
            user=self.request.user,
            action_type='settings_change',
            description=f"Updated system setting: {serializer.instance.key}",
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'setting_key': serializer.instance.key,
                'old_value': serializer.instance.value,
                'new_value': serializer.validated_data.get('value')
            }
        )
    
    def _get_client_ip(self):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class SystemNotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for system notifications.
    """
    queryset = SystemNotification.objects.all()
    serializer_class = SystemNotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a notification.
        """
        notification = self.get_object()
        notification.is_active = True
        notification.save()
        
        # Log the action
        AuditLog.objects.create(
            user=request.user,
            action_type='system_event',
            description=f"Activated system notification: {notification.title}",
            ip_address=self._get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'notification_id': notification.id,
                'notification_title': notification.title
            }
        )
        
        return Response({'status': 'notification activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a notification.
        """
        notification = self.get_object()
        notification.is_active = False
        notification.save()
        
        # Log the action
        AuditLog.objects.create(
            user=request.user,
            action_type='system_event',
            description=f"Deactivated system notification: {notification.title}",
            ip_address=self._get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'notification_id': notification.id,
                'notification_title': notification.title
            }
        )
        
        return Response({'status': 'notification deactivated'})
    
    def _get_client_ip(self):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def perform_create(self, serializer):
        user = serializer.save()
        
        # Log the user creation
        AuditLog.objects.create(
            user=self.request.user,
            action_type='user_create',
            description=f"Created user: {user.email}",
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'user_id': user.id,
                'user_email': user.email
            }
        )
    
    def perform_update(self, serializer):
        user = serializer.save()
        
        # Log the user update
        AuditLog.objects.create(
            user=self.request.user,
            action_type='user_update',
            description=f"Updated user: {user.email}",
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'user_id': user.id,
                'user_email': user.email,
                'changes': {k: serializer.validated_data[k] for k in serializer.validated_data if k != 'password'}
            }
        )
    
    def perform_destroy(self, instance):
        email = instance.email
        user_id = instance.id
        
        # Log the user deletion before deleting
        AuditLog.objects.create(
            user=self.request.user,
            action_type='user_delete',
            description=f"Deleted user: {email}",
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'user_id': user_id,
                'user_email': email
            }
        )
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a user account.
        """
        user = self.get_object()
        user.is_active = True
        user.save()
        
        # Log the action
        AuditLog.objects.create(
            user=request.user,
            action_type='user_update',
            description=f"Activated user account: {user.email}",
            ip_address=self._get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'user_id': user.id,
                'user_email': user.email
            }
        )
        
        return Response({'status': 'user activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a user account.
        """
        user = self.get_object()
        user.is_active = False
        user.save()
        
        # Log the action
        AuditLog.objects.create(
            user=request.user,
            action_type='user_update',
            description=f"Deactivated user account: {user.email}",
            ip_address=self._get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'user_id': user.id,
                'user_email': user.email
            }
        )
        
        return Response({'status': 'user deactivated'})
    
    @action(detail=True, methods=['post'])
    def make_admin(self, request, pk=None):
        """
        Give a user admin privileges.
        """
        user = self.get_object()
        user.is_staff = True
        user.save()
        
        # Log the action
        AuditLog.objects.create(
            user=request.user,
            action_type='user_update',
            description=f"Gave admin privileges to user: {user.email}",
            ip_address=self._get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'user_id': user.id,
                'user_email': user.email
            }
        )
        
        return Response({'status': 'user made admin'})
    
    @action(detail=True, methods=['post'])
    def remove_admin(self, request, pk=None):
        """
        Remove admin privileges from a user.
        """
        user = self.get_object()
        
        # Prevent removing admin privileges from the last admin
        if User.objects.filter(is_staff=True).count() <= 1 and user.is_staff:
            return Response(
                {'error': 'Cannot remove admin privileges from the last admin user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_staff = False
        user.save()
        
        # Log the action
        AuditLog.objects.create(
            user=request.user,
            action_type='user_update',
            description=f"Removed admin privileges from user: {user.email}",
            ip_address=self._get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={
                'user_id': user.id,
                'user_email': user.email
            }
        )
        
        return Response({'status': 'admin privileges removed'})
    
    def _get_client_ip(self):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for admin dashboard data.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get a summary of system status for the admin dashboard.
        """
        # Get current date for calculations
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # User statistics
        total_users = User.objects.count()
        
        active_users_today = User.objects.filter(
            last_login__date=today
        ).count()
        
        active_users_week = User.objects.filter(
            last_login__date__gte=week_ago
        ).count()
        
        active_users_month = User.objects.filter(
            last_login__date__gte=month_ago
        ).count()
        
        # Health record statistics
        total_workout_logs = WorkoutLog.objects.count()
        total_meal_logs = MealLog.objects.count()
        total_water_logs = WaterLog.objects.count()
        total_sleep_logs = SleepLog.objects.count()
        total_vitals_logs = VitalsLog.objects.count()
        total_medication_logs = MedicationLog.objects.count()
        total_mood_logs = MoodLog.objects.count()
        
        total_health_records = (
            total_workout_logs + total_meal_logs + total_water_logs + 
            total_sleep_logs + total_vitals_logs + total_medication_logs + 
            total_mood_logs
        )
        
        # Records today
        records_today = (
            WorkoutLog.objects.filter(date=today).count() +
            MealLog.objects.filter(date=today).count() +
            WaterLog.objects.filter(date=today).count() +
            SleepLog.objects.filter(end_time__date=today).count() +
            VitalsLog.objects.filter(date=today).count() +
            MedicationLog.objects.filter(date=today).count() +
            MoodLog.objects.filter(date=today).count()
        )
        
        # Records this week
        records_week = (
            WorkoutLog.objects.filter(date__gte=week_ago).count() +
            MealLog.objects.filter(date__gte=week_ago).count() +
            WaterLog.objects.filter(date__gte=week_ago).count() +
            SleepLog.objects.filter(end_time__date__gte=week_ago).count() +
            VitalsLog.objects.filter(date__gte=week_ago).count() +
            MedicationLog.objects.filter(date__gte=week_ago).count() +
            MoodLog.objects.filter(date__gte=week_ago).count()
        )
        
        # Records this month
        records_month = (
            WorkoutLog.objects.filter(date__gte=month_ago).count() +
            MealLog.objects.filter(date__gte=month_ago).count() +
            WaterLog.objects.filter(date__gte=month_ago).count() +
            SleepLog.objects.filter(end_time__date__gte=month_ago).count() +
            VitalsLog.objects.filter(date__gte=month_ago).count() +
            MedicationLog.objects.filter(date__gte=month_ago).count() +
            MoodLog.objects.filter(date__gte=month_ago).count()
        )
        
        # System health
        # This would normally be based on more sophisticated monitoring
        errors_today = 0  # In a real system, this would come from error logs
        system_health = 'Healthy'
        average_response_time = 0.125  # In seconds, would be from monitoring
        
        # Recent audit logs
        recent_audit_logs = AuditLog.objects.order_by('-timestamp')[:10]
        
        # System metrics
        system_metrics = {
            'user_metrics': {
                'total_users': total_users,
                'active_users_today': active_users_today,
                'active_users_week': active_users_week,
                'active_users_month': active_users_month,
            },
            'data_metrics': {
                'total_health_records': total_health_records,
                'records_today': records_today,
                'records_week': records_week,
                'records_month': records_month,
                'breakdown': {
                    'workout_logs': total_workout_logs,
                    'meal_logs': total_meal_logs,
                    'water_logs': total_water_logs,
                    'sleep_logs': total_sleep_logs,
                    'vitals_logs': total_vitals_logs,
                    'medication_logs': total_medication_logs,
                    'mood_logs': total_mood_logs,
                }
            }
        }
        
        # Compile the dashboard data
        dashboard_data = {
            'total_users': total_users,
            'active_users_today': active_users_today,
            'active_users_week': active_users_week,
            'active_users_month': active_users_month,
            
            'total_health_records': total_health_records,
            'records_today': records_today,
            'records_week': records_week,
            'records_month': records_month,
            
            'system_health': system_health,
            'current_errors': errors_today,
            'average_response_time': average_response_time,
            
            'recent_audit_logs': AuditLogSerializer(recent_audit_logs, many=True).data,
            'system_metrics': system_metrics
        }
        
        serializer = SystemDashboardSerializer(dashboard_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """
        Get user activity data for the admin dashboard.
        """
        # Get date range from request or use default (30 days)
        days = int(request.query_params.get('days', 30))
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get daily user sign-ups
        signups_by_day = User.objects.filter(
            date_joined__date__range=(start_date, end_date)
        ).extra(
            select={'day': 'date(date_joined)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        # Convert to list of dicts with date strings
        signups_data = [
            {
                'date': item['day'].strftime('%Y-%m-%d'),
                'count': item['count']
            }
            for item in signups_by_day
        ]
        
        # Get daily active users
        # In a real system, this would likely use more sophisticated tracking
        # Here we'll use last_login as a proxy
        logins_by_day = AuditLog.objects.filter(
            action_type='user_login',
            timestamp__date__range=(start_date, end_date)
        ).extra(
            select={'day': 'date(timestamp)'}
        ).values('day').annotate(count=Count('user', distinct=True)).order_by('day')
        
        logins_data = [
            {
                'date': item['day'].strftime('%Y-%m-%d'),
                'count': item['count']
            }
            for item in logins_by_day
        ]
        
        # Fill in missing dates with zero counts
        all_dates = {}
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            all_dates[date_str] = {
                'signups': 0,
                'active_users': 0
            }
            current_date += timedelta(days=1)
            
        # Update with actual data
        for item in signups_data:
            if item['date'] in all_dates:
                all_dates[item['date']]['signups'] = item['count']
                
        for item in logins_data:
            if item['date'] in all_dates:
                all_dates[item['date']]['active_users'] = item['count']
        
        # Convert to list format
        activity_data = [
            {
                'date': date,
                'new_users': data['signups'],
                'active_users': data['active_users']
            }
            for date, data in all_dates.items()
        ]
        
        return Response({
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'activity': activity_data
        })
    
    @action(detail=False, methods=['get'])
    def data_volume(self, request):
        """
        Get data volume metrics for the admin dashboard.
        """
        # Get date range from request or use default (30 days)
        days = int(request.query_params.get('days', 30))
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get daily record counts for each data type
        workout_by_day = WorkoutLog.objects.filter(
            date__range=(start_date, end_date)
        ).extra(
            select={'day': 'date'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        meal_by_day = MealLog.objects.filter(
            date__range=(start_date, end_date)
        ).extra(
            select={'day': 'date'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        water_by_day = WaterLog.objects.filter(
            date__range=(start_date, end_date)
        ).extra(
            select={'day': 'date'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        # Convert to list of dicts with date strings
        workout_data = {
            item['day'].strftime('%Y-%m-%d'): item['count']
            for item in workout_by_day
        }
        
        meal_data = {
            item['day'].strftime('%Y-%m-%d'): item['count']
            for item in meal_by_day
        }
        
        water_data = {
            item['day'].strftime('%Y-%m-%d'): item['count']
            for item in water_by_day
        }
        
        # Fill in missing dates and combine all data
        all_dates = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            all_dates.append({
                'date': date_str,
                'workout_logs': workout_data.get(date_str, 0),
                'meal_logs': meal_data.get(date_str, 0),
                'water_logs': water_data.get(date_str, 0),
                # Would add other log types here in a real implementation
            })
            current_date += timedelta(days=1)
            
        return Response({
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'data_volume': all_dates
        })