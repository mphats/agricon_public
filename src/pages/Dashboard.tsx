import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useOffline } from '@/providers/OfflineProvider';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Sprout, 
  TrendingUp, 
  Cloud, 
  Users, 
  Camera, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  ArrowRight
} from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isOnline, pendingSyncItems } = useOffline();

  // Fetch user profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch recent market prices
  const { data: marketPrices } = useQuery({
    queryKey: ['recent-market-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('date_recorded', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch active weather alerts
  const { data: weatherAlerts } = useQuery({
    queryKey: ['active-weather-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const quickActions = [
    {
      title: "Market Prices",
      description: "Check latest crop prices",
      icon: TrendingUp,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      onClick: () => navigate('/market')
    },
    {
      title: "AI Diagnostics",
      description: "Scan crops for issues",
      icon: Camera,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-500",
      onClick: () => navigate('/diagnostics')
    },
    {
      title: "Weather Alerts",
      description: "Local weather updates",
      icon: Cloud,
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-500",
      onClick: () => navigate('/weather')
    },
    {
      title: "Community",
      description: "Ask questions & learn",
      icon: Users,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-500",
      onClick: () => navigate('/forum')
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Professional Crops Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-600/40"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Header - Mobile Optimized */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sprout className="h-5 w-5 text-green-400 mr-2" />
              <h1 className="text-lg font-semibold text-white">AgriCon</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* Connection Status - Mobile Optimized */}
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-400" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-400" />
                )}
                <span className="text-xs text-white/80 hidden sm:inline">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {pendingSyncItems > 0 && (
                <div className="bg-orange-500/80 text-white text-xs px-1.5 py-0.5 rounded backdrop-blur-sm">
                  {pendingSyncItems}
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="text-white hover:bg-white/20 p-1">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-3 py-4 space-y-4">
        {/* Hero Welcome Section - Professional */}
        <div className="relative h-48 sm:h-56 backdrop-blur-lg bg-gradient-to-r from-green-600/20 to-blue-600/20 text-white rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Hero Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative h-full flex flex-col justify-center p-6">
            <div className="mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-lg">
                Welcome back, {profile?.first_name || 'Farmer'}!
              </h2>
              <p className="text-green-100 text-sm sm:text-base drop-shadow-md mb-1">
                Ready to grow your farming success
              </p>
              {profile?.location_district && (
                <p className="text-green-200/80 text-sm drop-shadow-md flex items-center">
                  <span className="mr-2">📍</span>
                  Farming in {profile.location_district}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {profile?.farm_size_acres && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <p className="text-xs text-green-200">Farm Size</p>
                    <p className="text-sm font-semibold text-white">{profile.farm_size_acres} acres</p>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-xs text-green-200">Status</p>
                  <p className="text-sm font-semibold text-white">{isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/market')} 
                className="bg-green-500/80 hover:bg-green-600/80 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2"
              >
                View Markets
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Weather Alerts - Mobile Optimized */}
        {weatherAlerts && weatherAlerts.length > 0 && (
          <Card className="backdrop-blur-lg bg-orange-500/20 border-orange-300/30 border-2 shadow-2xl rounded-xl">
            <CardHeader className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-orange-300 mr-2" />
                <CardTitle className="text-orange-100 text-base">Active Weather Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {weatherAlerts.map((alert) => (
                <div key={alert.id} className="mb-2 last:mb-0">
                  <p className="font-medium text-orange-100 text-sm">{alert.title}</p>
                  <p className="text-xs text-orange-200/80">{alert.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - Professional Mobile Cards */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-lg">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-white/95 backdrop-blur-sm border-0 rounded-2xl overflow-hidden group"
                onClick={action.onClick}
              >
                <CardContent className="p-4 relative">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Icon Container */}
                  <div className="flex justify-center mb-3">
                    <div className={`${action.iconBg} p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="text-center space-y-1">
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight">{action.title}</h4>
                    <p className="text-xs text-gray-600 leading-tight px-1">{action.description}</p>
                  </div>
                  
                  {/* Subtle Arrow Indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Market Prices - Mobile Optimized */}
        {marketPrices && marketPrices.length > 0 && (
          <Card className="backdrop-blur-lg bg-white/15 border-white/20 border-2 shadow-2xl rounded-xl">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center text-white text-base">
                <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                Recent Market Prices
              </CardTitle>
              <CardDescription className="text-white/80 text-sm">Latest crop prices in your area</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {marketPrices.slice(0, 3).map((price) => (
                  <div key={price.id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize text-white text-sm truncate">{price.crop_type}</p>
                      <p className="text-xs text-white/70 truncate">{price.district}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-green-300 text-sm">
                        MWK {price.price_per_kg}/kg
                      </p>
                      <p className="text-xs text-white/60">
                        {new Date(price.date_recorded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm text-sm"
                onClick={() => navigate('/market')}
              >
                View All Prices
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="backdrop-blur-lg bg-white/15 border-white/20 border-2 shadow-2xl rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-300 mb-1">
                {profile?.primary_crops?.length || 0}
              </div>
              <p className="text-xs text-white/80">Crops Grown</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-lg bg-white/15 border-white/20 border-2 shadow-2xl rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-300 mb-1">
                {isOnline ? 'Connected' : 'Offline'}
              </div>
              <p className="text-xs text-white/80">Status</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default Dashboard;
