
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, User, AlertTriangle, CheckCircle, Clock, Image } from 'lucide-react';

interface ChatMessageProps {
  message: {
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
  };
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-700 bg-green-100 border-green-200';
      case 'moderate': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'severe': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'mild': return <CheckCircle className="h-4 w-4" />;
      case 'moderate': return <Clock className="h-4 w-4" />;
      case 'severe': case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-10 w-10 mt-1 shadow-md">
        <AvatarImage src="" alt="" />
        <AvatarFallback className={`flex items-center justify-center ${
          message.type === 'user' 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
            : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
        }`}>
          {message.type === 'user' ? (
            <User className="h-5 w-5" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[75%] ${message.type === 'user' ? 'text-right' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-md ${
            message.type === 'user'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto'
              : 'bg-white border border-green-100 text-gray-800'
          }`}
        >
          {message.image && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2 text-sm opacity-75">
                <Image className="h-4 w-4" />
                <span>Image uploaded</span>
              </div>
              <img
                src={message.image}
                alt="Uploaded plant"
                className="max-w-full h-48 object-cover rounded-lg border-2 border-white/20"
              />
            </div>
          )}
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {message.diagnosis && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs border ${getSeverityColor(message.diagnosis.severity)}`}>
                  {getSeverityIcon(message.diagnosis.severity)}
                  <span className="ml-1 capitalize font-medium">{message.diagnosis.severity}</span>
                </Badge>
                <span className="text-xs opacity-75 bg-white/20 px-2 py-1 rounded-full">
                  Confidence: {Math.round(message.diagnosis.confidence * 100)}%
                </span>
              </div>

              <div className="text-xs opacity-90 space-y-2 bg-white/10 p-3 rounded-lg">
                <div>
                  <strong className="text-green-700">💊 Treatment:</strong> 
                  <span className="ml-1">{message.diagnosis.treatment}</span>
                </div>
                <div>
                  <strong className="text-blue-700">🛡️ Prevention:</strong> 
                  <span className="ml-1">{message.diagnosis.prevention}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-2 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
