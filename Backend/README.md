# Health Tracking API

A comprehensive Django REST API for health tracking applications.

## Features

- Complete user authentication and profile management
- Health data tracking (workouts, meals, water, sleep, vitals, medications, mood)
- Health goal setting and tracking
- Data analytics with health scoring and insights
- Detailed reporting with daily, weekly, and monthly reports
- Admin portal for system management and monitoring

## Tech Stack

- Django 4.2.9
- Django REST Framework 3.14.0
- PostgreSQL database
- JWT Authentication

## Requirements

- Python 3.8+
- PostgreSQL

## Setup Instructions

1. Clone the repository
2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env-example` to `.env` and configure your environment variables:
   ```
   cp .env-example .env
   ```
5. Run migrations:
   ```
   python manage.py migrate
   ```
6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```
7. Start the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Authentication

- `POST /api/users/register/` - Register a new user
- `POST /api/users/login/` - Login and get JWT tokens
- `POST /api/users/token/refresh/` - Refresh JWT token
- `POST /api/users/logout/` - Logout

### User Profile

- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile
- `GET /api/users/preferences/` - Get user preferences
- `PUT /api/users/preferences/` - Update user preferences
- `POST /api/users/change-password/` - Change password

### Health Records

- `/api/health/workouts/` - Workout logs CRUD
- `/api/health/meals/` - Meal logs CRUD
- `/api/health/water/` - Water logs CRUD
- `/api/health/sleep/` - Sleep logs CRUD
- `/api/health/vitals/` - Vitals logs CRUD
- `/api/health/medications/` - Medication logs CRUD
- `/api/health/mood/` - Mood logs CRUD
- `/api/health/goals/` - Health goals CRUD
- `/api/health/summary/daily/` - Get daily health summary
- `/api/health/summary/weekly/` - Get weekly health summary

### Analytics

- `/api/analytics/health-scores/calculate/` - Calculate health scores
- `/api/analytics/recommendations/` - Get personalized recommendations
- `/api/analytics/insights/` - Get health insights
- `/api/analytics/trends/weight/` - Weight trend analysis
- `/api/analytics/trends/sleep/` - Sleep trend analysis
- `/api/analytics/correlations/sleep_mood/` - Sleep-mood correlation analysis
- `/api/analytics/goals/progress/` - Track goal progress

### Reporting

- `/api/reports/generate/daily/` - Generate daily report
- `/api/reports/generate/weekly/` - Generate weekly report
- `/api/reports/generate/monthly/` - Generate monthly report
- `/api/reports/saved-reports/` - Manage saved reports
- `/api/reports/templates/` - Manage report templates
- `/api/reports/export/` - Export reports

### Admin Portal

- `/api/admin-portal/dashboard/summary/` - System dashboard summary
- `/api/admin-portal/users/` - User management
- `/api/admin-portal/audit-logs/` - View audit logs
- `/api/admin-portal/system-settings/` - Manage system settings
- `/api/admin-portal/notifications/` - Manage system notifications

## Documentation

Interactive API documentation is available at `/api/docs/` when the server is running.

## License

This project is licensed under the MIT License.