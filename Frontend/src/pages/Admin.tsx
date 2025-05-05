
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Settings, Clipboard, BarChart, Droplets, Coffee, Moon, Heart, PencilRuler, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import AdminUsers from '@/components/admin/AdminUsers';
import AdminWorkouts from '@/components/admin/AdminWorkouts';
import AdminWaterLogs from '@/components/admin/AdminWaterLogs';
import AdminMealLogs from '@/components/admin/AdminMealLogs';
import AdminSleepLogs from '@/components/admin/AdminSleepLogs';
import AdminVitals from '@/components/admin/AdminVitals';
import AdminMoods from '@/components/admin/AdminMoods';
import AdminMedications from '@/components/admin/AdminMedications';
import AdminGoals from '@/components/admin/AdminGoals';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUsers />;
      case 'workouts':
        return <AdminWorkouts />;
      case 'water':
        return <AdminWaterLogs />;
      case 'meals':
        return <AdminMealLogs />;
      case 'sleep':
        return <AdminSleepLogs />;
      case 'vitals':
        return <AdminVitals />;
      case 'moods':
        return <AdminMoods />;
      case 'medications':
        return <AdminMedications />;
      case 'goals':
        return <AdminGoals />;
      default:
        return <AdminUsers />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-health-gradient shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white/20 border-white/10 text-white hover:bg-white/30"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="relative pulsing-ring rounded-full p-1">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">LifePulse Admin</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow mb-6 md:mb-0 flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Administration</h2>
          </div>
          <nav className="p-4">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'users' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('workouts')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'workouts' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span>Workouts</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('water')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'water' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Droplets className="w-5 h-5" />
                  <span>Water</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('meals')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'meals' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Coffee className="w-5 h-5" />
                  <span>Meals</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('sleep')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'sleep' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span>Sleep</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'vitals' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Vitals</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('moods')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'moods' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="w-5 h-5" />
                  <span>Moods</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('medications')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'medications' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Clipboard className="w-5 h-5" />
                  <span>Medications</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    activeTab === 'goals' 
                      ? 'bg-health-light text-health-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <PencilRuler className="w-5 h-5" />
                  <span>Goals</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100 transition mt-6"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to App</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
