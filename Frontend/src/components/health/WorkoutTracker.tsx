import React, { useState, useEffect } from 'react';
import { Flame, Clock, Calendar, Activity, BarChart, Play, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutLog } from '@/types/health';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

interface WorkoutTrackerProps {
  workouts: WorkoutLog[];
  addWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
  deleteWorkout: (id: string) => void;
  isLoading?: boolean;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  workouts,
  addWorkout,
  deleteWorkout,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    type: '',
    duration: '',
    calories: '',
    intensity: 'Medium' as 'Low' | 'Medium' | 'High',
    notes: ''
  });
  
  // Memoized calculations
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutLog[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // Update calculated values when workouts change
  useEffect(() => {
    if (workouts && workouts.length > 0) {
      const today = new Date().toDateString();
      setTodayWorkouts(workouts.filter(w => new Date(w.date).toDateString() === today));
      setTotalCalories(workouts.reduce((sum, workout) => sum + workout.calories, 0));
      setTotalDuration(workouts.reduce((sum, workout) => sum + workout.duration, 0));
    } else {
      setTodayWorkouts([]);
      setTotalCalories(0);
      setTotalDuration(0);
    }
  }, [workouts]);

  const handleAddWorkout = () => {
    if (!newWorkout.type || !newWorkout.duration || !newWorkout.calories) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    addWorkout({
      type: newWorkout.type,
      duration: Number(newWorkout.duration),
      calories: Number(newWorkout.calories),
      date: new Date().toISOString(),
      intensity: newWorkout.intensity,
      notes: newWorkout.notes
    });

    setNewWorkout({
      type: '',
      duration: '',
      calories: '',
      intensity: 'Medium',
      notes: ''
    });

    setDialogOpen(false);
    
    toast({
      title: "Workout Added",
      description: "Your workout has been successfully logged",
    });
  };

  const handleQuickAdd = (type: string, duration: number, calories: number, intensity: 'Low' | 'Medium' | 'High') => {
    addWorkout({
      type,
      duration,
      calories,
      date: new Date().toISOString(),
      intensity,
      notes: `Quick logged ${type} workout`
    });

    toast({
      title: "Workout Added",
      description: `${type} workout has been logged`,
    });
  };

  const workoutTypeOptions = [
    "Running", "Walking", "Cycling", "Swimming", "Strength Training", 
    "HIIT", "Yoga", "Pilates", "Dance", "Basketball", "Soccer", 
    "Tennis", "Hiking", "Rowing", "Elliptical", "CrossFit"
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-health-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-health-light p-2 rounded-lg">
                  <Flame className="w-5 h-5 text-health-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Calories</p>
                  {isLoading ? (
                    <div className="flex items-center space-x-2 h-8">
                      <Spinner size="sm" variant="primary" />
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold">{totalCalories}</h3>
                  )}
                </div>
              </div>
              <BarChart className="w-12 h-12 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-health-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-health-light p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-health-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Active</p>
                  {isLoading ? (
                    <div className="flex items-center space-x-2 h-8">
                      <Spinner size="sm" variant="primary" />
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold">{totalDuration} min</h3>
                  )}
                </div>
              </div>
              <BarChart className="w-12 h-12 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-health-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-health-light p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-health-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Workouts</p>
                  {isLoading ? (
                    <div className="flex items-center space-x-2 h-8">
                      <Spinner size="sm" variant="primary" />
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold">{workouts.length}</h3>
                  )}
                </div>
              </div>
              <BarChart className="w-12 h-12 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add and Workout Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Add Workout</CardTitle>
            <CardDescription>Log your exercise with one click</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start bg-health-primary hover:bg-health-secondary"
              onClick={() => handleQuickAdd("Running", 30, 300, "Medium")}
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" /> 30 min Running
            </Button>
            <Button 
              className="w-full justify-start bg-health-primary hover:bg-health-secondary"
              onClick={() => handleQuickAdd("Walking", 45, 200, "Low")}
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" /> 45 min Walking
            </Button>
            <Button 
              className="w-full justify-start bg-health-primary hover:bg-health-secondary"
              onClick={() => handleQuickAdd("Cycling", 40, 350, "Medium")}
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" /> 40 min Cycling
            </Button>
            <Button 
              className="w-full justify-start bg-health-primary hover:bg-health-secondary"
              onClick={() => handleQuickAdd("Strength Training", 60, 450, "High")}
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" /> 60 min Strength
            </Button>
            <Button 
              className="w-full justify-start bg-health-primary hover:bg-health-secondary"
              onClick={() => handleQuickAdd("HIIT", 25, 300, "High")}
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" /> 25 min HIIT
            </Button>
            <Button 
              className="w-full justify-start bg-health-primary hover:bg-health-secondary"
              onClick={() => handleQuickAdd("Yoga", 50, 180, "Low")}
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" /> 50 min Yoga
            </Button>
          </CardContent>
          <CardFooter>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex items-center gap-2" disabled={isLoading}>
                  <Plus className="w-4 h-4" /> Custom Workout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Workout</DialogTitle>
                  <DialogDescription>
                    Enter details about your workout session.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workoutType">Workout Type</Label>
                    <Select 
                      value={newWorkout.type} 
                      onValueChange={(value) => setNewWorkout({...newWorkout, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select workout type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workoutTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (min)</Label>
                      <Input 
                        id="duration" 
                        type="number" 
                        value={newWorkout.duration} 
                        onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input 
                        id="calories" 
                        type="number" 
                        value={newWorkout.calories} 
                        onChange={(e) => setNewWorkout({...newWorkout, calories: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="intensity">Intensity</Label>
                    <Select 
                      value={newWorkout.intensity} 
                      onValueChange={(value: 'Low' | 'Medium' | 'High') => setNewWorkout({...newWorkout, intensity: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input 
                      id="notes" 
                      value={newWorkout.notes} 
                      onChange={(e) => setNewWorkout({...newWorkout, notes: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>Cancel</Button>
                  <Button onClick={handleAddWorkout} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Workout'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Workout Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Workout History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Workouts</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Spinner size="lg" variant="primary" />
                    </div>
                  ) : workouts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No workout history available</p>
                      <p className="text-sm">Start by adding your first workout</p>
                    </div>
                  ) : (
                    workouts.map((workout) => (
                      <div 
                        key={workout.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-health-light p-2 rounded-full flex-shrink-0">
                            <Activity className="w-5 h-5 text-health-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{workout.type}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                workout.intensity === 'High' ? 'bg-red-100 text-red-700' :
                                workout.intensity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {workout.intensity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {workout.duration} minutes • {new Date(workout.date).toLocaleDateString()}
                            </p>
                            {workout.notes && (
                              <p className="text-xs italic text-gray-500 mt-1">{workout.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Flame className="w-4 h-4 text-health-primary" />
                            <span>{workout.calories}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                console.log("Delete button clicked, workout ID:", workout.id, "Type:", typeof workout.id);
                                deleteWorkout(workout.id);
                              }}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="today">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Spinner size="lg" variant="primary" />
                    </div>
                  ) : todayWorkouts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No workouts logged today</p>
                      <p className="text-sm">Add a workout to get started</p>
                    </div>
                  ) : (
                    todayWorkouts.map((workout) => (
                      <div 
                        key={workout.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-health-light p-2 rounded-full flex-shrink-0">
                            <Activity className="w-5 h-5 text-health-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{workout.type}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                workout.intensity === 'High' ? 'bg-red-100 text-red-700' :
                                workout.intensity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {workout.intensity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {workout.duration} minutes • {new Date(workout.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            {workout.notes && (
                              <p className="text-xs italic text-gray-500 mt-1">{workout.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Flame className="w-4 h-4 text-health-primary" />
                            <span>{workout.calories}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                console.log("Delete button clicked, workout ID:", workout.id, "Type:", typeof workout.id);
                                deleteWorkout(workout.id);
                              }}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutTracker;
