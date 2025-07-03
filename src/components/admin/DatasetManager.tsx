import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Database, FileText } from 'lucide-react';
import { KaggleDatasetImporter } from './KaggleDatasetImporter';

type CropType = 'maize' | 'beans' | 'vegetables' | 'cassava' | 'groundnuts' | 'rice' | 'tobacco' | 'other';
type TrainingDataStatus = 'pending' | 'processing' | 'processed' | 'failed';

export const DatasetManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDataset, setNewDataset] = useState({
    name: '',
    description: '',
    crop_type: '' as CropType | ''
  });

  // Fetch datasets
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['training-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create dataset mutation
  const createDataset = useMutation({
    mutationFn: async (data: typeof newDataset) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('training_datasets')
        .insert({
          name: data.name,
          description: data.description,
          crop_type: data.crop_type as CropType,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Dataset Created",
        description: "New training dataset created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewDataset({ name: '', description: '', crop_type: '' });
      queryClient.invalidateQueries({ queryKey: ['training-datasets'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create dataset. Please try again.",
        variant: "destructive",
      });
      console.error('Dataset creation error:', error);
    },
  });

  // Delete dataset mutation
  const deleteDataset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_datasets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Dataset Deleted",
        description: "Training dataset deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['training-datasets'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete dataset. Please try again.",
        variant: "destructive",
      });
      console.error('Dataset deletion error:', error);
    },
  });

  const handleCreateDataset = () => {
    if (!newDataset.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Dataset name is required.",
        variant: "destructive",
      });
      return;
    }
    createDataset.mutate(newDataset);
  };

  const getStatusColor = (status: TrainingDataStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'processing': return 'text-blue-700 bg-blue-100';
      case 'processed': return 'text-green-700 bg-green-100';
      case 'failed': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
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
          <h2 className="text-2xl font-bold">Training Datasets</h2>
          <p className="text-gray-600">Manage datasets for AI model training</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Dataset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Dataset</DialogTitle>
              <DialogDescription>
                Create a new training dataset for AI model development
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dataset Name</label>
                <Input
                  value={newDataset.name}
                  onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })}
                  placeholder="Enter dataset name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Crop Type</label>
                <Select value={newDataset.crop_type} onValueChange={(value: CropType) => setNewDataset({ ...newDataset, crop_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="beans">Beans</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="cassava">Cassava</SelectItem>
                    <SelectItem value="groundnuts">Groundnuts</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="tobacco">Tobacco</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newDataset.description}
                  onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })}
                  placeholder="Describe the dataset purpose and contents"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDataset}
                  disabled={createDataset.isPending}
                >
                  {createDataset.isPending ? 'Creating...' : 'Create Dataset'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Kaggle Dataset Importer */}
      <KaggleDatasetImporter />

      <div className="grid gap-4">
        {datasets && datasets.length > 0 ? (
          datasets.map((dataset) => (
            <Card key={dataset.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">{dataset.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dataset.status!)}`}>
                        {dataset.status}
                      </div>
                    </div>
                    
                    {dataset.description && (
                      <p className="text-gray-600 mb-3">{dataset.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{dataset.total_files || 0} files</span>
                      </div>
                      <div>
                        <span>{dataset.processed_files || 0} processed</span>
                      </div>
                      {dataset.crop_type && (
                        <div>
                          <span className="capitalize">{dataset.crop_type}</span>
                        </div>
                      )}
                      <div>
                        <span>{new Date(dataset.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDataset.mutate(dataset.id)}
                      disabled={deleteDataset.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No datasets yet</p>
              <p className="text-sm text-gray-400">
                Create your first training dataset to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
