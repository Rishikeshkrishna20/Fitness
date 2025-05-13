
import React from 'react';
import { Activity, User, LogOut, Bell, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  user: {
    first_name: string;
    // avatar?: string;
  } | null;
  onLogout: () => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  toggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  selectedTab, 
  setSelectedTab,
  toggleMobileMenu
}) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-10 bg-health-gradient shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative pulsing-ring rounded-full p-1">
              <Activity className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold hidden sm:block">FitTrack</h1>
          </div>

          {isMobile ? (
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-health-secondary"
                  >
                    <Bell className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-health-secondary"
                    onClick={toggleMobileMenu}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {user && (
                <div className="flex items-center">
                  <nav className="flex space-x-1 mr-6">
                    {['dashboard', 'workouts', 'nutrition', 'sleep', 'vitals', 'analytics'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedTab === tab
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>

                  <div className="flex items-center space-x-3 border-l border-white/20 pl-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-health-secondary"
                    >
                      <Bell className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                      {/* {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full ring-2 ring-white/30"
                        />
                      ) : (
                        <div className="bg-white/20 rounded-full p-1">
                          <User className="w-6 h-6" />
                        </div>
                      )} */}
                      <span className="font-medium text-sm">{user?.first_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onLogout}
                      className="text-white hover:bg-health-secondary"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
