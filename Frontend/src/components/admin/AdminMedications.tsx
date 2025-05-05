
import React from 'react';
import { Clipboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminMedications: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Medications</CardTitle>
          <CardDescription>Manage medication schedules and adherence</CardDescription>
        </div>
        <Button className="flex items-center gap-2">
          <Clipboard className="h-4 w-4" />
          Coming Soon
        </Button>
      </CardHeader>
      <CardContent className="text-center py-12">
        <Clipboard className="h-16 w-16 mx-auto text-health-primary opacity-20 mb-4" />
        <h3 className="text-xl font-medium mb-2">Medication Administration</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          The medication administration module is currently under development. Check back soon to manage medication schedules, dosages, and track adherence.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminMedications;
