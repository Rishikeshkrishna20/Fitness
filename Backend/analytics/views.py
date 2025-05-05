"""
Views for the analytics app.
"""
from datetime import datetime, timedelta
import statistics
from django.db.models import Q, Avg, Count, Sum
from rest_framework import viewsets, permissions, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import IsOwner
from health_records.models import (
    WorkoutLog, MealLog, WaterLog, SleepLog, VitalsLog,
    MedicationLog, MoodLog, HealthGoal
)
from .models import HealthScore, Recommendation, Insight
from .serializers import (
    HealthScoreSerializer, RecommendationSerializer, InsightSerializer,
    TrendAnalysisSerializer, CorrelationAnalysisSerializer
)


class HealthScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for health scores.
    """
    queryset = HealthScore.objects.all()
    serializer_class = HealthScoreSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """
        Calculate and save health scores for the authenticated user.
        """
        date_str = request.data.get('date', datetime.now().strftime('%Y-%m-%d'))
        try:
            calculation_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Check if score for this date already exists
        existing_score = HealthScore.objects.filter(
            user=request.user,
            calculation_date=calculation_date
        ).first()
        
        if existing_score:
            # Update the existing score
            health_score = existing_score
        else:
            # Create a new score object
            health_score = HealthScore(
                user=request.user,
                calculation_date=calculation_date
            )
        
        # Get relevant health data
        # This could be encapsulated in a separate scoring service
        
        # Nutrition score (based on meals)
        meals = MealLog.objects.filter(
            user=request.user,
            date=calculation_date
        )
        
        user_preferences = request.user.preferences
        daily_calorie_goal = user_preferences.daily_calorie_goal
        
        total_calories = meals.aggregate(total=Sum('total_calories'))['total'] or 0
        protein_sum = meals.aggregate(total=Sum('protein'))['total'] or 0
        carbs_sum = meals.aggregate(total=Sum('carbs'))['total'] or 0
        fat_sum = meals.aggregate(total=Sum('fat'))['total'] or 0
        
        # Simple scoring logic - could be much more sophisticated
        calorie_score = 100 - min(100, abs(total_calories - daily_calorie_goal) / daily_calorie_goal * 100)
        nutrition_score = calorie_score
        
        # Calculate macronutrient balance score if we have the data
        if protein_sum and carbs_sum and fat_sum:
            total_macros = protein_sum + carbs_sum + fat_sum
            protein_pct = (protein_sum / total_macros) * 100
            carbs_pct = (carbs_sum / total_macros) * 100
            fat_pct = (fat_sum / total_macros) * 100
            
            # Ideal macronutrient distribution (this is simplified)
            ideal_protein = 25  # 25% of total calories from protein
            ideal_carbs = 50    # 50% of total calories from carbs
            ideal_fat = 25      # 25% of total calories from fat
            
            macro_balance_score = 100 - (
                abs(protein_pct - ideal_protein) +
                abs(carbs_pct - ideal_carbs) +
                abs(fat_pct - ideal_fat)
            ) / 2
            
            # Combine with calorie score
            nutrition_score = (calorie_score + macro_balance_score) / 2
        
        # Activity score (based on workouts)
        workouts = WorkoutLog.objects.filter(
            user=request.user,
            date=calculation_date
        )
        
        total_duration = workouts.aggregate(total=Sum('duration'))['total'] or 0
        calories_burned = workouts.aggregate(total=Sum('calories_burned'))['total'] or 0
        
        # Base score on minutes of activity (150 min/week is ~21 min/day recommended)
        activity_score = min(100, total_duration / 30 * 100)
        
        # Sleep score
        # Find sleep logs that end on the given date
        end_time_min = datetime.combine(calculation_date, datetime.min.time())
        end_time_max = datetime.combine(calculation_date, datetime.max.time())
        
        sleep_logs = SleepLog.objects.filter(
            user=request.user,
            end_time__range=(end_time_min, end_time_max)
        )
        
        sleep_duration = sleep_logs.aggregate(total=Avg('duration'))['total'] or 0
        sleep_quality = sleep_logs.aggregate(avg=Avg('quality'))['avg'] or 0
        
        # Score based on 7-9 hours optimal sleep duration and quality
        duration_score = 100 - min(100, abs(sleep_duration - 8) / 8 * 100)
        quality_score = sleep_quality / 5 * 100 if sleep_quality else 0
        sleep_score = (duration_score + quality_score) / 2 if sleep_duration else 0
        
        # Hydration score
        water_logs = WaterLog.objects.filter(
            user=request.user,
            date=calculation_date
        )
        
        total_water = water_logs.aggregate(total=Sum('amount'))['total'] or 0
        daily_water_goal = user_preferences.daily_water_goal
        
        hydration_score = min(100, total_water / daily_water_goal * 100)
        
        # Vitals score
        vitals = VitalsLog.objects.filter(
            user=request.user,
            date=calculation_date
        ).order_by('-time').first()
        
        vitals_score = None
        if vitals:
            # Simplified scoring based on heart rate in normal range
            if vitals.heart_rate:
                hr_normal_min, hr_normal_max = 60, 100
                hr_score = 100 - min(100, abs(vitals.heart_rate - (hr_normal_min + hr_normal_max)/2) / 20 * 100)
                
                # Blood pressure scoring (if available)
                bp_score = None
                if vitals.blood_pressure_systolic and vitals.blood_pressure_diastolic:
                    # Simplified scoring based on normal ranges
                    systolic_normal = 120
                    diastolic_normal = 80
                    
                    systolic_score = 100 - min(100, abs(vitals.blood_pressure_systolic - systolic_normal) / 20 * 100)
                    diastolic_score = 100 - min(100, abs(vitals.blood_pressure_diastolic - diastolic_normal) / 10 * 100)
                    
                    bp_score = (systolic_score + diastolic_score) / 2
                
                # Combine available scores
                vitals_score = hr_score if bp_score is None else (hr_score + bp_score) / 2
        
        # Mood score
        mood_logs = MoodLog.objects.filter(
            user=request.user,
            date=calculation_date
        )
        
        avg_mood = mood_logs.aggregate(avg=Avg('mood'))['avg'] or 0
        mood_score = avg_mood / 5 * 100 if avg_mood else None
        
        # Calculate overall health score (weighted average of component scores)
        components = [
            (nutrition_score, 0.25),  # 25% weight
            (activity_score, 0.25),   # 25% weight
            (sleep_score, 0.2),       # 20% weight
            (hydration_score, 0.15),  # 15% weight
        ]
        
        # Add optional components if available
        if vitals_score:
            components.append((vitals_score, 0.1))  # 10% weight
        
        if mood_score:
            components.append((mood_score, 0.05))  # 5% weight
            
        # Calculate weighted average for overall score
        total_weight = sum(weight for _, weight in components)
        overall_score = sum(score * (weight/total_weight) for score, weight in components)
        
        # Save calculated scores
        health_score.overall_score = overall_score
        health_score.nutrition_score = nutrition_score
        health_score.activity_score = activity_score
        health_score.sleep_score = sleep_score
        health_score.hydration_score = hydration_score
        
        if vitals_score:
            health_score.vitals_score = vitals_score
            
        if mood_score:
            health_score.mood_score = mood_score
            
        # Save calculation details
        health_score.calculation_details = {
            'nutrition': {
                'total_calories': total_calories,
                'daily_calorie_goal': daily_calorie_goal,
                'protein_sum': float(protein_sum) if protein_sum else None,
                'carbs_sum': float(carbs_sum) if carbs_sum else None,
                'fat_sum': float(fat_sum) if fat_sum else None,
            },
            'activity': {
                'total_duration': total_duration,
                'calories_burned': calories_burned,
            },
            'sleep': {
                'duration': float(sleep_duration) if sleep_duration else None,
                'quality': float(sleep_quality) if sleep_quality else None,
            },
            'hydration': {
                'total_water': total_water,
                'daily_water_goal': daily_water_goal,
            },
            'vitals': {
                'heart_rate': vitals.heart_rate if vitals and vitals.heart_rate else None,
                'blood_pressure_systolic': vitals.blood_pressure_systolic if vitals and vitals.blood_pressure_systolic else None,
                'blood_pressure_diastolic': vitals.blood_pressure_diastolic if vitals and vitals.blood_pressure_diastolic else None,
            } if vitals else None,
            'mood': {
                'average_mood': float(avg_mood) if avg_mood else None,
            } if avg_mood else None,
        }
        
        health_score.save()
        
        # Generate recommendations based on scores
        self._generate_recommendations(health_score)
        
        return Response(HealthScoreSerializer(health_score).data)
    
    def _generate_recommendations(self, health_score):
        """
        Generate recommendations based on health scores.
        This could be much more sophisticated in a real application.
        """
        recommendations = []
        
        # Nutrition recommendations
        if health_score.nutrition_score < 70:
            recommendations.append({
                'recommendation_type': 'nutrition',
                'title': 'Improve your nutrition balance',
                'description': 'Try to align your calorie intake with your daily goal and focus on balanced macronutrients.',
                'priority': 2 if health_score.nutrition_score < 50 else 1,
                'based_on': {'nutrition_score': float(health_score.nutrition_score)}
            })
        
        # Activity recommendations
        if health_score.activity_score < 60:
            recommendations.append({
                'recommendation_type': 'activity',
                'title': 'Increase your physical activity',
                'description': 'Try to get at least 30 minutes of moderate exercise daily for better health outcomes.',
                'priority': 3 if health_score.activity_score < 40 else 2,
                'based_on': {'activity_score': float(health_score.activity_score)}
            })
        
        # Sleep recommendations
        if health_score.sleep_score < 70:
            recommendations.append({
                'recommendation_type': 'sleep',
                'title': 'Improve your sleep quality',
                'description': 'Aim for 7-9 hours of quality sleep and maintain a consistent sleep schedule.',
                'priority': 2 if health_score.sleep_score < 50 else 1,
                'based_on': {'sleep_score': float(health_score.sleep_score)}
            })
            
        # Hydration recommendations
        if health_score.hydration_score < 80:
            recommendations.append({
                'recommendation_type': 'hydration',
                'title': 'Increase your water intake',
                'description': 'Try to reach your daily water goal for better hydration and overall health.',
                'priority': 2 if health_score.hydration_score < 60 else 1,
                'based_on': {'hydration_score': float(health_score.hydration_score)}
            })
        
        # Create recommendation objects
        for rec_data in recommendations:
            Recommendation.objects.create(
                user=health_score.user,
                **rec_data
            )


class RecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for recommendations.
    """
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        # Filter by user and exclude dismissed recommendations
        return self.queryset.filter(
            user=self.request.user,
            is_dismissed=False
        )
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a recommendation as read.
        """
        recommendation = self.get_object()
        recommendation.is_read = True
        recommendation.save()
        return Response({'status': 'recommendation marked as read'})
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """
        Dismiss a recommendation.
        """
        recommendation = self.get_object()
        recommendation.is_dismissed = True
        recommendation.save()
        return Response({'status': 'recommendation dismissed'})


class InsightViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for insights.
    """
    queryset = Insight.objects.all()
    serializer_class = InsightSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark an insight as read.
        """
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        return Response({'status': 'insight marked as read'})


class TrendAnalysisViewSet(viewsets.ViewSet):
    """
    ViewSet for trend analysis.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def weight(self, request):
        """
        Analyze weight trends over time.
        """
        # Get time period from request
        days = int(request.query_params.get('days', 30))
        
        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get weight measurements in date range
        vitals_logs = VitalsLog.objects.filter(
            user=request.user,
            date__range=(start_date, end_date),
            weight__isnull=False
        ).order_by('date')
        
        # Format data points
        data_points = [
            {
                'date': log.date.strftime('%Y-%m-%d'),
                'value': float(log.weight)
            }
            for log in vitals_logs
        ]
        
        if len(data_points) < 2:
            return Response({
                'error': 'Not enough data points for trend analysis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate simple trend
        weights = [point['value'] for point in data_points]
        first_weight = weights[0]
        last_weight = weights[-1]
        weight_change = last_weight - first_weight
        
        if weight_change > 0:
            trend = 'increasing'
            change_direction = 'up'
        elif weight_change < 0:
            trend = 'decreasing'
            change_direction = 'down'
        else:
            trend = 'stable'
            change_direction = 'unchanged'
        
        change_percentage = (abs(weight_change) / first_weight) * 100
        
        # Generate analysis text
        if trend == 'increasing':
            analysis = f"Your weight has increased by {weight_change:.1f} kg ({change_percentage:.1f}%) over the past {days} days."
        elif trend == 'decreasing':
            analysis = f"Your weight has decreased by {abs(weight_change):.1f} kg ({change_percentage:.1f}%) over the past {days} days."
        else:
            analysis = f"Your weight has remained stable over the past {days} days."
        
        result = {
            'metric': 'weight',
            'time_period': f'last {days} days',
            'data_points': data_points,
            'trend': trend,
            'change_percentage': change_percentage,
            'change_direction': change_direction,
            'analysis': analysis
        }
        
        serializer = TrendAnalysisSerializer(result)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sleep(self, request):
        """
        Analyze sleep trends over time.
        """
        # Get time period from request
        days = int(request.query_params.get('days', 30))
        
        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get sleep logs in date range
        sleep_logs = SleepLog.objects.filter(
            user=request.user,
            start_time__date__range=(start_date, end_date)
        ).order_by('start_time')
        
        # Format data points
        data_points = [
            {
                'date': log.start_time.date().strftime('%Y-%m-%d'),
                'duration': float(log.duration),
                'quality': log.quality
            }
            for log in sleep_logs
        ]
        
        if len(data_points) < 2:
            return Response({
                'error': 'Not enough data points for trend analysis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate trends
        durations = [point['duration'] for point in data_points]
        avg_duration = sum(durations) / len(durations)
        
        # Check for trend in last week vs. previous period
        if len(durations) >= 14:
            recent_durations = durations[-7:]
            earlier_durations = durations[-14:-7]
            
            recent_avg = sum(recent_durations) / len(recent_durations)
            earlier_avg = sum(earlier_durations) / len(earlier_durations)
            
            duration_change = recent_avg - earlier_avg
            
            if duration_change > 0.5:
                trend = 'improving'
                change_direction = 'up'
            elif duration_change < -0.5:
                trend = 'worsening'
                change_direction = 'down'
            else:
                trend = 'stable'
                change_direction = 'unchanged'
            
            change_percentage = (abs(duration_change) / earlier_avg) * 100
        else:
            trend = 'insufficient data for trend'
            change_direction = 'unknown'
            change_percentage = 0
        
        # Generate analysis text
        if trend == 'improving':
            analysis = f"Your sleep duration has improved by {duration_change:.1f} hours ({change_percentage:.1f}%) in the last week compared to the previous week."
        elif trend == 'worsening':
            analysis = f"Your sleep duration has decreased by {abs(duration_change):.1f} hours ({change_percentage:.1f}%) in the last week compared to the previous week."
        elif trend == 'stable':
            analysis = f"Your sleep duration has remained stable around {avg_duration:.1f} hours per night."
        else:
            analysis = f"Your average sleep duration is {avg_duration:.1f} hours per night. More data is needed for trend analysis."
        
        result = {
            'metric': 'sleep_duration',
            'time_period': f'last {days} days',
            'data_points': data_points,
            'trend': trend,
            'change_percentage': change_percentage,
            'change_direction': change_direction,
            'analysis': analysis
        }
        
        serializer = TrendAnalysisSerializer(result)
        return Response(serializer.data)


class CorrelationAnalysisViewSet(viewsets.ViewSet):
    """
    ViewSet for correlation analysis.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def sleep_mood(self, request):
        """
        Analyze correlation between sleep and mood.
        """
        # Get time period from request
        days = int(request.query_params.get('days', 30))
        
        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get sleep and mood data in the same days
        sleep_data = {}
        mood_data = {}
        
        # Get sleep data
        sleep_logs = SleepLog.objects.filter(
            user=request.user,
            start_time__date__range=(start_date, end_date)
        )
        
        for log in sleep_logs:
            date_key = log.start_time.date().strftime('%Y-%m-%d')
            if date_key not in sleep_data:
                sleep_data[date_key] = []
            sleep_data[date_key].append({
                'duration': float(log.duration),
                'quality': log.quality
            })
        
        # Get mood data
        mood_logs = MoodLog.objects.filter(
            user=request.user,
            date__range=(start_date, end_date)
        )
        
        for log in mood_logs:
            date_key = log.date.strftime('%Y-%m-%d')
            if date_key not in mood_data:
                mood_data[date_key] = []
            mood_data[date_key].append({
                'mood': log.mood,
                'energy': log.energy
            })
        
        # Find dates with both sleep and mood data
        common_dates = set(sleep_data.keys()) & set(mood_data.keys())
        
        if len(common_dates) < 5:
            return Response({
                'error': 'Not enough matching data points for correlation analysis (at least 5 required)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate average values for each date
        paired_data = []
        
        for date in common_dates:
            # Average sleep data for the date
            sleep_entries = sleep_data[date]
            avg_duration = sum(entry['duration'] for entry in sleep_entries) / len(sleep_entries)
            avg_quality = sum(entry['quality'] for entry in sleep_entries) / len(sleep_entries)
            
            # Average mood data for the date
            mood_entries = mood_data[date]
            avg_mood = sum(entry['mood'] for entry in mood_entries) / len(mood_entries)
            avg_energy = sum(entry['energy'] for entry in mood_entries if entry['energy']) / len([e for e in mood_entries if e['energy']])
            
            paired_data.append({
                'date': date,
                'sleep_duration': avg_duration,
                'sleep_quality': avg_quality,
                'mood': avg_mood,
                'energy': avg_energy if not isinstance(avg_energy, float) or not avg_energy.is_nan() else None
            })
        
        # Calculate correlation between sleep quality and mood
        quality_values = [entry['sleep_quality'] for entry in paired_data]
        mood_values = [entry['mood'] for entry in paired_data]
        
        # Simple correlation calculation (normally would use numpy/scipy)
        # This is a simplified Pearson correlation implementation
        n = len(quality_values)
        sum_x = sum(quality_values)
        sum_y = sum(mood_values)
        sum_xy = sum(x*y for x, y in zip(quality_values, mood_values))
        sum_x2 = sum(x*x for x in quality_values)
        sum_y2 = sum(y*y for y in mood_values)
        
        # Calculate correlation coefficient
        numerator = n * sum_xy - sum_x * sum_y
        denominator_x = (n * sum_x2 - sum_x**2)**0.5
        denominator_y = (n * sum_y2 - sum_y**2)**0.5
        denominator = denominator_x * denominator_y
        
        if denominator == 0:
            correlation = 0
        else:
            correlation = numerator / denominator
        
        # Interpret correlation
        if correlation >= 0.7:
            strength = 'strong'
            direction = 'positive'
        elif correlation >= 0.3:
            strength = 'moderate'
            direction = 'positive'
        elif correlation >= 0.1:
            strength = 'weak'
            direction = 'positive'
        elif correlation >= -0.1:
            strength = 'none'
            direction = 'neutral'
        elif correlation >= -0.3:
            strength = 'weak'
            direction = 'negative'
        elif correlation >= -0.7:
            strength = 'moderate'
            direction = 'negative'
        else:
            strength = 'strong'
            direction = 'negative'
        
        # Generate analysis text
        if strength == 'strong' and direction == 'positive':
            analysis = "There is a strong positive correlation between your sleep quality and mood. Better sleep quality is strongly associated with better mood."
        elif strength == 'moderate' and direction == 'positive':
            analysis = "There is a moderate positive correlation between your sleep quality and mood. Better sleep quality tends to be associated with better mood."
        elif strength == 'weak' and direction == 'positive':
            analysis = "There is a weak positive correlation between your sleep quality and mood. Better sleep quality may be slightly associated with better mood."
        elif strength == 'none':
            analysis = "There is no significant correlation between your sleep quality and mood based on the available data."
        elif strength == 'weak' and direction == 'negative':
            analysis = "There is a weak negative correlation between your sleep quality and mood. This is unusual and may be due to other factors."
        elif strength == 'moderate' and direction == 'negative':
            analysis = "There is a moderate negative correlation between your sleep quality and mood. This is unexpected and might indicate other factors influencing your mood."
        else:
            analysis = "There is a strong negative correlation between your sleep quality and mood. This is very unusual and may indicate other significant factors affecting your mood."
        
        result = {
            'metric1': 'sleep_quality',
            'metric2': 'mood',
            'correlation_coefficient': round(correlation, 3),
            'strength': strength,
            'direction': direction,
            'analysis': analysis
        }
        
        serializer = CorrelationAnalysisSerializer(result)
        return Response(serializer.data)


class GoalTrackingViewSet(viewsets.ViewSet):
    """
    ViewSet for goal tracking and analysis.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """
        Get progress on active goals.
        """
        active_goals = HealthGoal.objects.filter(
            user=request.user,
            status='active'
        )
        
        goals_data = []
        
        for goal in active_goals:
            # Calculate days remaining
            days_total = (goal.target_date - goal.start_date).days
            days_elapsed = (datetime.now().date() - goal.start_date).days
            days_remaining = (goal.target_date - datetime.now().date()).days
            
            # Calculate expected progress at this point
            if days_total > 0:
                expected_progress = min(100, (days_elapsed / days_total) * 100)
            else:
                expected_progress = 100
            
            # Determine if goal is on track
            if goal.progress >= expected_progress:
                status = 'on_track'
            elif goal.progress >= expected_progress * 0.7:
                status = 'slightly_behind'
            else:
                status = 'significantly_behind'
            
            goals_data.append({
                'id': goal.id,
                'title': goal.title,
                'goal_type': goal.goal_type,
                'description': goal.description,
                'target_value': float(goal.target_value) if goal.target_value else None,
                'unit': goal.unit,
                'start_date': goal.start_date,
                'target_date': goal.target_date,
                'progress': float(goal.progress),
                'days_remaining': days_remaining,
                'expected_progress': expected_progress,
                'status': status
            })
        
        return Response(goals_data)