
import React from 'react';
import { PencilRuler } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminGoals: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Health Goals</CardTitle>
          <CardDescription>Manage user health and fitness goals</CardDescription>
        </div>
        <Button className="flex items-center gap-2">
          <PencilRuler className="h-4 w-4" />
          Coming Soon
        </Button>
      </CardHeader>
      <CardContent className="text-center py-12">
        <PencilRuler className="h-16 w-16 mx-auto text-health-primary opacity-20 mb-4" />
        <h3 className="text-xl font-medium mb-2">Goals Administration</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The health goals administration module is currently under development. Check back soon to manage and track user health and fitness goals.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminGoals;
