
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Droplets } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WaterLog } from '@/types/health';
import { waterLogs } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const AdminWaterLogs: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<WaterLog[]>(waterLogs);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<WaterLog, 'id'>>({
    amount: 0,
    timestamp: new Date().toISOString()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? Number(value) : value
    });
  };

  const handleAddLog = () => {
    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Water amount must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    const newLog: WaterLog = {
      id: uuidv4(),
      ...formData
    };
    
    setLogs([newLog, ...logs]);
    setFormData({
      amount: 0,
      timestamp: new Date().toISOString()
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Water log has been added successfully",
    });
  };

  const handleEditLog = () => {
    if (!editingLogId) return;
    
    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Water amount must be greater than 0.",
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
      amount: 0,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Success",
      description: "Water log has been updated successfully",
    });
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
    
    toast({
      title: "Success",
      description: "Water log has been deleted successfully",
    });
  };

  const openEditDialog = (log: WaterLog) => {
    setEditingLogId(log.id);
    setFormData({
      amount: log.amount,
      timestamp: log.timestamp
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Water Intake</CardTitle>
          <CardDescription>Manage water intake logs</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Water Log
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Water Intake</DialogTitle>
              <DialogDescription>
                Create a new water intake record
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ml)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Water amount in ml"
                />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddLog}>Save Log</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="bg-health-light p-1 rounded-full">
                      <Droplets className="h-4 w-4 text-health-primary" />
                    </div>
                    {log.amount} ml
                  </div>
                </TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
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
              <DialogTitle>Edit Water Log</DialogTitle>
              <DialogDescription>
                Update water intake record
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount (ml)</Label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Water amount in ml"
                />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditLog}>Update Log</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminWaterLogs;
