"""
Views for the reporting app.
"""
from datetime import datetime, timedelta, date
from calendar import monthrange
from django.db.models import Avg, Sum, Max, Min
from django.http import FileResponse
from rest_framework import viewsets, permissions, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import IsOwner
from health_records.models import (
    WorkoutLog, MealLog, WaterLog, SleepLog, VitalsLog,
    MedicationLog, MoodLog, HealthGoal
)
from analytics.models import HealthScore, Insight
from .models import SavedReport, ReportTemplate, ExportedReport
from .serializers import (
    SavedReportSerializer, ReportTemplateSerializer, ExportedReportSerializer,
    DailyReportSerializer, WeeklyReportSerializer, MonthlyReportSerializer
)


class SavedReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for saved reports.
    """
    queryset = SavedReport.objects.all()
    serializer_class = SavedReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for report templates.
    """
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=True, methods=['post'])
    def set_as_default(self, request, pk=None):
        """
        Set this template as the default.
        """
        template = self.get_object()
        
        # Clear other default templates for this user
        ReportTemplate.objects.filter(
            user=request.user,
            is_default=True
        ).update(is_default=False)
        
        # Set this template as default
        template.is_default = True
        template.save()
        
        return Response({
            'status': 'success',
            'message': f'Template "{template.title}" set as default'
        })


class ExportedReportViewSet(viewsets.GenericViewSet, 
                           mixins.RetrieveModelMixin,
                           mixins.ListModelMixin,
                           mixins.DestroyModelMixin):
    """
    ViewSet for exported reports.
    """
    queryset = ExportedReport.objects.all()
    serializer_class = ExportedReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download an exported report file.
        """
        exported_report = self.get_object()
        return FileResponse(
            exported_report.file_path,
            as_attachment=True,
            filename=f"{exported_report.saved_report.title}.{exported_report.export_format}"
        )


class ReportGenerationViewSet(viewsets.ViewSet):
    """
    ViewSet for generating reports.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def daily(self, request):
        """
        Generate a daily report.
        """
        # Get date from request or use today
        date_str = request.query_params.get('date', datetime.now().strftime('%Y-%m-%d'))
        try:
            report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Get nutrition data
        meals = MealLog.objects.filter(user=request.user, date=report_date)
        nutrition_data = {
            'meals': [
                {
                    'meal_type': meal.meal_type,
                    'time': meal.time.strftime('%H:%M'),
                    'food_items': meal.food_items,
                    'total_calories': meal.total_calories,
                    'protein': float(meal.protein) if meal.protein else None,
                    'carbs': float(meal.carbs) if meal.carbs else None,
                    'fat': float(meal.fat) if meal.fat else None,
                    'notes': meal.notes
                }
                for meal in meals
            ],
            'totals': {
                'calories': meals.aggregate(total=Sum('total_calories'))['total'] or 0,
                'protein': float(meals.aggregate(total=Sum('protein'))['total'] or 0),
                'carbs': float(meals.aggregate(total=Sum('carbs'))['total'] or 0),
                'fat': float(meals.aggregate(total=Sum('fat'))['total'] or 0)
            }
        }
        
        # Get activity data
        workouts = WorkoutLog.objects.filter(user=request.user, date=report_date)
        activity_data = {
            'workouts': [
                {
                    'workout_type': workout.workout_type,
                    'activity': workout.activity,
                    'time': workout.time.strftime('%H:%M'),
                    'duration': workout.duration,
                    'calories_burned': workout.calories_burned,
                    'distance': float(workout.distance) if workout.distance else None,
                    'notes': workout.notes
                }
                for workout in workouts
            ],
            'totals': {
                'duration': workouts.aggregate(total=Sum('duration'))['total'] or 0,
                'calories_burned': workouts.aggregate(total=Sum('calories_burned'))['total'] or 0
            }
        }
        
        # Get sleep data
        end_time_min = datetime.combine(report_date, datetime.min.time())
        end_time_max = datetime.combine(report_date, datetime.max.time())
        
        sleep_logs = SleepLog.objects.filter(
            user=request.user,
            end_time__range=(end_time_min, end_time_max)
        )
        
        sleep_data = {
            'logs': [
                {
                    'start_time': log.start_time.strftime('%Y-%m-%d %H:%M'),
                    'end_time': log.end_time.strftime('%Y-%m-%d %H:%M'),
                    'duration': float(log.duration),
                    'quality': log.quality,
                    'interruptions': log.interruptions,
                    'notes': log.notes
                }
                for log in sleep_logs
            ],
            'summary': {
                'total_duration': float(sleep_logs.aggregate(total=Sum('duration'))['total'] or 0),
                'average_quality': float(sleep_logs.aggregate(avg=Avg('quality'))['avg'] or 0)
            }
        }
        
        # Get hydration data
        water_logs = WaterLog.objects.filter(user=request.user, date=report_date)
        hydration_data = {
            'logs': [
                {
                    'time': log.time.strftime('%H:%M'),
                    'amount': log.amount
                }
                for log in water_logs
            ],
            'total': water_logs.aggregate(total=Sum('amount'))['total'] or 0
        }
        
        # Get vitals data
        vitals_logs = VitalsLog.objects.filter(user=request.user, date=report_date)
        vitals_data = {
            'logs': [
                {
                    'time': log.time.strftime('%H:%M'),
                    'heart_rate': log.heart_rate,
                    'blood_pressure_systolic': log.blood_pressure_systolic,
                    'blood_pressure_diastolic': log.blood_pressure_diastolic,
                    'temperature': float(log.temperature) if log.temperature else None,
                    'oxygen_saturation': log.oxygen_saturation,
                    'glucose': float(log.glucose) if log.glucose else None,
                    'weight': float(log.weight) if log.weight else None,
                    'notes': log.notes
                }
                for log in vitals_logs
            ]
        }
        
        # Get medication data
        medication_logs = MedicationLog.objects.filter(user=request.user, date=report_date)
        medication_data = {
            'logs': [
                {
                    'time': log.time.strftime('%H:%M'),
                    'medication_name': log.medication_name,
                    'dosage': log.dosage,
                    'dosage_unit': log.dosage_unit,
                    'taken': log.taken,
                    'notes': log.notes
                }
                for log in medication_logs
            ],
            'total_taken': medication_logs.filter(taken=True).count(),
            'total_missed': medication_logs.filter(taken=False).count()
        }
        
        # Get mood data
        mood_logs = MoodLog.objects.filter(user=request.user, date=report_date)
        mood_data = {
            'logs': [
                {
                    'time': log.time.strftime('%H:%M'),
                    'mood': log.mood,
                    'energy': log.energy,
                    'stress': log.stress,
                    'notes': log.notes
                }
                for log in mood_logs
            ],
            'averages': {
                'mood': float(mood_logs.aggregate(avg=Avg('mood'))['avg'] or 0),
                'energy': float(mood_logs.aggregate(avg=Avg('energy'))['avg'] or 0),
                'stress': float(mood_logs.aggregate(avg=Avg('stress'))['avg'] or 0)
            }
        }
        
        # Get health score if available
        health_score = HealthScore.objects.filter(
            user=request.user,
            calculation_date=report_date
        ).first()
        
        health_score_data = None
        if health_score:
            health_score_data = {
                'overall_score': float(health_score.overall_score),
                'nutrition_score': float(health_score.nutrition_score),
                'activity_score': float(health_score.activity_score),
                'sleep_score': float(health_score.sleep_score),
                'hydration_score': float(health_score.hydration_score),
                'vitals_score': float(health_score.vitals_score) if health_score.vitals_score else None,
                'mood_score': float(health_score.mood_score) if health_score.mood_score else None
            }
        
        # Combine all data into the report
        report_data = {
            'date': report_date,
            'nutrition': nutrition_data,
            'activity': activity_data,
            'sleep': sleep_data,
            'hydration': hydration_data,
            'vitals': vitals_data,
            'medications': medication_data,
            'mood': mood_data,
            'health_score': health_score_data
        }
        
        # Save the report if requested
        save_report = request.query_params.get('save', 'false').lower() == 'true'
        if save_report:
            SavedReport.objects.create(
                user=request.user,
                report_type='daily',
                title=f"Daily Report - {report_date.strftime('%Y-%m-%d')}",
                description=f"Daily health summary for {report_date.strftime('%B %d, %Y')}",
                parameters={'date': report_date.strftime('%Y-%m-%d')},
                data=report_data,
                start_date=report_date,
                end_date=report_date
            )
        
        serializer = DailyReportSerializer(report_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def weekly(self, request):
        """
        Generate a weekly report.
        """
        # Get date from request (will use as the end of the week)
        date_str = request.query_params.get('date', datetime.now().strftime('%Y-%m-%d'))
        try:
            end_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            # Calculate start of week (Monday)
            start_date = end_date - timedelta(days=end_date.weekday())
            # Ensure we have a full week
            end_date = start_date + timedelta(days=6)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Generate daily summaries for each day in the week
        daily_summaries = []
        current_date = start_date
        
        while current_date <= end_date:
            # Get daily totals
            
            # Nutrition
            meals = MealLog.objects.filter(user=request.user, date=current_date)
            total_calories = meals.aggregate(total=Sum('total_calories'))['total'] or 0
            
            # Activity
            workouts = WorkoutLog.objects.filter(user=request.user, date=current_date)
            total_workout_minutes = workouts.aggregate(total=Sum('duration'))['total'] or 0
            total_calories_burned = workouts.aggregate(total=Sum('calories_burned'))['total'] or 0
            
            # Water
            water_logs = WaterLog.objects.filter(user=request.user, date=current_date)
            total_water = water_logs.aggregate(total=Sum('amount'))['total'] or 0
            
            # Sleep
            end_time_min = datetime.combine(current_date, datetime.min.time())
            end_time_max = datetime.combine(current_date, datetime.max.time())
            
            sleep_logs = SleepLog.objects.filter(
                user=request.user,
                end_time__range=(end_time_min, end_time_max)
            )
            
            sleep_duration = sleep_logs.aggregate(total=Sum('duration'))['total'] or 0
            sleep_quality = sleep_logs.aggregate(avg=Avg('quality'))['avg'] or 0
            
            # Mood
            mood_logs = MoodLog.objects.filter(user=request.user, date=current_date)
            avg_mood = mood_logs.aggregate(avg=Avg('mood'))['avg'] or 0
            
            # Health Score
            health_score = HealthScore.objects.filter(
                user=request.user,
                calculation_date=current_date
            ).first()
            
            daily_summary = {
                'date': current_date.strftime('%Y-%m-%d'),
                'day_of_week': current_date.strftime('%A'),
                'nutrition': {
                    'total_calories': total_calories,
                    'meal_count': meals.count()
                },
                'activity': {
                    'total_workout_minutes': total_workout_minutes,
                    'total_calories_burned': total_calories_burned,
                    'workout_count': workouts.count()
                },
                'hydration': {
                    'total_water': total_water
                },
                'sleep': {
                    'duration': float(sleep_duration) if sleep_duration else 0,
                    'quality': float(sleep_quality) if sleep_quality else 0
                },
                'mood': {
                    'average': float(avg_mood) if avg_mood else 0
                },
                'health_score': float(health_score.overall_score) if health_score else None
            }
            
            daily_summaries.append(daily_summary)
            current_date += timedelta(days=1)
        
        # Calculate weekly totals and averages
        weekly_totals = {
            'total_calories_consumed': sum(day['nutrition']['total_calories'] for day in daily_summaries),
            'total_workout_minutes': sum(day['activity']['total_workout_minutes'] for day in daily_summaries),
            'total_calories_burned': sum(day['activity']['total_calories_burned'] for day in daily_summaries),
            'total_water': sum(day['hydration']['total_water'] for day in daily_summaries),
        }
        
        weekly_averages = {
            'avg_daily_calories': weekly_totals['total_calories_consumed'] / 7,
            'avg_daily_workout_minutes': weekly_totals['total_workout_minutes'] / 7,
            'avg_daily_water': weekly_totals['total_water'] / 7,
            'avg_sleep_duration': sum(day['sleep']['duration'] for day in daily_summaries) / 7,
            'avg_sleep_quality': sum(day['sleep']['quality'] for day in daily_summaries if day['sleep']['quality']) / sum(1 for day in daily_summaries if day['sleep']['quality']) if any(day['sleep']['quality'] for day in daily_summaries) else 0,
            'avg_mood': sum(day['mood']['average'] for day in daily_summaries if day['mood']['average']) / sum(1 for day in daily_summaries if day['mood']['average']) if any(day['mood']['average'] for day in daily_summaries) else 0,
            'avg_health_score': sum(day['health_score'] for day in daily_summaries if day['health_score']) / sum(1 for day in daily_summaries if day['health_score']) if any(day['health_score'] for day in daily_summaries) else None,
        }
        
        # Get goal progress for the week
        goals = HealthGoal.objects.filter(
            user=request.user,
            status='active',
            start_date__lte=end_date
        )
        
        goals_progress = []
        for goal in goals:
            # Get progress at the start of the week and end of the week
            progress_history = []
            
            # This would typically be stored in a progress history model
            # Here we'll just use the current progress value
            progress_history.append({
                'date': start_date.strftime('%Y-%m-%d'),
                'progress': float(goal.progress)
            })
            
            goals_progress.append({
                'id': goal.id,
                'title': goal.title,
                'goal_type': goal.goal_type,
                'target_date': goal.target_date.strftime('%Y-%m-%d'),
                'current_progress': float(goal.progress),
                'progress_history': progress_history
            })
        
        # Get insights generated during this week
        insights = Insight.objects.filter(
            user=request.user,
            created_at__date__range=(start_date, end_date)
        )
        
        insights_data = []
        for insight in insights:
            insights_data.append({
                'id': insight.id,
                'insight_type': insight.insight_type,
                'title': insight.title,
                'description': insight.description,
                'created_at': insight.created_at.strftime('%Y-%m-%d')
            })
        
        # Combine all data into the weekly report
        report_data = {
            'start_date': start_date,
            'end_date': end_date,
            'daily_summaries': daily_summaries,
            'weekly_totals': weekly_totals,
            'weekly_averages': weekly_averages,
            'progress': {
                'goals': goals_progress
            },
            'insights': insights_data
        }
        
        # Save the report if requested
        save_report = request.query_params.get('save', 'false').lower() == 'true'
        if save_report:
            SavedReport.objects.create(
                user=request.user,
                report_type='weekly',
                title=f"Weekly Report - {start_date.strftime('%b %d')} to {end_date.strftime('%b %d, %Y')}",
                description=f"Weekly health summary from {start_date.strftime('%B %d')} to {end_date.strftime('%B %d, %Y')}",
                parameters={
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d')
                },
                data=report_data,
                start_date=start_date,
                end_date=end_date
            )
        
        serializer = WeeklyReportSerializer(report_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly(self, request):
        """
        Generate a monthly report.
        """
        # Get month and year from request
        month = int(request.query_params.get('month', datetime.now().month))
        year = int(request.query_params.get('year', datetime.now().year))
        
        # Validate month
        if month < 1 or month > 12:
            return Response({'error': 'Invalid month. Must be between 1 and 12.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Get start and end dates for the month
        start_date = date(year, month, 1)
        _, last_day = monthrange(year, month)
        end_date = date(year, month, last_day)
        
        # Get weekly summaries for the month
        weekly_summaries = []
        
        # Get the Monday of the week containing the 1st of the month
        first_monday = start_date - timedelta(days=start_date.weekday())
        
        # If first_monday is before start_date, make sure we include the start date in the first week
        if first_monday < start_date:
            week_start = first_monday
        else:
            week_start = first_monday - timedelta(days=7)
        
        # Generate weekly summaries
        while week_start <= end_date:
            week_end = week_start + timedelta(days=6)
            
            # If the week is completely outside our month, skip it
            if week_end < start_date or week_start > end_date:
                week_start += timedelta(days=7)
                continue
            
            # Adjust start and end dates if they extend beyond our month
            report_start = max(week_start, start_date)
            report_end = min(week_end, end_date)
            
            # Calculate weekly averages and totals for this period
            
            # Nutrition
            meals = MealLog.objects.filter(
                user=request.user,
                date__range=(report_start, report_end)
            )
            total_calories = meals.aggregate(total=Sum('total_calories'))['total'] or 0
            
            # Activity
            workouts = WorkoutLog.objects.filter(
                user=request.user,
                date__range=(report_start, report_end)
            )
            total_workout_minutes = workouts.aggregate(total=Sum('duration'))['total'] or 0
            total_calories_burned = workouts.aggregate(total=Sum('calories_burned'))['total'] or 0
            
            # Water
            water_logs = WaterLog.objects.filter(
                user=request.user,
                date__range=(report_start, report_end)
            )
            total_water = water_logs.aggregate(total=Sum('amount'))['total'] or 0
            
            # Health Scores
            health_scores = HealthScore.objects.filter(
                user=request.user,
                calculation_date__range=(report_start, report_end)
            )
            avg_health_score = health_scores.aggregate(avg=Avg('overall_score'))['avg'] or 0
            
            # Days in this period
            days_in_period = (report_end - report_start).days + 1
            
            weekly_summary = {
                'start_date': report_start.strftime('%Y-%m-%d'),
                'end_date': report_end.strftime('%Y-%m-%d'),
                'days_in_period': days_in_period,
                'nutrition': {
                    'total_calories': total_calories,
                    'avg_daily_calories': total_calories / days_in_period if days_in_period > 0 else 0
                },
                'activity': {
                    'total_workout_minutes': total_workout_minutes,
                    'total_calories_burned': total_calories_burned,
                    'avg_daily_workout_minutes': total_workout_minutes / days_in_period if days_in_period > 0 else 0
                },
                'hydration': {
                    'total_water': total_water,
                    'avg_daily_water': total_water / days_in_period if days_in_period > 0 else 0
                },
                'health_score': {
                    'average': float(avg_health_score) if avg_health_score else 0
                }
            }
            
            weekly_summaries.append(weekly_summary)
            week_start += timedelta(days=7)
        
        # Calculate monthly totals and averages
        monthly_totals = {
            'total_calories_consumed': sum(week['nutrition']['total_calories'] for week in weekly_summaries),
            'total_workout_minutes': sum(week['activity']['total_workout_minutes'] for week in weekly_summaries),
            'total_calories_burned': sum(week['activity']['total_calories_burned'] for week in weekly_summaries),
            'total_water': sum(week['hydration']['total_water'] for week in weekly_summaries),
            'total_days': sum(week['days_in_period'] for week in weekly_summaries)
        }
        
        days_in_month = (end_date - start_date).days + 1
        
        monthly_averages = {
            'avg_daily_calories': monthly_totals['total_calories_consumed'] / days_in_month,
            'avg_daily_workout_minutes': monthly_totals['total_workout_minutes'] / days_in_month,
            'avg_daily_water': monthly_totals['total_water'] / days_in_month,
        }
        
        # Get health metrics for the month
        
        # Mood trend
        mood_logs = MoodLog.objects.filter(
            user=request.user,
            date__range=(start_date, end_date)
        )
        
        avg_mood = mood_logs.aggregate(avg=Avg('mood'))['avg'] or 0
        
        # Weight trend
        vitals_logs = VitalsLog.objects.filter(
            user=request.user,
            date__range=(start_date, end_date),
            weight__isnull=False
        ).order_by('date')
        
        weight_start = None
        weight_end = None
        
        if vitals_logs.exists():
            first_log = vitals_logs.first()
            last_log = vitals_logs.last()
            
            if first_log and last_log:
                weight_start = float(first_log.weight)
                weight_end = float(last_log.weight)
        
        # Health score trend
        health_scores = HealthScore.objects.filter(
            user=request.user,
            calculation_date__range=(start_date, end_date)
        ).order_by('calculation_date')
        
        health_score_trend = []
        if health_scores.exists():
            for score in health_scores:
                health_score_trend.append({
                    'date': score.calculation_date.strftime('%Y-%m-%d'),
                    'overall_score': float(score.overall_score)
                })
        
        # Get trends for the month
        trends = []
        
        # Weight trend
        if weight_start is not None and weight_end is not None:
            weight_change = weight_end - weight_start
            if abs(weight_change) > 0.1:  # Only report significant changes
                trend_direction = 'increased' if weight_change > 0 else 'decreased'
                trends.append({
                    'metric': 'weight',
                    'start_value': weight_start,
                    'end_value': weight_end,
                    'change': abs(weight_change),
                    'change_percentage': (abs(weight_change) / weight_start) * 100 if weight_start > 0 else 0,
                    'direction': trend_direction,
                    'description': f"Your weight {trend_direction} by {abs(weight_change):.1f} kg this month."
                })
        
        # Workout trend
        if len(weekly_summaries) >= 2:
            first_week = weekly_summaries[0]
            last_week = weekly_summaries[-1]
            
            workout_start = first_week['activity']['avg_daily_workout_minutes']
            workout_end = last_week['activity']['avg_daily_workout_minutes']
            
            if workout_start > 0 or workout_end > 0:
                workout_change = workout_end - workout_start
                if abs(workout_change) > 5:  # Only report significant changes
                    trend_direction = 'increased' if workout_change > 0 else 'decreased'
                    trends.append({
                        'metric': 'workout_minutes',
                        'start_value': workout_start,
                        'end_value': workout_end,
                        'change': abs(workout_change),
                        'change_percentage': (abs(workout_change) / workout_start) * 100 if workout_start > 0 else 0,
                        'direction': trend_direction,
                        'description': f"Your average daily workout time {trend_direction} by {abs(workout_change):.1f} minutes from the beginning to the end of the month."
                    })
        
        # Get achievements for the month
        achievements = []
        
        # Check for completed goals
        completed_goals = HealthGoal.objects.filter(
            user=request.user,
            status='completed',
            updated_at__date__range=(start_date, end_date)
        )
        
        for goal in completed_goals:
            achievements.append({
                'type': 'goal_completed',
                'title': f"Goal Completed: {goal.title}",
                'description': f"You successfully completed your health goal: {goal.title}",
                'date': goal.updated_at.date().strftime('%Y-%m-%d')
            })
        
        # Check for workout streaks
        # This is a simplified version; a real implementation would be more sophisticated
        
        # Get all workout days in the month
        workout_days = set(
            WorkoutLog.objects.filter(
                user=request.user,
                date__range=(start_date, end_date)
            ).values_list('date', flat=True)
        )
        
        # Check for streaks
        current_streak = 0
        max_streak = 0
        
        current_date = start_date
        while current_date <= end_date:
            if current_date in workout_days:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
            
            current_date += timedelta(days=1)
        
        if max_streak >= 5:
            achievements.append({
                'type': 'workout_streak',
                'title': f"{max_streak}-Day Workout Streak",
                'description': f"You worked out for {max_streak} consecutive days this month!",
                'date': end_date.strftime('%Y-%m-%d')  # We don't know the exact end date of the streak here
            })
        
        # Combine all data into the monthly report
        report_data = {
            'month': month,
            'year': year,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'weekly_summaries': weekly_summaries,
            'monthly_totals': monthly_totals,
            'monthly_averages': monthly_averages,
            'trends': trends,
            'achievements': achievements
        }
        
        # Save the report if requested
        save_report = request.query_params.get('save', 'false').lower() == 'true'
        if save_report:
            month_name = start_date.strftime('%B')
            SavedReport.objects.create(
                user=request.user,
                report_type='monthly',
                title=f"Monthly Report - {month_name} {year}",
                description=f"Monthly health summary for {month_name} {year}",
                parameters={
                    'month': month,
                    'year': year
                },
                data=report_data,
                start_date=start_date,
                end_date=end_date
            )
        
        serializer = MonthlyReportSerializer(report_data)
        return Response(serializer.data)


class ExportReportViewSet(viewsets.ViewSet):
    """
    ViewSet for exporting reports.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def export(self, request):
        """
        Export a saved report in the specified format.
        """
        # This would typically involve generating an export file
        # For this example, we'll just return a success message
        
        report_id = request.data.get('report_id')
        export_format = request.data.get('format', 'pdf')
        
        if not report_id:
            return Response({'error': 'Report ID is required.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            report = SavedReport.objects.get(id=report_id, user=request.user)
        except SavedReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # In a real implementation, this would generate and save the exported file
        # Here we'll just create a placeholder record
        
        exported_report = ExportedReport(
            user=request.user,
            saved_report=report,
            export_format=export_format,
            # In a real implementation, this would be set to the actual file path
            file_path='/placeholder/path'
        )
        
        exported_report.save()
        
        return Response({
            'message': f'Report successfully exported as {export_format.upper()}',
            'exported_report_id': exported_report.id
        })