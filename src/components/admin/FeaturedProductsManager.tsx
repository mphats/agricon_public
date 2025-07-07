
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, Search, Eye, Trash2, CheckCircle, XCircle, Phone, MapPin, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CropType = 'maize' | 'beans' | 'vegetables' | 'cassava' | 'rice' | 'tobacco' | 'groundnuts' | 'soybean' | 'cotton' | 'other';

export const FeaturedProductsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<CropType | 'all'>('all');

  // Fetch all market listings for admin
  const { data: marketListings, isLoading } = useQuery({
    queryKey: ['admin-market-listings', searchTerm, selectedCrop],
    queryFn: async () => {
      console.log('Fetching admin market listings...');
      let query = supabase
        .from('market_listings')
        .select('*, profiles(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (selectedCrop && selectedCrop !== 'all') {
        query = query.eq('crop_type', selectedCrop);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }
      return data || [];
    },
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('market_listings')
        .update({ is_featured: isFeatured })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product featured status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update featured status.",
        variant: "destructive",
      });
      console.error('Toggle featured error:', error);
    },
  });

  // Delete listing
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('market_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    },
  });

  const filteredListings = marketListings?.filter(listing =>
    listing.crop_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location_district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header with Agriculture Gradient */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Featured Products Manager</h2>
        <p className="text-green-100">Manage marketplace featured products and listings</p>
      </div>

      {/* Filters */}
      <Card className="border-green-200 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products, farmers, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCrop} onValueChange={(value: CropType | 'all') => setSelectedCrop(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                <SelectItem value="maize">Maize</SelectItem>
                <SelectItem value="beans">Beans</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="groundnuts">Groundnuts</SelectItem>
                <SelectItem value="cassava">Cassava</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="group hover:shadow-xl transition-all duration-300 border-green-100 overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-100">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.crop_type}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-green-600 text-4xl font-bold capitalize">
                      {listing.crop_type.charAt(0)}
                    </div>
                  </div>
                )}
                
                {/* Featured Badge */}
                {listing.is_featured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Product Title */}
                  <div>
                    <h3 className="font-semibold text-lg capitalize text-gray-900">
                      {listing.crop_type}
                    </h3>
                    {listing.quality_grade && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {listing.quality_grade}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-green-600">
                      MWK {listing.price_per_kg}
                    </span>
                    <span className="text-sm text-gray-500">per kg</span>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{listing.quantity_kg}kg available</p>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {listing.location_district}
                    </div>
                    {listing.phone_number && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {listing.phone_number}
                      </div>
                    )}
                    {listing.harvest_date && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(listing.harvest_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Farmer Info */}
                  {listing.profiles && (
                    <div className="flex items-center pt-2 border-t">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-green-600">
                          {listing.profiles.first_name?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {listing.profiles.first_name} {listing.profiles.last_name}
                      </span>
                    </div>
                  )}
                  
                  {/* Admin Actions */}
                  <div className="flex space-x-2 pt-3">
                    <Button
                      size="sm"
                      onClick={() => toggleFeaturedMutation.mutate({ 
                        id: listing.id, 
                        isFeatured: !listing.is_featured 
                      })}
                      disabled={toggleFeaturedMutation.isPending}
                      className={listing.is_featured 
                        ? "bg-yellow-500 hover:bg-yellow-600" 
                        : "bg-green-600 hover:bg-green-700"
                      }
                    >
                      {listing.is_featured ? (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Unfeature
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Feature
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/market/product/${listing.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(listing.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredListings.length === 0 && !isLoading && (
        <Card className="border-green-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
