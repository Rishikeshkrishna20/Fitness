
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Coffee } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MealLog } from '@/types/health';
import { mealLogs } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const AdminMealLogs: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<MealLog[]>(mealLogs);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<MealLog, 'id'>>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    timestamp: new Date().toISOString(),
    type: 'breakfast'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['calories', 'protein', 'carbs', 'fat'].includes(name) 
        ? Number(value) 
        : value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      type: value as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
  };

  const handleAddLog = () => {
    if (!formData.name || formData.calories <= 0) {
      toast({
        title: "Error",
        description: "Meal name and calories are required.",
        variant: "destructive"
      });
      return;
    }

    const newLog: MealLog = {
      id: uuidv4(),
      ...formData
    };
    
    setLogs([newLog, ...logs]);
    setFormData({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      timestamp: new Date().toISOString(),
      type: 'breakfast'
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Meal log has been added successfully",
    });
  };

  const handleEditLog = () => {
    if (!editingLogId) return;
    
    if (!formData.name || formData.calories <= 0) {
      toast({
        title: "Error",
        description: "Meal name and calories are required.",
        variant: "destructive"
      });
      return;
    }

    setLogs(logs.map(log => {
      if (log.id === editingLogId) {
        return {
          ...log,
          ...formData
        };
      }
      return log;
    }));

    setIsEditDialogOpen(false);
    setEditingLogId(null);
    setFormData({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      timestamp: new Date().toISOString(),
      type: 'breakfast'
    });
    
    toast({
      title: "Success",
      description: "Meal log has been updated successfully",
    });
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
    
    toast({
      title: "Success",
      description: "Meal log has been deleted successfully",
    });
  };

  const openEditDialog = (log: MealLog) => {
    setEditingLogId(log.id);
    setFormData({
      name: log.name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      timestamp: log.timestamp,
      type: log.type
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Meal Logs</CardTitle>
          <CardDescription>Manage meal and nutrition records</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Meal</DialogTitle>
              <DialogDescription>
                Create a new meal record
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Meal Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter meal name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Meal Type</Label>
                  <Select
                    onValueChange={handleSelectChange}
                    defaultValue={formData.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timestamp">Time</Label>
                  <Input
                    id="timestamp"
                    name="timestamp"
                    type="datetime-local"
                    value={new Date(formData.timestamp).toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    placeholder="Calories"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    name="protein"
                    type="number"
                    value={formData.protein}
                    onChange={handleInputChange}
                    placeholder="Protein"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    name="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={handleInputChange}
                    placeholder="Carbs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    name="fat"
                    type="number"
                    value={formData.fat}
                    onChange={handleInputChange}
                    placeholder="Fat"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddLog}>Save Meal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meal</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Calories</TableHead>
              <TableHead>Macros (P/C/F)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="bg-health-light p-1 rounded-full">
                      <Coffee className="h-4 w-4 text-health-primary" />
                    </div>
                    {log.name}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{log.type}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString(undefined, { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric'
                })}</TableCell>
                <TableCell>{log.calories} kcal</TableCell>
                <TableCell>{log.protein}g / {log.carbs}g / {log.fat}g</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(log)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteLog(log.id)}>
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
              <DialogTitle>Edit Meal</DialogTitle>
              <DialogDescription>
                Update meal record
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Meal Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter meal name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Meal Type</Label>
                  <Select
                    onValueChange={handleSelectChange}
                    defaultValue={formData.type}
                    value={formData.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-timestamp">Time</Label>
                  <Input
                    id="edit-timestamp"
                    name="timestamp"
                    type="datetime-local"
                    value={new Date(formData.timestamp).toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-calories">Calories</Label>
                  <Input
                    id="edit-calories"
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    placeholder="Calories"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-protein">Protein (g)</Label>
                  <Input
                    id="edit-protein"
                    name="protein"
                    type="number"
                    value={formData.protein}
                    onChange={handleInputChange}
                    placeholder="Protein"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-carbs">Carbs (g)</Label>
                  <Input
                    id="edit-carbs"
                    name="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={handleInputChange}
                    placeholder="Carbs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fat">Fat (g)</Label>
                  <Input
                    id="edit-fat"
                    name="fat"
                    type="number"
                    value={formData.fat}
                    onChange={handleInputChange}
                    placeholder="Fat"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditLog}>Update Meal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminMealLogs;
