import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CropType = Database['public']['Enums']['crop_type'];

export const KaggleDatasetImporter = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState({
    datasetName: 'bwengekyangwijosue/gideonizindicropdesease',
    trainDatasetName: 'Plant Disease Diagnosis Dataset v1.0',
    cropType: 'other' as CropType,
    description: 'Kaggle dataset for plant disease diagnosis training'
  });

  const importDataset = useMutation({
    mutationFn: async (data: typeof importData) => {
      console.log('Starting Kaggle dataset import...', data);
      
      try {
        // Get the current session to include auth token
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Session warning:', sessionError);
        }

        const authToken = session?.session?.access_token;
        console.log('Auth token available:', !!authToken);

        const { data: result, error } = await supabase.functions.invoke('kaggle-dataset-import', {
          body: {
            datasetName: data.datasetName,
            trainDatasetName: data.trainDatasetName,
            cropType: data.cropType,
            description: data.description
          },
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : 'Bearer mock-token',
            'Content-Type': 'application/json'
          }
        });

        console.log('Edge function response:', { result, error });

        if (error) {
          console.error('Edge function error details:', error);
          throw new Error(`Edge Function Error: ${error.message || 'Unknown error occurred'}`);
        }

        if (!result) {
          throw new Error('No response received from Edge Function');
        }

        if (!result.success) {
          throw new Error(result.message || 'Import failed without specific error');
        }

        console.log('Import completed successfully:', result);
        return result;
      } catch (fetchError) {
        console.error('Import request failed:', fetchError);
        
        // Provide more specific error messages
        if (fetchError.message?.includes('Failed to send a request')) {
          throw new Error('Unable to connect to the import service. Please check your connection and try again.');
        } else if (fetchError.message?.includes('non-2xx status code')) {
          throw new Error('Import service returned an error. Please try again or contact support.');
        } else {
          throw new Error(`Import failed: ${fetchError.message || 'Unknown error'}`);
        }
      }
    },
    onSuccess: (result) => {
      console.log('Import mutation successful:', result);
      toast({
        title: "Dataset Import Started",
        description: `Successfully imported ${result.import_stats?.dataset_size_mb || 'N/A'}MB dataset from Kaggle. Training job created.`,
      });
      setIsImportDialogOpen(false);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['training-datasets'] });
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
    onError: (error: any) => {
      console.error('Import mutation failed:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import dataset from Kaggle. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Download className="h-5 w-5" />
          Kaggle Dataset Import
        </CardTitle>
        <CardDescription>
          Import datasets directly from Kaggle for AI model training
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Recommended Dataset</h4>
          <p className="text-sm text-blue-700 mb-3">
            <strong>bwengekyangwijosue/gideonizindicropdesease</strong> - 
            A comprehensive plant disease dataset perfect for training your diagnosis model.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('https://www.kaggle.com/datasets/bwengekyangwijosue/gideonizindicropdesease', '_blank')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Kaggle
            </Button>
          </div>
        </div>

        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Import Kaggle Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Kaggle Dataset</DialogTitle>
              <DialogDescription>
                Import a dataset from Kaggle and start training your AI model
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kaggle Dataset</label>
                <Input
                  value={importData.datasetName}
                  onChange={(e) => setImportData({ ...importData, datasetName: e.target.value })}
                  placeholder="username/dataset-name"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: username/dataset-name (e.g., bwengekyangwijosue/gideonizindicropdesease)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Training Dataset Name</label>
                <Input
                  value={importData.trainDatasetName}
                  onChange={(e) => setImportData({ ...importData, trainDatasetName: e.target.value })}
                  placeholder="My Training Dataset"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Crop Type</label>
                <Select value={importData.cropType} onValueChange={(value: CropType) => setImportData({ ...importData, cropType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="beans">Beans</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="cassava">Cassava</SelectItem>
                    <SelectItem value="groundnuts">Groundnuts</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="tobacco">Tobacco</SelectItem>
                    <SelectItem value="soybean">Soybean</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={importData.description}
                  onChange={(e) => setImportData({ ...importData, description: e.target.value })}
                  placeholder="Describe the dataset and its purpose"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(false)}
                  disabled={importDataset.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => importDataset.mutate(importData)}
                  disabled={importDataset.isPending || !importData.datasetName.trim()}
                >
                  {importDataset.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import & Train
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
