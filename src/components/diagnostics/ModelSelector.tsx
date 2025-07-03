
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { Brain, Zap } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  version: string;
  accuracy_score: number | null;
  model_type: string;
}

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelSelect: (modelId: string) => void;
}

export const ModelSelector = ({ selectedModel, onModelSelect }: ModelSelectorProps) => {
  const { data: models, isLoading } = useQuery({
    queryKey: ['deployed-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_models')
        .select('id, name, version, accuracy_score, model_type')
        .eq('status', 'deployed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Model[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Loading models...</span>
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Brain className="h-4 w-4" />
        <span>No trained models available</span>
      </div>
    );
  }

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">AI Model</label>
      <Select value={selectedModel || ''} onValueChange={onModelSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an AI model">
            {selectedModelData && (
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span>{selectedModelData.name}</span>
                <Badge variant="secondary" className="text-xs">
                  v{selectedModelData.version}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-gray-500 ml-2">v{model.version}</span>
                  </div>
                </div>
                {model.accuracy_score && (
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {Math.round(model.accuracy_score * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
