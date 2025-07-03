
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Play, Pause, Download, Trash2, BarChart3 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ModelStatus = Database['public']['Enums']['model_status'];

export const ModelManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI models
  const { data: models, isLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_models')
        .select(`
          *,
          training_datasets (
            name,
            crop_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Deploy model mutation
  const deployModel = useMutation({
    mutationFn: async (modelId: string) => {
      const { error } = await supabase
        .from('ai_models')
        .update({
          status: 'deployed',
          deployment_date: new Date().toISOString()
        })
        .eq('id', modelId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Model Deployed",
        description: "AI model has been deployed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy model. Please try again.",
        variant: "destructive",
      });
      console.error('Model deployment error:', error);
    },
  });

  // Archive model mutation
  const archiveModel = useMutation({
    mutationFn: async (modelId: string) => {
      const { error } = await supabase
        .from('ai_models')
        .update({ status: 'archived' })
        .eq('id', modelId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Model Archived",
        description: "AI model has been archived.",
      });
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });

  const getStatusColor = (status: ModelStatus) => {
    switch (status) {
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'trained': return 'bg-green-100 text-green-800';
      case 'deployed': return 'bg-purple-100 text-purple-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ModelStatus) => {
    switch (status) {
      case 'training': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'trained': return <Brain className="h-4 w-4" />;
      case 'deployed': return <Play className="h-4 w-4" />;
      case 'archived': return <Pause className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (isLoading) {
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
          <h2 className="text-2xl font-bold">AI Models</h2>
          <p className="text-gray-600">Manage trained AI models and deployments</p>
        </div>
      </div>

      <div className="grid gap-4">
        {models && models.length > 0 ? (
          models.map((model) => (
            <Card key={model.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(model.status!)}
                      <h3 className="text-lg font-semibold">{model.name}</h3>
                      <Badge className={getStatusColor(model.status!)}>
                        {model.status}
                      </Badge>
                      <span className="text-sm text-gray-500">v{model.version}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Model Type</p>
                        <p className="text-sm font-medium capitalize">{model.model_type}</p>
                      </div>
                      {model.training_datasets && (
                        <div>
                          <p className="text-xs text-gray-500">Dataset</p>
                          <p className="text-sm font-medium">{model.training_datasets.name}</p>
                        </div>
                      )}
                      {model.accuracy_score && (
                        <div>
                          <p className="text-xs text-gray-500">Accuracy</p>
                          <p className="text-sm font-medium">{(model.accuracy_score * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(model.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {model.training_started_at && model.training_completed_at && (
                      <div className="text-xs text-gray-500 mb-3">
                        Training duration: {Math.round(
                          (new Date(model.training_completed_at).getTime() - 
                           new Date(model.training_started_at).getTime()) / (1000 * 60)
                        )} minutes
                      </div>
                    )}

                    {model.metrics && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          Performance Metrics
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {Object.entries(model.metrics as Record<string, any>).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-500 capitalize">{key}:</span>
                              <span className="ml-1 font-medium">
                                {typeof value === 'number' ? value.toFixed(3) : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {model.status === 'trained' && (
                      <Button
                        size="sm"
                        onClick={() => deployModel.mutate(model.id)}
                        disabled={deployModel.isPending}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-4 w-4" />
                        Deploy
                      </Button>
                    )}
                    
                    {model.status === 'deployed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => archiveModel.mutate(model.id)}
                        disabled={archiveModel.isPending}
                        className="flex items-center gap-1"
                      >
                        <Pause className="h-4 w-4" />
                        Archive
                      </Button>
                    )}

                    {model.model_path && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No AI models yet</p>
              <p className="text-sm text-gray-400">
                Start training your first model from the Training tab
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
