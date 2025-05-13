
import React from 'react';
import { 
  Activity, 
  Droplets, 
  Scale, 
  Heart, 
  Calendar, 
  Flame, 
  Timer, 
  Utensils,
  Moon,
  TrendingUp,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User, WorkoutLog, HealthGoal } from '@/types/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardOverviewProps {
  user: User | null;
  workouts: WorkoutLog[];
  waterIntake: number;
  caloriesBurned: number;
  goals: HealthGoal[];
  insights: string[];
  activityData: any[];
  nutrientData: any[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  workouts,
  waterIntake,
  caloriesBurned,
  goals,
  insights,
  activityData,
  nutrientData
}) => {
  const COLORS = ['#6366f1', '#a5b4fc', '#818cf8', '#4f46e5'];
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Welcome back, {user?.first_name}!</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
            <Button className="bg-health-primary hover:bg-health-secondary">
              <Bell className="w-4 h-4 mr-2" /> 
              Reminders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="bg-health-light rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-health-primary">{goal.name}</h3>
                  <span className="text-sm">{Math.round((goal.current / goal.target) * 100)}%</span>
                </div>
                <Progress className="h-2" value={(goal.current / goal.target) * 100} />
                <p className="text-sm text-gray-500 mt-2">
                  {goal.current} / {goal.target} {goal.unit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-health-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-health-light p-3 rounded-lg">
                <Flame className="w-6 h-6 text-health-primary" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Calories Burned</p>
                <h3 className="text-2xl font-bold">{caloriesBurned}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-health-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-health-light p-3 rounded-lg">
                <Droplets className="w-6 h-6 text-health-primary" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Water Intake</p>
                <h3 className="text-2xl font-bold">{waterIntake}ml</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-health-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-health-light p-3 rounded-lg">
                <Scale className="w-6 h-6 text-health-primary" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Current Weight</p>
                <h3 className="text-2xl font-bold">{user?.weight}kg</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-health-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-health-light p-3 rounded-lg">
                <Heart className="w-6 h-6 text-health-primary" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Avg Heart Rate</p>
                <h3 className="text-2xl font-bold">72 bpm</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-health-primary" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="calories"
                    stroke="#6366f1"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="workout"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Utensils className="w-5 h-5 text-health-primary" /> Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={nutrientData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {nutrientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-500">Daily macronutrient breakdown</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-health-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workouts.slice(0, 4).map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-health-light p-2 rounded-full">
                      <Timer className="w-4 h-4 text-health-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{workout.type}</p>
                      <p className="text-xs text-gray-500">{workout.duration} minutes • {workout.intensity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Flame className="w-4 h-4 text-health-primary" />
                      <span>{workout.calories}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(workout.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {workouts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button variant="outline" className="w-full">View All Activities</Button>
          </CardFooter>
        </Card>

        {/* Health Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-health-primary" /> Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-health-light p-2 rounded-full mt-0.5">
                    <TrendingUp className="w-4 h-4 text-health-primary" />
                  </div>
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button variant="outline" className="w-full">View Detailed Analysis</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Sleep Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Moon className="w-5 h-5 text-health-primary" /> Sleep Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-health-primary">7.5hrs</h3>
                <p className="text-sm text-gray-500">Average sleep duration</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-health-light rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Sleep Quality</p>
                  <p className="font-medium text-health-primary">Good</p>
                </div>
                <div className="bg-health-light rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Bedtime</p>
                  <p className="font-medium text-health-primary">11:15 PM</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: "Mon", hours: 7.2 },
                      { day: "Tue", hours: 6.8 },
                      { day: "Wed", hours: 7.5 },
                      { day: "Thu", hours: 8.1 },
                      { day: "Fri", hours: 7.6 },
                      { day: "Sat", hours: 8.5 },
                      { day: "Sun", hours: 7.9 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[6, 9]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#6366f1"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
