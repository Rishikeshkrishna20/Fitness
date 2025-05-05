
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutLog } from '@/types/health';
import { workoutLogs } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const AdminWorkouts: React.FC = () => {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(workoutLogs);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<WorkoutLog, 'id'>>({
    type: '',
    duration: 0,
    calories: 0,
    date: new Date().toISOString(),
    intensity: 'Medium',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'duration' || name === 'calories' 
        ? Number(value) 
        : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddWorkout = () => {
    if (!formData.type || formData.duration <= 0 || formData.calories <= 0) {
      toast({
        title: "Error",
        description: "All fields are required. Duration and calories must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    const newWorkout: WorkoutLog = {
      id: uuidv4(),
      ...formData
    };
    
    setWorkouts([newWorkout, ...workouts]);
    setFormData({
      type: '',
      duration: 0,
      calories: 0,
      date: new Date().toISOString(),
      intensity: 'Medium',
      notes: ''
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Workout has been added successfully",
    });
  };

  const handleEditWorkout = () => {
    if (!editingWorkoutId) return;
    
    if (!formData.type || formData.duration <= 0 || formData.calories <= 0) {
      toast({
        title: "Error",
        description: "All fields are required. Duration and calories must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setWorkouts(workouts.map(workout => {
      if (workout.id === editingWorkoutId) {
        return {
          ...workout,
          ...formData
        };
      }
      return workout;
    }));

    setIsEditDialogOpen(false);
    setEditingWorkoutId(null);
    setFormData({
      type: '',
      duration: 0,
      calories: 0,
      date: new Date().toISOString(),
      intensity: 'Medium',
      notes: ''
    });
    
    toast({
      title: "Success",
      description: "Workout has been updated successfully",
    });
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
    
    toast({
      title: "Success",
      description: "Workout has been deleted successfully",
    });
  };

  const openEditDialog = (workout: WorkoutLog) => {
    setEditingWorkoutId(workout.id);
    setFormData({
      type: workout.type,
      duration: workout.duration,
      calories: workout.calories,
      date: workout.date,
      intensity: workout.intensity || 'Medium',
      notes: workout.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const workoutTypeOptions = [
    "Running", "Walking", "Cycling", "Swimming", "Strength Training", 
    "HIIT", "Yoga", "Pilates", "Dance", "Basketball", "Soccer", 
    "Tennis", "Hiking", "Rowing", "Elliptical", "CrossFit"
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workouts</CardTitle>
          <CardDescription>Manage workout logs and activities</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Workout</DialogTitle>
              <DialogDescription>
                Create a new workout record for a user
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Workout Type</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('type', value)}
                  defaultValue={formData.type}
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
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="Duration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories Burned</Label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    placeholder="Calories"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={new Date(formData.date).toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('intensity', value)}
                    defaultValue={formData.intensity}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddWorkout}>Save Workout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Calories</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Intensity</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workouts.map((workout) => (
              <TableRow key={workout.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="bg-health-light p-1 rounded-full">
                      <Activity className="h-4 w-4 text-health-primary" />
                    </div>
                    {workout.type}
                  </div>
                </TableCell>
                <TableCell>{workout.duration} min</TableCell>
                <TableCell>{workout.calories} kcal</TableCell>
                <TableCell>{new Date(workout.date).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workout.intensity === 'High' ? 'bg-red-100 text-red-800' :
                    workout.intensity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {workout.intensity || 'Medium'}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{workout.notes || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(workout)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteWorkout(workout.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Workout</DialogTitle>
              <DialogDescription>
                Update workout record information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Workout Type</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('type', value)}
                  defaultValue={formData.type}
                  value={formData.type}
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
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="Duration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-calories">Calories Burned</Label>
                  <Input
                    id="edit-calories"
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    placeholder="Calories"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="datetime-local"
                    value={new Date(formData.date).toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-intensity">Intensity</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('intensity', value)}
                    defaultValue={formData.intensity}
                    value={formData.intensity}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditWorkout}>Update Workout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminWorkouts;
