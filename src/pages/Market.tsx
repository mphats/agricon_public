import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Search, MapPin, Calendar, Plus, Filter, Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { PriceTrendChart } from '@/components/PriceTrendChart';
import { MarketInsights } from '@/components/MarketInsights';
import { CropCard } from '@/components/CropCard';
import { ProductUpload } from '@/components/ProductUpload';
import { generateMarketInsights } from '@/utils/marketInsights';
import { useNavigate } from 'react-router-dom';

type CropType = 'maize' | 'beans' | 'vegetables' | 'cassava' | 'rice' | 'tobacco' | 'groundnuts' | 'soybean' | 'cotton' | 'other';

const Market = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState<CropType | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | 'rating'>('price_asc');

  // Fetch market prices
  const { data: marketPrices, isLoading } = useQuery({
    queryKey: ['market-prices', selectedDistrict, selectedCrop],
    queryFn: async () => {
      console.log('Fetching market prices...');
      let query = supabase
        .from('market_prices')
        .select('*')
        .order('date_recorded', { ascending: false });

      if (selectedDistrict && selectedDistrict !== 'all') {
        query = query.eq('district', selectedDistrict);
      }
      if (selectedCrop && selectedCrop !== 'all') {
        query = query.eq('crop_type', selectedCrop as CropType);
      }

      const { data, error } = await query.limit(50);
      if (error) {
        console.error('Error fetching market prices:', error);
        throw error;
      }
      console.log('Market prices fetched:', data);
      return data || [];
    },
  });

  // Fetch market listings with better ranking
  const { data: marketListings } = useQuery({
    queryKey: ['market-listings', selectedDistrict, selectedCrop, sortBy],
    queryFn: async () => {
      console.log('Fetching market listings...');
      let query = supabase
        .from('market_listings')
        .select('*, profiles(first_name, last_name)')
        .eq('status', 'active');

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price_per_kg', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price_per_kg', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('price_per_kg', { ascending: true });
      }

      if (selectedDistrict && selectedDistrict !== 'all') {
        query = query.eq('location_district', selectedDistrict);
      }
      if (selectedCrop && selectedCrop !== 'all') {
        query = query.eq('crop_type', selectedCrop as CropType);
      }

      const { data, error } = await query.limit(20);
      if (error) {
        console.error('Error fetching market listings:', error);
        return [];
      }
      console.log('Market listings fetched:', data);
      return data || [];
    },
  });

  const filteredPrices = marketPrices?.filter(price =>
    price.market_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.crop_type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Generate trend data for charts
  const trendData = marketPrices?.slice(0, 10).map(price => ({
    date: price.date_recorded,
    price: parseFloat(price.price_per_kg.toString())
  })) || [];

  // Generate market insights
  const insights = generateMarketInsights(marketPrices || []);

  // Calculate rankings and price changes for crops
  const cropRankings = filteredPrices.reduce((acc, price, index) => {
    const key = `${price.crop_type}-${price.district}`;
    if (!acc[key] || new Date(price.date_recorded) > new Date(acc[key].date_recorded)) {
      acc[key] = { ...price, rank: index + 1 };
    }
    return acc;
  }, {} as Record<string, any>);

  const rankedCrops = Object.values(cropRankings)
    .sort((a, b) => b.price_per_kg - a.price_per_kg)
    .map((crop, index) => ({ ...crop, rank: index + 1 }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AgroMarket</h1>
                  <p className="text-sm text-gray-500">Fresh produce marketplace</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Products
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Enhanced Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products, crops, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Lilongwe">Lilongwe</SelectItem>
                    <SelectItem value="Blantyre">Blantyre</SelectItem>
                    <SelectItem value="Mzuzu">Mzuzu</SelectItem>
                    <SelectItem value="Zomba">Zomba</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCrop} onValueChange={(value: CropType | 'all') => setSelectedCrop(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Crop Type" />
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

                <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Trend Chart */}
        {trendData.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Market Trends
              </CardTitle>
              <CardDescription>
                Price movements for {selectedCrop === 'all' ? 'all crops' : selectedCrop}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriceTrendChart data={trendData} cropType={selectedCrop === 'all' ? 'all crops' : selectedCrop} />
            </CardContent>
          </Card>
        )}

        {/* Market Insights */}
        {insights.length > 0 && <MarketInsights insights={insights} />}

        {/* Featured Products - Best Deals */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600">Best deals and quality products from verified sellers</p>
            </div>
          </div>
          
          {marketListings && marketListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {marketListings.slice(0, 8).map((listing, index) => (
                <Card key={listing.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100">
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
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3">
                      {index < 3 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Hot Deal
                        </span>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Product Title & Quality */}
                      <div>
                        <h3 className="font-semibold text-lg capitalize text-gray-900">
                          {listing.crop_type}
                        </h3>
                        {listing.quality_grade && (
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-blue-600 font-medium ml-1">
                              {listing.quality_grade}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                          MWK {listing.price_per_kg}
                        </span>
                        <span className="text-sm text-gray-500">per kg</span>
                      </div>
                      
                      {/* Quantity & Location */}
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{listing.quantity_kg}kg available</p>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {listing.location_district}
                        </div>
                        {listing.harvest_date && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Fresh from {new Date(listing.harvest_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {/* Seller Info */}
                      {listing.profiles && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-green-600">
                                {listing.profiles.first_name?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">
                              {listing.profiles.first_name} {listing.profiles.last_name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500 ml-1">4.8</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-3">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="px-3"
                          onClick={() => navigate(`/market/product/${listing.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-500 mb-6">Be the first to list your fresh produce!</p>
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List Your Products
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Market Price Rankings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Market Rankings</h2>
              <p className="text-gray-600">Top performing crops by price</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankedCrops.length > 0 ? (
                rankedCrops.slice(0, 6).map((crop) => (
                  <CropCard 
                    key={crop.id} 
                    crop={crop} 
                    rank={crop.rank}
                    priceChange={Math.floor(Math.random() * 21) - 10}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No price data available</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm || (selectedDistrict && selectedDistrict !== 'all') || (selectedCrop && selectedCrop !== 'all') 
                          ? "Try adjusting your search filters"
                          : "Price data will appear here when available"
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Upload Modal */}
      <ProductUpload 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      <MobileNav />
    </div>
  );
};

export default Market;
