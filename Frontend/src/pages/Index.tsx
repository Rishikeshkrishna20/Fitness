import React, { useEffect, useState } from 'react';
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
import { WorkoutService } from '@/services/workout.service';
import { WaterService } from '@/services/water.service';
import { UserService, WeightHistoryItem } from '@/services/user.service';

const Index = () => {
  const { toast } = useToast();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI state
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Health data state
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [avgHeartRate, setAvgHeartRate] = useState(72); // Default heart rate
  const [userWeight, setUserWeight] = useState<number | undefined>(undefined);
  const [weightHistory, setWeightHistory] = useState<WeightHistoryItem[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>(mockGoals);
  const [insights, setInsights] = useState(healthInsights);
  
  // Fetch user profile from API or localStorage
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // First try to get user from localStorage
      const userJson = localStorage.getItem("user");
      console.log("User data from localStorage:", userJson);
      
      if (userJson) {
        const userData = JSON.parse(userJson);
        console.log("Parsed user data:", userData);
        console.log("User weight from localStorage:", userData.weight);
        
        // Convert weight from string to number if needed
        let userWeight = userData.weight;
        if (userWeight && typeof userWeight === 'string') {
          userWeight = parseFloat(userWeight);
        }
        
        // Update user state with localStorage data
        setUser(userData);
        setUserWeight(userWeight);
        
        // Add a personalized weight insight if weight is available
        if (userWeight) {
          const weightInsight = `Your current weight is ${userWeight}kg. ${
            userData.goal?.toLowerCase().includes('weight loss') 
              ? 'Keep up with your workout routine to reach your weight loss goal.'
              : 'Maintain a balanced diet and regular exercise routine to stay healthy.'
          }`;
          
          const updatedInsights = [...insights];
          const filteredInsights = updatedInsights.filter(insight => 
            !insight.includes('current weight') && !insight.includes('weight is')
          );
          
          // Add weight insight near the beginning but after heart rate insight
          filteredInsights.splice(1, 0, weightInsight);
          
          // Ensure we don't have too many insights
          if (filteredInsights.length > 5) {
            filteredInsights.pop();
          }
          
          setInsights(filteredInsights);
        }
        
        // No need to call API if we have user data in localStorage
        return;
      }
      
      // If not in localStorage, fall back to API
      const userData = await UserService.getCurrentUser();
      
      if (userData) {
        setUser(userData);
        setUserWeight(userData.weight);
        
        // Add weight insight logic (same as above)
        if (userData.weight) {
          const weightInsight = `Your current weight is ${userData.weight}kg. ${
            userData.goal?.toLowerCase().includes('weight loss') 
              ? 'Keep up with your workout routine to reach your weight loss goal.'
              : 'Maintain a balanced diet and regular exercise routine to stay healthy.'
          }`;
          
          const updatedInsights = [...insights];
          const filteredInsights = updatedInsights.filter(insight => 
            !insight.includes('current weight') && !insight.includes('weight is')
          );
          
          filteredInsights.splice(1, 0, weightInsight);
          
          if (filteredInsights.length > 5) {
            filteredInsights.pop();
          }
          
          setInsights(filteredInsights);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch weight history
  const fetchWeightHistory = async () => {
    try {
      const history = await UserService.getWeightHistory();
      setWeightHistory(history);
    } catch (error) {
      console.error('Failed to fetch weight history:', error);
      // If we have current weight but no history, create a minimal history
      if (userWeight) {
        setWeightHistory([
          { date: new Date().toISOString().split('T')[0], weight: userWeight }
        ]);
      }
    }
  };
  
  // Fetch workouts from API
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const workoutsData = await WorkoutService.getAll();
      setWorkouts(workoutsData);
      
      // Calculate calories burned from fetched workouts
      // This will be updated by the useEffect hook we added
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      toast({
        title: "Error",
        description: "Failed to load workout data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch water logs from API
  const fetchWaterLogs = async () => {
    try {
      setIsLoading(true);
      const waterData = await WaterService.getAll();
      setWaterLogs(waterData);
    } catch (error) {
      console.error('Failed to fetch water logs:', error);
      toast({
        title: "Error",
        description: "Failed to load water data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch daily total water intake
  const fetchDailyWaterTotal = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const totalAmount = await WaterService.getDailyTotal(today);
      setWaterIntake(totalAmount);
    } catch (error) {
      console.error('Failed to fetch daily water total:', error);
      // Fall back to calculating from logs if API fails
      if (waterLogs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = waterLogs.filter(log => 
          new Date(log.timestamp).toISOString().split('T')[0] === today
        );
        const total = todayLogs.reduce((sum, log) => sum + log.amount, 0);
        setWaterIntake(total);
      }
    }
  };

  // Handle updating user weight
  const updateUserWeight = async (newWeight: number) => {
    try {
      setIsLoading(true);
      const updatedUser = await UserService.updateWeight(newWeight);
      
      if (updatedUser) {
        setUser(updatedUser);
        setUserWeight(updatedUser.weight);
        
        // Add the new weight to history
        const today = new Date().toISOString().split('T')[0];
        setWeightHistory(prev => {
          // Remove any existing entry for today
          const filtered = prev.filter(item => item.date !== today);
          return [...filtered, { date: today, weight: newWeight }];
        });
        
        toast({
          title: "Weight Updated",
          description: `Your weight has been updated to ${newWeight}kg`,
        });
      }
    } catch (error) {
      console.error('Failed to update weight:', error);
      toast({
        title: "Error",
        description: "Failed to update weight",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  const addWorkout = async (workout: Omit<WorkoutLog, 'id'>) => {
    try {
      setIsLoading(true);
      const newWorkout = await WorkoutService.create(workout);
      
      setWorkouts([newWorkout, ...workouts]);
      setCaloriesBurned(prev => prev + newWorkout.calories);
      
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
      
      toast({
        title: "Workout Added",
        description: "Your workout has been successfully logged",
      });
    } catch (error) {
      console.error('Failed to add workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteWorkout = async (id: string) => {
    try {
      setIsLoading(true);
      const workoutToDelete = workouts.find(w => w.id === id);
      
      if (!workoutToDelete) {
        toast({
          title: "Error",
          description: "Workout not found",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Deleting workout with ID:", id);
      await WorkoutService.delete(id);
      
      // Only update state after successful API call
      setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== id));
      setCaloriesBurned(prev => prev - workoutToDelete.calories);
      
      toast({
        title: "Workout deleted",
        description: "The workout has been removed from your records.",
      });
    } catch (error: any) {
      console.error('Failed to delete workout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete workout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addWater = async (amount: number) => {
    try {
      setIsLoading(true);
      const newWaterLog: Omit<WaterLog, 'id'> = {
        amount,
        timestamp: new Date().toISOString()
      };
      
      const createdWaterLog = await WaterService.create(newWaterLog);
      
      setWaterLogs(prev => [createdWaterLog, ...prev]);
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

      toast({
        title: "Water added",
        description: `Added ${amount}ml of water to your log.`,
      });
    } catch (error) {
      console.error('Failed to add water log:', error);
      toast({
        title: "Error",
        description: "Failed to save water log",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteWaterLog = async (id: string) => {
    try {
      setIsLoading(true);
      const logToDelete = waterLogs.find(log => log.id === id);
      
      if (!logToDelete) {
        toast({
          title: "Error",
          description: "Water log not found",
          variant: "destructive"
        });
        return;
      }
      
      await WaterService.delete(id);
      
      setWaterLogs(prev => prev.filter(log => log.id !== id));
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
    } catch (error) {
      console.error('Failed to delete water log:', error);
      toast({
        title: "Error",
        description: "Failed to delete water log",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate average heart rate based on workout intensity and recency
  const calculateHeartRate = (workouts: WorkoutLog[]) => {
    if (workouts.length === 0) return 72; // Default resting heart rate if no workouts
    
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];
    
    // Get workouts from today
    const todayWorkouts = workouts.filter(workout => 
      workout.date.split('T')[0] === todayString
    );
    
    if (todayWorkouts.length === 0) {
      // If no workouts today, calculate based on recent history and return slightly elevated rate
      const recentWorkouts = workouts.slice(0, 3); // Consider up to 3 recent workouts
      const avgIntensity = recentWorkouts.reduce((sum, workout) => {
        switch (workout.intensity) {
          case 'High': return sum + 3;
          case 'Medium': return sum + 2;
          case 'Low': return sum + 1;
          default: return sum + 1.5;
        }
      }, 0) / recentWorkouts.length;
      
      // Base heart rate 65-75 bpm with small adjustment for historical workout intensity
      return Math.round(70 + (avgIntensity * 2));
    }
    
    // Calculate heart rate impact from today's workouts
    let heartRateTotal = 0;
    let weightTotal = 0;
    
    todayWorkouts.forEach(workout => {
      const workoutTime = new Date(workout.date).getTime();
      const hoursSince = (now.getTime() - workoutTime) / (1000 * 60 * 60);
      
      // Weight decreases as time since workout increases (workout effect diminishes)
      const timeWeight = Math.max(0, 24 - hoursSince) / 24;
      
      // Base heart rate impact by intensity
      let intensityImpact = 0;
      switch (workout.intensity) {
        case 'High':
          intensityImpact = 50; // High intensity can increase HR by ~50 bpm
          break;
        case 'Medium':
          intensityImpact = 30; // Medium intensity can increase HR by ~30 bpm
          break;
        case 'Low':
          intensityImpact = 15; // Low intensity can increase HR by ~15 bpm
          break;
        default:
          intensityImpact = 25; // Default if intensity not specified
      }
      
      // Impact decreases with time (exponential decay)
      const impact = intensityImpact * Math.pow(0.85, hoursSince);
      const weight = timeWeight * workout.duration / 60; // Longer workouts have more impact
      
      heartRateTotal += impact * weight;
      weightTotal += weight;
    });
    
    // Base resting heart rate is 65-75 bpm, add workout impact
    const baseHeartRate = 70;
    const workoutImpact = weightTotal > 0 ? heartRateTotal / weightTotal : 0;
    
    // Heart rate can't be too high for sustained periods, cap the calculated value
    return Math.min(140, Math.round(baseHeartRate + workoutImpact));
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    const user = localStorage.getItem("user");
    
    if (accessToken) {
      setIsAuthenticated(true);
      if (user) {
        setUser(JSON.parse(user));
      }
      // Fetch data when user is authenticated
      fetchUserProfile();
      fetchWorkouts();
      fetchWaterLogs();
      fetchDailyWaterTotal();
      fetchWeightHistory();
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Add a new effect to update calories burned and heart rate whenever workouts change
  useEffect(() => {
    if (workouts.length > 0) {
      const totalCalories = workouts.reduce((total, workout) => total + workout.calories, 0);
      setCaloriesBurned(totalCalories);
      
      // Calculate and update heart rate
      const calculatedHeartRate = calculateHeartRate(workouts);
      setAvgHeartRate(calculatedHeartRate);
      
      // Add a heart rate insight based on the calculated rate
      const heartRateInsight = getHeartRateInsight(calculatedHeartRate, workouts);
      
      // Update insights with the heart rate insight at the beginning
      const updatedInsights = [...healthInsights];
      // Remove any existing heart rate insights
      const filteredInsights = updatedInsights.filter(insight => 
        !insight.includes('heart rate') && !insight.includes('Heart rate')
      );
      // Add the new heart rate insight at the beginning
      filteredInsights.unshift(heartRateInsight);
      
      // Ensure we don't have too many insights
      if (filteredInsights.length > 5) {
        filteredInsights.pop();
      }
      
      // Replace health insights with our updated array
      setInsights(filteredInsights);
    }
  }, [workouts]);
  
  // Function to generate a heart rate insight
  const getHeartRateInsight = (heartRate: number, workouts: WorkoutLog[]): string => {
    const todayWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return workoutDate === today;
    });
    
    if (todayWorkouts.length > 0) {
      const lastWorkout = todayWorkouts[0];
      if (heartRate > 100) {
        return `Your heart rate is elevated (${heartRate} bpm) due to your recent ${lastWorkout.type} workout. This is normal during recovery.`;
      } else if (heartRate > 85) {
        return `Your heart rate (${heartRate} bpm) shows your body is still processing the effects of your ${lastWorkout.type} workout.`;
      } else {
        return `Your heart rate is at a healthy ${heartRate} bpm despite your recent ${lastWorkout.type} workout, indicating good cardiovascular fitness.`;
      }
    } else if (workouts.length > 0) {
      if (heartRate < 70) {
        return `Your resting heart rate of ${heartRate} bpm is excellent and indicates good cardiovascular health.`;
      } else if (heartRate < 80) {
        return `Your heart rate of ${heartRate} bpm is in a normal range for daily activities.`;
      } else {
        return `Your heart rate of ${heartRate} bpm is slightly elevated. Consider doing more consistent cardiovascular exercise.`;
      }
    } else {
      return `Your baseline heart rate is ${heartRate} bpm. Regular exercise can help improve your cardiovascular health.`;
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
            avgHeartRate={avgHeartRate}
            userWeight={userWeight}
            weightHistory={weightHistory}
            updateWeight={updateUserWeight}
            goals={goals}
            insights={insights}
            activityData={weeklyActivityData}
            nutrientData={nutrientBreakdown}
            isLoading={isLoading}
          />
        );
      case 'workouts':
        return (
          <WorkoutTracker 
            workouts={workouts}
            addWorkout={addWorkout}
            deleteWorkout={deleteWorkout}
            isLoading={isLoading}
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
                <h1 className="text-3xl font-bold text-white">FitTrack</h1>
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
      <Footer />
    </div>
  );
};

export default Index;
