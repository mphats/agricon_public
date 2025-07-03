
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Image, X, Upload } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CropType = Database['public']['Enums']['crop_type'];

interface ChatInputProps {
  onSendMessage: (content: string, cropType: CropType, image?: string) => void;
  isLoading: boolean;
}

const cropTypeLabels: Record<CropType, string> = {
  maize: "🌽 Maize",
  beans: "🫘 Beans", 
  vegetables: "🥬 Vegetables",
  cassava: "🍠 Cassava",
  groundnuts: "🥜 Groundnuts",
  rice: "🌾 Rice",
  tobacco: "🚬 Tobacco",
  soybean: "🫛 Soybean",
  cotton: "🌱 Cotton",
  other: "🌿 Other"
};

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [content, setContent] = useState('');
  const [cropType, setCropType] = useState<CropType | ''>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleRemoveImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !cropType) return;

    onSendMessage(content, cropType as CropType, selectedImage || undefined);
    setContent('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Crop Type and Image Upload Row */}
      <div className="flex gap-3">
        <Select value={cropType} onValueChange={(value: CropType) => setCropType(value)}>
          <SelectTrigger className="w-56 border-green-200 focus:border-green-400 bg-white/80">
            <SelectValue placeholder="🌱 Select crop type" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border-green-200">
            {Object.entries(cropTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value} className="hover:bg-green-50">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 border-green-200 hover:bg-green-50 bg-white/80"
        >
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="relative inline-block">
          <img
            src={selectedImage}
            alt="Selected plant"
            className="h-24 w-24 object-cover rounded-lg border-2 border-green-200 shadow-md"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the symptoms you're seeing, ask questions about plant care, or request treatment advice..."
            className="min-h-[60px] resize-none border-green-200 focus:border-green-400 bg-white/80 backdrop-blur-sm pr-4"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {content.length}/500
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!content.trim() || !cropType || isLoading}
          className="px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="text-xs text-gray-500 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};
