
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Bot, Sparkles, Trash2, Menu } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { useToast } from '@/hooks/use-toast';
import { analyzePlantImage } from '@/utils/aiDiagnostics';
import { ModelSelector } from '@/components/diagnostics/ModelSelector';
import { ChatMessage } from '@/components/diagnostics/ChatMessage';
import { ChatInput } from '@/components/diagnostics/ChatInput';
import type { Database } from '@/integrations/supabase/types';

type CropType = Database['public']['Enums']['crop_type'];
type SeverityType = Database['public']['Enums']['pest_disease_severity'];

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  image?: string;
  diagnosis?: {
    confidence: number;
    severity: string;
    treatment: string;
    prevention: string;
  };
  timestamp: Date;
}

const Diagnostics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI agricultural assistant. I can help you diagnose plant diseases and provide treatment recommendations. Please select an AI model above, then upload an image of your plant and describe the symptoms you're observing.",
      timestamp: new Date(),
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create new diagnosis mutation
  const createDiagnosis = useMutation({
    mutationFn: async (data: {
      crop_type: CropType;
      symptoms_description: string;
      image_url?: string;
      ai_diagnosis: string;
      confidence_score: number;
      severity: SeverityType;
      treatment_recommendations: string;
      prevention_advice: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('pest_disease_diagnoses')
        .insert({
          farmer_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pest-disease-diagnoses'] });
    },
  });

  const handleSendMessage = async (content: string, cropType: CropType, image?: string) => {
    if (!selectedModel) {
      toast({
        title: "No Model Selected",
        description: "Please select an AI model before sending a message.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      image,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Get AI analysis
      const analysis = await analyzePlantImage(cropType, content, image);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: analysis.diagnosis,
        diagnosis: {
          confidence: analysis.confidence,
          severity: analysis.severity,
          treatment: analysis.treatment,
          prevention: analysis.prevention,
        },
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Save to database
      await createDiagnosis.mutateAsync({
        crop_type: cropType,
        symptoms_description: content,
        image_url: image,
        ai_diagnosis: analysis.diagnosis,
        confidence_score: analysis.confidence,
        severity: analysis.severity as SeverityType,
        treatment_recommendations: analysis.treatment,
        prevention_advice: analysis.prevention,
      });

    } catch (error) {
      console.error('Analysis error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while analyzing your request. Please try again or contact support if the problem persists.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the plant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: "Hello! I'm your AI agricultural assistant. I can help you diagnose plant diseases and provide treatment recommendations. Please select an AI model above, then upload an image of your plant and describe the symptoms you're observing.",
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Agricultural Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-green-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    AgriAI Assistant
                  </h1>
                  <p className="text-sm text-green-600/70">Plant Disease Diagnosis & Care</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="flex items-center gap-2 border-green-200 hover:bg-green-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-6 max-w-5xl">
        {/* Model Selection Card */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              AI Model Selection
            </CardTitle>
            <CardDescription className="text-green-600/70">
              Choose a trained AI model for accurate plant disease diagnosis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModelSelector
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="flex flex-col h-[70vh] bg-white/70 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Agricultural Assistant</h3>
                  <p className="text-sm text-green-100">Ready to help with plant diagnostics</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-100">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-green-50/30 to-emerald-50/30">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
            
            {createDiagnosis.isPending && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">AI is analyzing your plant...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-green-200/50 bg-white/80 backdrop-blur-sm p-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={createDiagnosis.isPending}
            />
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-6 bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-800">🌱 Tips for Better Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  📸 Image Quality
                </h4>
                <ul className="space-y-2 text-green-600/80">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Use natural lighting or bright indoor light
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Focus on affected plant parts clearly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Include leaves, stems, or fruits showing symptoms
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  📝 Symptom Description
                </h4>
                <ul className="space-y-2 text-green-600/80">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Describe color changes, spots, or unusual growth
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Mention when symptoms first appeared
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Note recent weather or care changes
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default Diagnostics;
