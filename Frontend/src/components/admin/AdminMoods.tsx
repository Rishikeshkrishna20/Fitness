
import React from 'react';
import { BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminMoods: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mood Tracking</CardTitle>
          <CardDescription>Manage mood logs and emotional wellbeing data</CardDescription>
        </div>
        <Button className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          Coming Soon
        </Button>
      </CardHeader>
      <CardContent className="text-center py-12">
        <BarChart className="h-16 w-16 mx-auto text-health-primary opacity-20 mb-4" />
        <h3 className="text-xl font-medium mb-2">Mood Tracking Administration</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The mood tracking administration module is currently under development. Check back soon to manage mood logs and emotional wellbeing data.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminMoods;
