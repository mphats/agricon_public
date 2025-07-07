
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CameraImageUpload } from '@/components/CameraImageUpload';
import { Plus, X, Phone } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CropType = Database['public']['Enums']['crop_type'];

interface ProductUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductUpload = ({ isOpen, onClose }: ProductUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    crop_type: '' as CropType | '',
    quantity_kg: '',
    price_per_kg: '',
    quality_grade: '',
    location_district: '',
    description: '',
    harvest_date: '',
    phone_number: ''
  });
  const [productImages, setProductImages] = useState<string[]>([]);

  const createListing = useMutation({
    mutationFn: async (data: typeof formData & { images: string[] }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('market_listings')
        .insert({
          farmer_id: user.id,
          crop_type: data.crop_type as CropType,
          quantity_kg: parseFloat(data.quantity_kg),
          price_per_kg: parseFloat(data.price_per_kg),
          quality_grade: data.quality_grade || null,
          location_district: data.location_district,
          description: data.description || null,
          harvest_date: data.harvest_date || null,
          phone_number: data.phone_number || null,
          images: data.images.length > 0 ? data.images : null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Product Listed",
        description: "Your product has been successfully listed on the market.",
      });
      // Reset form
      setFormData({
        crop_type: '',
        quantity_kg: '',
        price_per_kg: '',
        quality_grade: '',
        location_district: '',
        description: '',
        harvest_date: '',
        phone_number: ''
      });
      setProductImages([]);
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to list product. Please try again.",
        variant: "destructive",
      });
      console.error('Product listing error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.crop_type || !formData.quantity_kg || !formData.price_per_kg || !formData.location_district) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createListing.mutate({
      ...formData,
      images: productImages
    });
  };

  const addImage = (imageUrl: string | null) => {
    if (imageUrl && productImages.length < 3) {
      setProductImages([...productImages, imageUrl]);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-green-50 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">List Your Product</CardTitle>
              <CardDescription className="text-green-100">
                Add your crop to the marketplace
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type *
              </label>
              <Select 
                value={formData.crop_type} 
                onValueChange={(value: CropType) => setFormData({...formData, crop_type: value})}
              >
                <SelectTrigger className="border-green-200 focus:border-green-500">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (kg) *
                </label>
                <Input
                  type="number"
                  value={formData.quantity_kg}
                  onChange={(e) => setFormData({...formData, quantity_kg: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price/kg (MWK) *
                </label>
                <Input
                  type="number"
                  value={formData.price_per_kg}
                  onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District *
              </label>
              <Select 
                value={formData.location_district} 
                onValueChange={(value) => setFormData({...formData, location_district: value})}
              >
                <SelectTrigger className="border-green-200 focus:border-green-500">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lilongwe">Lilongwe</SelectItem>
                  <SelectItem value="Blantyre">Blantyre</SelectItem>
                  <SelectItem value="Mzuzu">Mzuzu</SelectItem>
                  <SelectItem value="Zomba">Zomba</SelectItem>
                  <SelectItem value="Kasungu">Kasungu</SelectItem>
                  <SelectItem value="Mangochi">Mangochi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="e.g., +265 999 123 456"
                  className="pl-10 border-green-200 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality Grade
              </label>
              <Input
                value={formData.quality_grade}
                onChange={(e) => setFormData({...formData, quality_grade: e.target.value})}
                placeholder="e.g., Grade A, Premium"
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Date
              </label>
              <Input
                type="date"
                value={formData.harvest_date}
                onChange={(e) => setFormData({...formData, harvest_date: e.target.value})}
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional details about your product..."
                rows={3}
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Photos ({productImages.length}/3)
              </label>
              {productImages.length < 3 && (
                <div className="mb-3">
                  <CameraImageUpload
                    onImageUpload={addImage}
                    currentImage={null}
                  />
                </div>
              )}
              
              {productImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {productImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded border-2 border-green-100"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createListing.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {createListing.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Listing...
                  </div>
                ) : (
                  'List Product'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
