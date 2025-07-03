
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Clock, CheckCircle, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const TransformerStatus = () => {
  const [backendStatus, setBackendStatus] = useState<{
    status: 'loading' | 'ready' | 'error';
    responseTime: number;
  }>({
    status: 'loading',
    responseTime: 0
  });

  useEffect(() => {
    const testBackendConnection = async () => {
      const startTime = Date.now();
      try {
        // Test the backend AI function
        const { data, error } = await supabase.functions.invoke('ai-diagnosis', {
          body: { 
            cropType: 'maize', 
            symptoms: 'test connection' 
          }
        });
        
        const responseTime = Date.now() - startTime;
        
        if (error) {
          console.error('Backend test failed:', error);
          setBackendStatus({
            status: 'error',
            responseTime: 0
          });
        } else {
          setBackendStatus({
            status: 'ready',
            responseTime
          });
        }
      } catch (error) {
        console.error('Failed to test backend connection:', error);
        setBackendStatus({
          status: 'error',
          responseTime: 0
        });
      }
    };

    testBackendConnection();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'loading': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'loading': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'error': return <Brain className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-600" />
          Backend AI Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">AI Analysis Engine</h4>
            <p className="text-sm text-gray-600">Server-side plant disease analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(backendStatus.status)}>
              {getStatusIcon(backendStatus.status)}
              <span className="ml-1 capitalize">{backendStatus.status}</span>
            </Badge>
          </div>
        </div>

        {backendStatus.status === 'ready' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Backend AI Ready
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Response time: {backendStatus.responseTime}ms • Enhanced server-side analysis enabled
            </p>
          </div>
        )}

        {backendStatus.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Backend Connection Failed
              </span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Falling back to database analysis only
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-3">
          <p><strong>Backend Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Advanced semantic symptom matching</li>
            <li>Enhanced confidence scoring algorithms</li>
            <li>Server-side processing for reliability</li>
            <li>No browser compatibility issues</li>
            <li>Consistent performance across devices</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
