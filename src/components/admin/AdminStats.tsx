
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Database, FileText, Brain, Activity, TrendingUp } from 'lucide-react';

export const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [datasetsResult, filesResult, modelsResult, jobsResult] = await Promise.all([
        supabase.from('training_datasets').select('id, status'),
        supabase.from('training_files').select('id, status'),
        supabase.from('ai_models').select('id, status'),
        supabase.from('training_jobs').select('id, status')
      ]);

      return {
        datasets: {
          total: datasetsResult.data?.length || 0,
          processing: datasetsResult.data?.filter(d => d.status === 'processing').length || 0
        },
        files: {
          total: filesResult.data?.length || 0,
          processed: filesResult.data?.filter(f => f.status === 'processed').length || 0,
          pending: filesResult.data?.filter(f => f.status === 'pending').length || 0
        },
        models: {
          total: modelsResult.data?.length || 0,
          deployed: modelsResult.data?.filter(m => m.status === 'deployed').length || 0,
          training: modelsResult.data?.filter(m => m.status === 'training').length || 0
        },
        jobs: {
          total: jobsResult.data?.length || 0,
          running: jobsResult.data?.filter(j => j.status === 'processing').length || 0
        }
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.datasets.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.datasets.processing || 0} processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.files.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.files.processed || 0} processed, {stats?.files.pending || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.models.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.models.deployed || 0} deployed, {stats?.models.training || 0} training
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.jobs.running || 0} running
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Overview of the AI training pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Processing</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats?.files.total ? (stats.files.processed / stats.files.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {stats?.files.total ? Math.round((stats.files.processed / stats.files.total) * 100) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Model Deployment</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats?.models.total ? (stats.models.deployed / stats.models.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {stats?.models.total ? Math.round((stats.models.deployed / stats.models.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
