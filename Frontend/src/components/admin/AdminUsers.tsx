
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User as UserType } from '@/types/health';
import { currentUser } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([currentUser]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: '',
    email: '',
    height: undefined,
    weight: undefined,
    age: undefined,
    gender: '',
    bloodType: '',
    goal: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'height' || name === 'weight' || name === 'age' 
        ? value === '' ? undefined : Number(value) 
        : value
    });
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields",
        variant: "destructive"
      });
      return;
    }

    const newUser: UserType = {
      id: uuidv4(),
      email: formData.email || '',
      name: formData.name || '',
      height: formData.height,
      weight: formData.weight,
      age: formData.age,
      gender: formData.gender,
      bloodType: formData.bloodType,
      goal: formData.goal,
      medicalConditions: [],
      allergies: []
    };
    
    setUsers([...users, newUser]);
    setFormData({
      name: '',
      email: '',
      height: undefined,
      weight: undefined,
      age: undefined,
      gender: '',
      bloodType: '',
      goal: '',
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "User has been added successfully",
    });
  };

  const handleEditUser = () => {
    if (!editingUserId) return;
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields",
        variant: "destructive"
      });
      return;
    }

    setUsers(users.map(user => {
      if (user.id === editingUserId) {
        return {
          ...user,
          ...formData
        };
      }
      return user;
    }));

    setIsEditDialogOpen(false);
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      height: undefined,
      weight: undefined,
      age: undefined,
      gender: '',
      bloodType: '',
      goal: '',
    });
    
    toast({
      title: "Success",
      description: "User has been updated successfully",
    });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    
    toast({
      title: "Success",
      description: "User has been deleted successfully",
    });
  };

  const openEditDialog = (user: UserType) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      height: user.height,
      weight: user.weight,
      age: user.age,
      gender: user.gender,
      bloodType: user.bloodType,
      goal: user.goal,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user profiles and data</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user profile with health information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter user name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter user email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height === undefined ? '' : formData.height}
                    onChange={handleInputChange}
                    placeholder="Height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight === undefined ? '' : formData.weight}
                    onChange={handleInputChange}
                    placeholder="Weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age === undefined ? '' : formData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    placeholder="Gender"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    placeholder="Blood Type"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Fitness Goal</Label>
                <Input
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="Describe fitness goals"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Save User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="bg-health-light p-1 rounded-full">
                      <User className="h-4 w-4 text-health-primary" />
                    </div>
                    {user.name}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.height || '-'} {user.height ? 'cm' : ''}</TableCell>
                <TableCell>{user.weight || '-'} {user.weight ? 'kg' : ''}</TableCell>
                <TableCell>{user.age || '-'}</TableCell>
                <TableCell>{user.gender || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUser(user.id)}>
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
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user profile information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter user name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter user email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-height">Height (cm)</Label>
                  <Input
                    id="edit-height"
                    name="height"
                    type="number"
                    value={formData.height === undefined ? '' : formData.height}
                    onChange={handleInputChange}
                    placeholder="Height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight (kg)</Label>
                  <Input
                    id="edit-weight"
                    name="weight"
                    type="number"
                    value={formData.weight === undefined ? '' : formData.weight}
                    onChange={handleInputChange}
                    placeholder="Weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    name="age"
                    type="number"
                    value={formData.age === undefined ? '' : formData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Input
                    id="edit-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    placeholder="Gender"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bloodType">Blood Type</Label>
                  <Input
                    id="edit-bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    placeholder="Blood Type"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-goal">Fitness Goal</Label>
                <Input
                  id="edit-goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="Describe fitness goals"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditUser}>Update User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
