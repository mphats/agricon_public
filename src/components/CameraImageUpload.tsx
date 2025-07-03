
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

interface CameraImageUploadProps {
  onImageUpload: (url: string | null) => void;
  currentImage: string | null;
}

export const CameraImageUpload = ({ onImageUpload, currentImage }: CameraImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const takePicture = async () => {
    try {
      setIsLoading(true);
      
      // Dynamic import to avoid compilation errors in web environment
      const { Camera: CapacitorCamera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        onImageUpload(image.dataUrl);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      // Fallback to file input if camera is not available
      document.getElementById('file-upload')?.click();
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      setIsLoading(true);
      
      // Dynamic import to avoid compilation errors in web environment
      const { Camera: CapacitorCamera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        onImageUpload(image.dataUrl);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      // Fallback to file input if gallery is not available
      document.getElementById('file-upload')?.click();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onImageUpload(url);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
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

  // Check if we're in a native environment
  const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {currentImage ? (
        <div className="space-y-3">
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
        <div className="space-y-4">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
          
          {/* Native Camera Options */}
          {isNative && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={takePicture}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isLoading ? 'Taking...' : 'Take Photo'}
              </Button>
              <Button
                type="button"
                onClick={selectFromGallery}
                disabled={isLoading}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Gallery'}
              </Button>
            </div>
          )}
          
          {/* Web Fallback */}
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
          
          <p className="text-xs text-gray-500">
            {isNative ? 'Take a photo or select from gallery' : 'PNG, JPG up to 10MB'}
          </p>
        </div>
      )}
    </div>
  );
};
