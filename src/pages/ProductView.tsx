
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Phone, Star, ShoppingCart, Share2, Heart, User } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('market_listings')
        .select('*, profiles(first_name, last_name, phone_number)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/market')} className="bg-green-600 hover:bg-green-700">
              Back to Market
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/market')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Market
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.crop_type}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                  <div className="text-green-600 text-8xl font-bold capitalize">
                    {product.crop_type.charAt(0)}
                  </div>
                </div>
              )}
              
              {/* Featured Badge */}
              {product.is_featured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.slice(1, 4).map((image, index) => (
                  <div key={index} className="h-24 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={image} 
                      alt={`${product.crop_type} ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <Card className="border-green-200 shadow-lg bg-gradient-to-br from-white to-green-50/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title and Quality */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 capitalize mb-2">
                      {product.crop_type}
                    </h1>
                    {product.quality_grade && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                        {product.quality_grade}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-bold text-green-700">
                        MWK {product.price_per_kg}
                      </span>
                      <span className="text-lg text-green-600">per kg</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      {product.quantity_kg}kg available
                    </p>
                  </div>

                  {/* Location and Contact */}
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3 text-green-600" />
                      <span className="font-medium">{product.location_district}</span>
                    </div>
                    
                    {product.phone_number && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-5 w-5 mr-3 text-green-600" />
                        <span className="font-medium">{product.phone_number}</span>
                      </div>
                    )}
                    
                    {product.harvest_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-3 text-green-600" />
                        <span>Harvested: {new Date(product.harvest_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Farmer Info */}
                  {product.profiles && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {product.profiles.first_name} {product.profiles.last_name}
                          </p>
                          <p className="text-sm text-gray-600">Farmer</p>
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-2">4.8 (24 reviews)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {product.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button 
                      size="lg" 
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Contact Seller
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="border-green-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium capitalize">{product.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Listed:</span>
                    <p className="font-medium">{new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Crop Type:</span>
                    <p className="font-medium capitalize">{product.crop_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium">{product.quantity_kg} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default ProductView;
