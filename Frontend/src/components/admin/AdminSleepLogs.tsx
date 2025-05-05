
import React from 'react';
import { Moon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminSleepLogs: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sleep Logs</CardTitle>
          <CardDescription>Manage sleep records and patterns</CardDescription>
        </div>
        <Button className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Coming Soon
        </Button>
      </CardHeader>
      <CardContent className="text-center py-12">
        <Moon className="h-16 w-16 mx-auto text-health-primary opacity-20 mb-4" />
        <h3 className="text-xl font-medium mb-2">Sleep Tracking Administration</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The sleep tracking administration module is currently under development. Check back soon to manage sleep logs and track sleep patterns.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminSleepLogs;
