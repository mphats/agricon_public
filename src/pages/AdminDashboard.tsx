
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from '@/components/admin/AdminStats';
import { DatasetManager } from '@/components/admin/DatasetManager';
import { ModelManager } from '@/components/admin/ModelManager';
import { TrainingJobMonitor } from '@/components/admin/TrainingJobMonitor';
import { FeaturedProductsManager } from '@/components/admin/FeaturedProductsManager';
import { MobileNav } from '@/components/MobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Shield, Database, Brain, Monitor, Settings, User, ShoppingCart } from 'lucide-react';
import { createInitialAIModel } from '@/utils/createInitialAIModel';
import { TransformerStatus } from '@/components/admin/TransformerStatus';

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeAIModel = async () => {
      if (profile?.is_admin) {
        console.log('Initializing AI model for admin...');
        await createInitialAIModel();
        setInitializing(false);
      }
    };

    initializeAIModel();
  }, [profile?.is_admin]);

  // Check if user is admin
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You don't have admin privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing AI system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      {/* Modern Header with Agriculture Gradient */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border-b border-green-300 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-green-100">AgriCon Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-green-100 bg-white/10 rounded-lg px-3 py-2">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          {/* Modern Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200 p-2 shadow-lg">
            <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2">
              <TabsTrigger 
                value="overview" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl px-4 py-3 transition-all font-medium"
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="datasets" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl px-4 py-3 transition-all font-medium"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Training</span>
              </TabsTrigger>
              <TabsTrigger 
                value="models" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl px-4 py-3 transition-all font-medium"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Models</span>
              </TabsTrigger>
              <TabsTrigger 
                value="jobs" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl px-4 py-3 transition-all font-medium"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl px-4 py-3 transition-all font-medium"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-6">
              <AdminStats />
              <TransformerStatus />
            </div>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-8">
            <DatasetManager />
          </TabsContent>

          <TabsContent value="models" className="space-y-8">
            <ModelManager />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-8">
            <TrainingJobMonitor />
          </TabsContent>

          <TabsContent value="products" className="space-y-8">
            <FeaturedProductsManager />
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};

export default AdminDashboard;
