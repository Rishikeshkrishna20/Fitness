
import React, { useState } from 'react';
import { Droplets, Plus, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterLog } from '@/types/health';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface WaterTrackerProps {
  waterLogs: WaterLog[];
  totalWaterIntake: number;
  addWater: (amount: number) => void;
  deleteWaterLog: (id: string) => void;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterLogs,
  totalWaterIntake,
  addWater,
  deleteWaterLog
}) => {
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const targetWaterIntake = 2500; // ml
  const percentComplete = Math.min((totalWaterIntake / targetWaterIntake) * 100, 100);
  
  const handleAddCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid water amount",
        variant: "destructive"
      });
      return;
    }
    
    addWater(amount);
    setCustomAmount('');
    setDialogOpen(false);
    
    toast({
      title: "Water Added",
      description: `${amount}ml of water has been logged`,
    });
  };
  
  const handleQuickAdd = (amount: number) => {
    addWater(amount);
    
    toast({
      title: "Water Added",
      description: `${amount}ml of water has been logged`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Water Progress */}
      <Card className="border-l-4 border-l-health-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-health-primary" /> Water Intake
            </span>
            <span className="text-xl font-bold text-health-primary">{totalWaterIntake} / {targetWaterIntake}ml</span>
          </CardTitle>
          <CardDescription>
            Daily hydration target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-health-primary bg-health-light">
                  {Math.round(percentComplete)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-health-primary">
                  {totalWaterIntake >= targetWaterIntake ? "Goal Achieved! 🎉" : `${targetWaterIntake - totalWaterIntake}ml remaining`}
                </span>
              </div>
            </div>
            <Progress value={percentComplete} className="h-3" />
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold">{waterLogs.length}</div>
              <div className="text-xs text-gray-500">Logs Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {waterLogs.length > 0 ? (totalWaterIntake / waterLogs.length).toFixed(0) : 0}ml
              </div>
              <div className="text-xs text-gray-500">Average Per Log</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {waterLogs.length > 0 ? Math.max(...waterLogs.map(log => log.amount)) : 0}ml
              </div>
              <div className="text-xs text-gray-500">Largest Log</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {((totalWaterIntake / targetWaterIntake) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Of Daily Goal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Add Water</CardTitle>
            <CardDescription>Quickly log your water intake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-health-primary hover:bg-health-secondary"
                onClick={() => handleQuickAdd(100)}
              >
                <Plus className="w-4 h-4 mr-2" /> 100ml
              </Button>
              <Button 
                className="bg-health-primary hover:bg-health-secondary"
                onClick={() => handleQuickAdd(200)}
              >
                <Plus className="w-4 h-4 mr-2" /> 200ml
              </Button>
              <Button 
                className="bg-health-primary hover:bg-health-secondary"
                onClick={() => handleQuickAdd(250)}
              >
                <Plus className="w-4 h-4 mr-2" /> 250ml
              </Button>
              <Button 
                className="bg-health-primary hover:bg-health-secondary"
                onClick={() => handleQuickAdd(330)}
              >
                <Plus className="w-4 h-4 mr-2" /> 330ml
              </Button>
              <Button 
                className="bg-health-primary hover:bg-health-secondary"
                onClick={() => handleQuickAdd(500)}
              >
                <Plus className="w-4 h-4 mr-2" /> 500ml
              </Button>
              <Button 
                className="bg-health-primary hover:bg-health-secondary"
                onClick={() => handleQuickAdd(1000)}
              >
                <Plus className="w-4 h-4 mr-2" /> 1000ml
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Custom Amount
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Water Amount</DialogTitle>
                  <DialogDescription>
                    Enter the amount of water you've consumed in milliliters.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="waterAmount">Amount (ml)</Label>
                    <Input 
                      id="waterAmount" 
                      type="number" 
                      value={customAmount} 
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount in ml"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCustomAmount}>Add Water</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Water Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Water Log History</CardTitle>
            <CardDescription>Today's hydration record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {waterLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Droplets className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No water logs for today</p>
                  <p className="text-sm">Start tracking your water intake</p>
                </div>
              ) : (
                waterLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Droplets className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">{log.amount}ml</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteWaterLog(log.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-sm text-gray-500">
              Water logs are displayed in chronological order
            </div>
            {waterLogs.length > 0 && (
              <Button variant="outline" size="sm">
                Download Log
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Water Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Hydration Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Hydration Status</h4>
              <p className="text-sm text-gray-600">
                {percentComplete >= 100 
                  ? "Excellent! You've met your hydration goal for today."
                  : percentComplete >= 75
                    ? "Good progress! You're well on your way to meeting your hydration goal."
                    : percentComplete >= 50
                      ? "Halfway there! Keep drinking water throughout the day."
                      : percentComplete >= 25
                        ? "Getting started! Remember to drink water regularly."
                        : "Time to hydrate! You're just beginning your water intake for today."
                }
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Drink a glass of water when you wake up</li>
                <li>Carry a water bottle with you</li>
                <li>Set reminders to drink water</li>
                <li>Drink before, during, and after exercise</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Benefits</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Improved energy levels</li>
                <li>Better cognitive function</li>
                <li>Healthier skin</li>
                <li>Proper organ function</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterTracker;
