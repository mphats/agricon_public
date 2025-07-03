
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (url: string | null) => void;
  currentImage: string | null;
}

export const ImageUpload = ({ onImageUpload, currentImage }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      onImageUpload(url);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      onImageUpload(url);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (currentImage) {
      URL.revokeObjectURL(currentImage);
    }
    onImageUpload(null);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {currentImage ? (
        <div className="space-y-2">
          <img
            src={currentImage}
            alt="Preview"
            className="max-w-full h-48 object-contain mx-auto rounded"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
        </div>
      )}
    </div>
  );
};
