
import React from 'react';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminVitals: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vitals</CardTitle>
          <CardDescription>Manage vital signs and health metrics</CardDescription>
        </div>
        <Button className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Coming Soon
        </Button>
      </CardHeader>
      <CardContent className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto text-health-primary opacity-20 mb-4" />
        <h3 className="text-xl font-medium mb-2">Vitals Administration</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The vitals administration module is currently under development. Check back soon to manage blood pressure, heart rate, and other vital signs data.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminVitals;
