
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/providers/AuthProvider';
import { 
  Home, 
  TrendingUp, 
  Camera, 
  Cloud, 
  Users, 
  User,
  Settings
} from 'lucide-react';

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: TrendingUp, label: 'Market', path: '/market' },
    { icon: Camera, label: 'Scan', path: '/diagnostics' },
    { icon: Cloud, label: 'Weather', path: '/weather' },
    { icon: Users, label: 'Forum', path: '/forum' },
    ...(profile?.is_admin ? [{ icon: Settings, label: 'Admin', path: '/admin' }] : []),
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-2 ${
                isActive 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
