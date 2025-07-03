
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TrainingDataStatus = Database['public']['Enums']['training_data_status'];

export const TrainingJobMonitor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDataset, setSelectedDataset] = useState<string>('');

  // Fetch training jobs
  const { data: trainingJobs, isLoading } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: async () => {
      console.log('Fetching training jobs...');
      const { data, error } = await supabase
        .from('training_jobs')
        .select(`
          *,
          training_datasets (
            name,
            crop_type
          ),
          ai_models (
            name,
            version
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching training jobs:', error);
        throw error;
      }
      console.log('Training jobs fetched successfully:', data);
      return data;
    },
  });

  // Fetch available datasets - now includes all datasets, not just processed ones
  const { data: datasets, isLoading: datasetsLoading } = useQuery({
    queryKey: ['training-datasets-for-jobs'],
    queryFn: async () => {
      console.log('Fetching training datasets...');
      const { data, error } = await supabase
        .from('training_datasets')
        .select('id, name, status, created_at, total_files, processed_files')
        .order('name');

      if (error) {
        console.error('Error fetching training datasets:', error);
        throw error;
      }
      console.log('Training datasets fetched successfully:', data);
      return data;
    },
  });

  // Start training job mutation
  const startTraining = useMutation({
    mutationFn: async (datasetId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Starting training for dataset:', datasetId);

      // Get dataset info for better model naming
      const { data: dataset, error: datasetError } = await supabase
        .from('training_datasets')
        .select('name, crop_type')
        .eq('id', datasetId)
        .single();

      if (datasetError) {
        console.error('Error fetching dataset:', datasetError);
        throw datasetError;
      }

      // Create AI model first
      const modelName = `${dataset.name}-Model-${Date.now()}`;
      console.log('Creating AI model:', modelName);

      const { data: model, error: modelError } = await supabase
        .from('ai_models')
        .insert({
          name: modelName,
          version: '1.0.0',
          model_type: 'plant_diagnosis',
          dataset_id: datasetId,
          status: 'training',
          training_started_at: new Date().toISOString(),
          created_by: user.id
        })
        .select()
        .single();

      if (modelError) {
        console.error('Error creating AI model:', modelError);
        throw modelError;
      }

      console.log('AI model created successfully:', model);

      // Create training job
      console.log('Creating training job for model:', model.id);
      const { data: job, error: jobError } = await supabase
        .from('training_jobs')
        .insert({
          dataset_id: datasetId,
          model_id: model.id,
          status: 'processing',
          started_at: new Date().toISOString(),
          progress_percentage: 0,
          created_by: user.id
        })
        .select()
        .single();

      if (jobError) {
        console.error('Error creating training job:', jobError);
        throw jobError;
      }

      console.log('Training job created successfully:', job);
      return job;
    },
    onSuccess: () => {
      toast({
        title: "Training Started",
        description: "AI model training has been initiated successfully.",
      });
      setSelectedDataset('');
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
    onError: (error) => {
      console.error('Training start error:', error);
      toast({
        title: "Training Failed",
        description: `Failed to start training: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Stop training job mutation
  const stopTraining = useMutation({
    mutationFn: async (jobId: string) => {
      console.log('Stopping training job:', jobId);
      const { error } = await supabase
        .from('training_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: 'Training stopped by user'
        })
        .eq('id', jobId);

      if (error) {
        console.error('Error stopping training job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Training Stopped",
        description: "Training job has been stopped.",
      });
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
    },
  });

  const getStatusColor = (status: TrainingDataStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TrainingDataStatus) => {
    switch (status) {
      case 'pending': return <RefreshCw className="h-4 w-4" />;
      case 'processing': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'processed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  if (isLoading || datasetsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Training Jobs</h2>
          <p className="text-gray-600">Monitor and manage AI model training processes</p>
        </div>
      </div>

      {/* Start New Training */}
      <Card>
        <CardHeader>
          <CardTitle>Start New Training</CardTitle>
          <CardDescription>
            Select a dataset to begin training a new AI model. All datasets are available for training.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug info */}
          {datasets && datasets.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                No training datasets found. Please upload some training data first in the Training tab.
              </p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={
                  datasets && datasets.length > 0 
                    ? "Select a dataset" 
                    : "No datasets available"
                } />
              </SelectTrigger>
              <SelectContent>
                {datasets?.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{dataset.name}</span>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge className={getStatusColor(dataset.status!)}>
                          {dataset.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {dataset.total_files || 0} files
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => startTraining.mutate(selectedDataset)}
              disabled={startTraining.isPending || !selectedDataset || !datasets || datasets.length === 0}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {startTraining.isPending ? 'Starting...' : 'Start Training'}
            </Button>
          </div>

          {/* Dataset selection info */}
          {selectedDataset && datasets && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {(() => {
                const dataset = datasets.find(d => d.id === selectedDataset);
                return dataset ? (
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Selected Dataset: {dataset.name}</p>
                    <p className="text-blue-600">
                      Status: {dataset.status} | Files: {dataset.total_files || 0} total, {dataset.processed_files || 0} processed
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Training Jobs */}
      <div className="space-y-4">
        {trainingJobs && trainingJobs.length > 0 ? (
          trainingJobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(job.status!)}
                      <h3 className="text-lg font-semibold">
                        {job.ai_models?.name || 'Training Job'}
                      </h3>
                      <Badge className={getStatusColor(job.status!)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Dataset</p>
                        <p className="font-medium">{job.training_datasets?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Model Version</p>
                        <p className="font-medium">{job.ai_models?.version || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Started</p>
                        <p className="font-medium">
                          {job.started_at ? new Date(job.started_at).toLocaleString() : 'Not started'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">
                          {job.started_at ? 
                            Math.round((Date.now() - new Date(job.started_at).getTime()) / (1000 * 60)) + 'm' : 
                            'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {job.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Training Progress</span>
                          <span>{job.progress_percentage || 0}%</span>
                        </div>
                        <Progress value={job.progress_percentage || 0} className="w-full" />
                      </div>
                    )}

                    {/* Error Message */}
                    {job.error_message && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Error</p>
                            <p className="text-sm text-red-700">{job.error_message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Logs */}
                    {job.logs && (
                      <div className="mt-3">
                        <details className="bg-gray-50 rounded-lg">
                          <summary className="p-3 text-sm font-medium cursor-pointer">
                            View Logs
                          </summary>
                          <div className="p-3 pt-0">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                              {job.logs}
                            </pre>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {job.status === 'processing' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => stopTraining.mutate(job.id)}
                        disabled={stopTraining.isPending}
                        className="flex items-center gap-1"
                      >
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No training jobs yet</p>
              <p className="text-sm text-gray-400">
                Start your first AI model training above
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
