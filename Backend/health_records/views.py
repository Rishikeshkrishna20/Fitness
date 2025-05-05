from datetime import datetime, timedelta
from django.db.models import Sum, Avg
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from users.permissions import IsOwner

from .models import (
    WorkoutLog, MealLog, WaterLog, SleepLog, VitalsLog,
    MedicationLog, MoodLog, HealthGoal
)
from .serializers import (
    WorkoutLogSerializer, MealLogSerializer, WaterLogSerializer,
    SleepLogSerializer, VitalsLogSerializer, MedicationLogSerializer,
    MoodLogSerializer, HealthGoalSerializer, DailyHealthSummarySerializer
)
from users.permissions import IsOwner

class BaseHealthLogViewSet(viewsets.ModelViewSet):
    """
    Base viewset for health logs with common functionality.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date', 'time', 'created_at']
    ordering = ['-date', '-time']
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutLogViewSet(BaseHealthLogViewSet):
    queryset = WorkoutLog.objects.all()
    serializer_class = WorkoutLogSerializer
    filterset_fields = ['date', 'workout_type', 'activity']
    search_fields = ['activity', 'notes']


class MealLogViewSet(BaseHealthLogViewSet):
    queryset = MealLog.objects.all()
    serializer_class = MealLogSerializer
    filterset_fields = ['date', 'meal_type']
    search_fields = ['food_items', 'notes']


class WaterLogViewSet(BaseHealthLogViewSet):
    queryset = WaterLog.objects.all()
    serializer_class = WaterLogSerializer
    
    @action(detail=False, methods=['get'])
    def daily_total(self, request):
        date_str = request.query_params.get('date', datetime.now().strftime('%Y-%m-%d'))
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        total = WaterLog.objects.filter(
            user=request.user,
            date=date
        ).aggregate(total=Sum('amount'))
        
        return Response({
            'date': date,
            'total_amount': total['total'] or 0,
            'unit': 'milliliters'
        })


class SleepLogViewSet(BaseHealthLogViewSet):
    queryset = SleepLog.objects.all()
    serializer_class = SleepLogSerializer
    filterset_fields = ['start_time__date', 'quality']
    search_fields = ['notes']
    ordering_fields = ['start_time', 'duration', 'quality']
    ordering = ['-start_time']


class VitalsLogViewSet(BaseHealthLogViewSet):
    queryset = VitalsLog.objects.all()
    serializer_class = VitalsLogSerializer
    filterset_fields = ['date']
    search_fields = ['notes']


class MedicationLogViewSet(BaseHealthLogViewSet):
    queryset = MedicationLog.objects.all()
    serializer_class = MedicationLogSerializer
    filterset_fields = ['date', 'medication_name', 'taken']
    search_fields = ['medication_name', 'notes']


class MoodLogViewSet(BaseHealthLogViewSet):
    queryset = MoodLog.objects.all()
    serializer_class = MoodLogSerializer
    filterset_fields = ['date', 'mood', 'energy', 'stress']
    search_fields = ['notes']
    

class HealthGoalViewSet(BaseHealthLogViewSet):
    queryset = HealthGoal.objects.all()
    serializer_class = HealthGoalSerializer
    filterset_fields = ['goal_type', 'status', 'start_date', 'target_date']
    search_fields = ['title', 'description', 'notes']
    ordering_fields = ['start_date', 'target_date', 'progress', 'created_at']
    
    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        progress = request.data.get('progress')
        
        if progress is None:
            return Response({'error': 'Progress is required.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            progress = float(progress)
            if progress < 0 or progress > 100:
                raise ValueError
        except ValueError:
            return Response({'error': 'Progress must be a number between 0 and 100.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        goal.progress = progress
        if progress == 100:
            goal.status = 'completed'
        goal.save()
        
        return Response(HealthGoalSerializer(goal).data)


class HealthSummaryViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def daily(self, request):
        date_str = request.query_params.get('date', datetime.now().strftime('%Y-%m-%d'))
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        meals = MealLog.objects.filter(user=request.user, date=date)
        total_calories = meals.aggregate(total=Sum('total_calories'))['total'] or 0
        
        workouts = WorkoutLog.objects.filter(user=request.user, date=date)
        calories_burned = workouts.aggregate(total=Sum('calories_burned'))['total'] or 0
        workout_minutes = workouts.aggregate(total=Sum('duration'))['total'] or 0
        
        water_logs = WaterLog.objects.filter(user=request.user, date=date)
        water_intake = water_logs.aggregate(total=Sum('amount'))['total'] or 0
        
        end_time_min = datetime.combine(date, datetime.min.time())
        end_time_max = datetime.combine(date, datetime.max.time())
        
        sleep_logs = SleepLog.objects.filter(
            user=request.user,
            end_time__range=(end_time_min, end_time_max)
        )
        sleep_duration = sleep_logs.aggregate(avg=Avg('duration'))['avg'] or 0
        
        mood_logs = MoodLog.objects.filter(user=request.user, date=date)
        avg_mood = mood_logs.aggregate(avg=Avg('mood'))['avg'] or 0
        
        summary = {
            'date': date,
            'total_calories_consumed': total_calories,
            'total_calories_burned': calories_burned,
            'total_water_intake': water_intake,
            'sleep_duration': sleep_duration,
            'avg_mood': avg_mood,
            'workout_minutes': workout_minutes
        }
        
        serializer = DailyHealthSummarySerializer(summary)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def weekly(self, request):
        date_str = request.query_params.get('date', datetime.now().strftime('%Y-%m-%d'))
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            start_date = date - timedelta(days=date.weekday())
            end_date = start_date + timedelta(days=6)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        daily_summaries = []
        current_date = start_date
        
        while current_date <= end_date:
            meals = MealLog.objects.filter(user=request.user, date=current_date)
            total_calories = meals.aggregate(total=Sum('total_calories'))['total'] or 0
            
            workouts = WorkoutLog.objects.filter(user=request.user, date=current_date)
            calories_burned = workouts.aggregate(total=Sum('calories_burned'))['total'] or 0
            workout_minutes = workouts.aggregate(total=Sum('duration'))['total'] or 0
            
            water_logs = WaterLog.objects.filter(user=request.user, date=current_date)
            water_intake = water_logs.aggregate(total=Sum('amount'))['total'] or 0
            
            end_time_min = datetime.combine(current_date, datetime.min.time())
            end_time_max = datetime.combine(current_date, datetime.max.time())
            
            sleep_logs = SleepLog.objects.filter(
                user=request.user,
                end_time__range=(end_time_min, end_time_max)
            )
            sleep_duration = sleep_logs.aggregate(avg=Avg('duration'))['avg'] or 0
            
            mood_logs = MoodLog.objects.filter(user=request.user, date=current_date)
            avg_mood = mood_logs.aggregate(avg=Avg('mood'))['avg'] or 0
            
            summary = {
                'date': current_date,
                'total_calories_consumed': total_calories,
                'total_calories_burned': calories_burned,
                'total_water_intake': water_intake,
                'sleep_duration': sleep_duration,
                'avg_mood': avg_mood,
                'workout_minutes': workout_minutes
            }
            
            daily_summaries.append(summary)
            current_date += timedelta(days=1)
        
        weekly_summary = {
            'start_date': start_date,
            'end_date': end_date,
            'daily_summaries': daily_summaries,
            'weekly_totals': {
                'total_calories_consumed': sum(d['total_calories_consumed'] for d in daily_summaries),
                'total_calories_burned': sum(d['total_calories_burned'] for d in daily_summaries),
                'total_water_intake': sum(d['total_water_intake'] for d in daily_summaries),
                'avg_sleep_duration': sum(d['sleep_duration'] for d in daily_summaries) / 7 if any(d['sleep_duration'] for d in daily_summaries) else 0,
                'avg_mood': sum(d['avg_mood'] for d in daily_summaries) / 7 if any(d['avg_mood'] for d in daily_summaries) else 0,
                'total_workout_minutes': sum(d['workout_minutes'] for d in daily_summaries),
            }
        }
        
        return Response(weekly_summary)
