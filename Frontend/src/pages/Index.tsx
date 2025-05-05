
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import DashboardOverview from '@/components/health/DashboardOverview';
import WorkoutTracker from '@/components/health/WorkoutTracker';
import WaterTracker from '@/components/health/WaterTracker';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Settings } from 'lucide-react';
import { 
  User, 
  WorkoutLog, 
  WaterLog, 
  MealLog, 
  SleepLog, 
  VitalLog, 
  MoodLog, 
  HealthGoal 
} from '@/types/health';
import { 
  currentUser as mockUser,
  workoutLogs as mockWorkouts,
  waterLogs as mockWaterLogs,
  todayWaterIntake,
  healthGoals as mockGoals,
  healthInsights,
  weeklyActivityData,
  nutrientBreakdown
} from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { toast } = useToast();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // UI state
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Health data state
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(mockWorkouts);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(mockWaterLogs);
  const [waterIntake, setWaterIntake] = useState(todayWaterIntake);
  const [caloriesBurned, setCaloriesBurned] = useState(mockWorkouts.reduce((total, workout) => total + workout.calories, 0));
  const [goals, setGoals] = useState<HealthGoal[]>(mockGoals);
  
  const handleLogin = (email: string, password: string) => {
    if (email && password) {
      // In a real app, this would call a backend authentication service
      setUser(mockUser);
      setIsAuthenticated(true);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in to LifePulse.",
      });
    }
  };
  
  const handleRegister = (userData: {
    name: string;
    email: string;
    password: string;
    height?: number;
    weight?: number;
    gender?: string;
    goal?: string;
  }) => {
    // In a real app, this would send the registration data to a backend
    const newUser: User = {
      id: uuidv4(),
      email: userData.email,
      name: userData.name,
      height: userData.height,
      weight: userData.weight,
      goal: userData.goal || 'Improve overall health',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    setShowRegister(false);
    
    toast({
      title: "Account created",
      description: "Welcome to LifePulse! Your account has been successfully created.",
    });
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setSelectedTab('dashboard');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  const addWorkout = (workout: Omit<WorkoutLog, 'id'>) => {
    const newWorkout: WorkoutLog = {
      id: uuidv4(),
      ...workout
    };
    
    setWorkouts([newWorkout, ...workouts]);
    setCaloriesBurned(prev => prev + workout.calories);
    
    // Update relevant goals
    setGoals(prev => 
      prev.map(goal => {
        if (goal.category === 'workout') {
          return {
            ...goal,
            current: goal.current + 1 > goal.target ? goal.target : goal.current + 1
          };
        }
        return goal;
      })
    );
  };
  
  const deleteWorkout = (id: string) => {
    const workoutToDelete = workouts.find(w => w.id === id);
    if (workoutToDelete) {
      setWorkouts(workouts.filter(w => w.id !== id));
      setCaloriesBurned(prev => prev - workoutToDelete.calories);
      
      toast({
        title: "Workout deleted",
        description: "The workout has been removed from your records.",
      });
    }
  };
  
  const addWater = (amount: number) => {
    const newWaterLog: WaterLog = {
      id: uuidv4(),
      amount,
      timestamp: new Date().toISOString()
    };
    
    setWaterLogs([newWaterLog, ...waterLogs]);
    setWaterIntake(prev => prev + amount);
    
    // Update water intake goal
    setGoals(prev => 
      prev.map(goal => {
        if (goal.category === 'water') {
          const newCurrent = goal.current + amount;
          return {
            ...goal,
            current: newCurrent > goal.target ? goal.target : newCurrent
          };
        }
        return goal;
      })
    );
  };
  
  const deleteWaterLog = (id: string) => {
    const logToDelete = waterLogs.find(log => log.id === id);
    if (logToDelete) {
      setWaterLogs(waterLogs.filter(log => log.id !== id));
      setWaterIntake(prev => prev - logToDelete.amount);
      
      // Update water intake goal
      setGoals(prev => 
        prev.map(goal => {
          if (goal.category === 'water') {
            return {
              ...goal,
              current: Math.max(0, goal.current - logToDelete.amount)
            };
          }
          return goal;
        })
      );
      
      toast({
        title: "Water log deleted",
        description: "The water log has been removed from your records.",
      });
    }
  };

  // Render different sections based on selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            user={user}
            workouts={workouts}
            waterIntake={waterIntake}
            caloriesBurned={caloriesBurned}
            goals={goals}
            insights={healthInsights}
            activityData={weeklyActivityData}
            nutrientData={nutrientBreakdown}
          />
        );
      case 'workouts':
        return (
          <WorkoutTracker 
            workouts={workouts}
            addWorkout={addWorkout}
            deleteWorkout={deleteWorkout}
          />
        );
      case 'water':
      case 'nutrition':
        return (
          <WaterTracker 
            waterLogs={waterLogs}
            totalWaterIntake={waterIntake}
            addWater={addWater}
            deleteWaterLog={deleteWaterLog}
          />
        );
      default:
        return (
          <div className="text-center py-20">
            <Activity className="w-16 h-16 mx-auto text-health-primary opacity-20 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-gray-500">
              We're working on this feature and it will be available soon.
            </p>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-health-gradient shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative pulsing-ring rounded-full p-1">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">LifePulse</h1>
              </div>
              <Link to="/admin">
                <Button variant="outline" size="sm" className="bg-white/20 border-white/10 text-white hover:bg-white/30">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Auth Forms */}
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {showRegister ? (
              <RegisterForm onRegister={handleRegister} onShowLogin={() => setShowRegister(false)} />
            ) : (
              <LoginForm onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        user={user}
        onLogout={handleLogout}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        toggleMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      {isMobileMenuOpen && (
        <MobileMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          user={user}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-end mb-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Admin Portal
            </Button>
          </Link>
        </div>
        {renderContent()}
      </main>
       Nicky
      <Footer />
    </div>
  );
};

export default Index;
