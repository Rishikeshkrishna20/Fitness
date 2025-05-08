
import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  Activity, 
  Utensils, 
  Moon, 
  Heart, 
  LineChart, 
  Settings,
  LogOut
} from 'lucide-react';
import { User } from '@/types/health';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  selectedTab,
  setSelectedTab,
  user,
  onLogout
}) => {
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    onClose();
  };

  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'workouts', label: 'Workouts', icon: <Activity className="w-5 h-5" /> },
    { id: 'nutrition', label: 'Nutrition', icon: <Utensils className="w-5 h-5" /> },
    { id: 'sleep', label: 'Sleep', icon: <Moon className="w-5 h-5" /> },
    // { id: 'vitals', label: 'Vitals', icon: <Heart className="w-5 h-5" /> },
    // { id: 'analytics', label: 'Analytics', icon: <LineChart className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-white shadow-xl animate-slide-in">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-health-primary">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {user && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full" 
                  />
                ) : (
                  <div className="w-12 h-12 bg-health-light rounded-full flex items-center justify-center">
                    <span className="text-health-primary text-lg font-bold">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-2">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    selectedTab === item.id
                      ? 'bg-health-light text-health-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={onLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
