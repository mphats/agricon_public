
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from '@/components/admin/AdminStats';
import { DatasetManager } from '@/components/admin/DatasetManager';
import { ModelManager } from '@/components/admin/ModelManager';
import { TrainingJobMonitor } from '@/components/admin/TrainingJobMonitor';
import { MobileNav } from '@/components/MobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Shield, Database, Brain, Monitor, Settings, User } from 'lucide-react';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have admin privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing AI system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Modern Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">AgriCon Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
          <div className="bg-card rounded-xl border border-border p-2">
            <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
              <TabsTrigger 
                value="overview" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 transition-all"
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="datasets" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 transition-all"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Training</span>
              </TabsTrigger>
              <TabsTrigger 
                value="models" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 transition-all"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Models</span>
              </TabsTrigger>
              <TabsTrigger 
                value="jobs" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-3 transition-all"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Jobs</span>
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
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};

export default AdminDashboard;
