import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Search, MapPin, Calendar, Plus } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { PriceTrendChart } from '@/components/PriceTrendChart';
import { MarketInsights } from '@/components/MarketInsights';
import { CropCard } from '@/components/CropCard';
import { ProductUpload } from '@/components/ProductUpload';
import { generateMarketInsights } from '@/utils/marketInsights';

type CropType = 'maize' | 'beans' | 'vegetables' | 'cassava' | 'rice' | 'tobacco' | 'groundnuts' | 'soybean' | 'cotton' | 'other';

const Market = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState<CropType | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

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
    queryKey: ['market-listings', selectedDistrict, selectedCrop],
    queryFn: async () => {
      console.log('Fetching market listings...');
      let query = supabase
        .from('market_listings')
        .select('*, profiles(first_name, last_name)')
        .eq('status', 'active')
        .order('price_per_kg', { ascending: true }); // Order by best prices first

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Market Prices</h1>
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Sell Product
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search markets or crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Select Crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  <SelectItem value="maize">Maize</SelectItem>
                  <SelectItem value="beans">Beans</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="groundnuts">Groundnuts</SelectItem>
                  <SelectItem value="cassava">Cassava</SelectItem>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="tobacco">Tobacco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Price Trend Chart */}
        {trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Price Trends</CardTitle>
              <CardDescription>
                Recent price movements for {selectedCrop === 'all' ? 'all crops' : selectedCrop}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriceTrendChart data={trendData} cropType={selectedCrop === 'all' ? 'all crops' : selectedCrop} />
            </CardContent>
          </Card>
        )}

        {/* Market Insights */}
        {insights.length > 0 && (
          <MarketInsights insights={insights} />
        )}

        {/* Top Performing Crops - Beautiful Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Rankings</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rankedCrops.length > 0 ? (
                rankedCrops.slice(0, 9).map((crop) => (
                  <CropCard 
                    key={crop.id} 
                    crop={crop} 
                    rank={crop.rank}
                    priceChange={Math.floor(Math.random() * 21) - 10} // Random price change for demo
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card>
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

        {/* Available Produce - Now with ranking by best prices */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Best Deals Available</h2>
          {marketListings && marketListings.length > 0 ? (
            <div className="space-y-3">
              {marketListings.map((listing, index) => (
                <Card key={listing.id} className={index < 3 ? 'border-green-200 shadow-md' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium capitalize">{listing.crop_type}</h3>
                          {index < 3 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              #{index + 1} Best Price
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {listing.quantity_kg}kg available
                        </p>
                        {listing.quality_grade && (
                          <p className="text-sm text-blue-600 font-medium">
                            {listing.quality_grade}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {listing.location_district}
                        </div>
                        {listing.harvest_date && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Harvested: {new Date(listing.harvest_date).toLocaleDateString()}
                          </div>
                        )}
                        {listing.profiles && (
                          <p className="text-xs text-gray-500 mt-1">
                            Seller: {listing.profiles.first_name} {listing.profiles.last_name}
                          </p>
                        )}
                        {listing.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className={`text-lg font-bold ${index < 3 ? 'text-green-600' : 'text-gray-900'}`}>
                          MWK {listing.price_per_kg}
                        </div>
                        <div className="text-xs text-gray-500">per kg</div>
                        <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                          Contact Seller
                        </Button>
                      </div>
                    </div>
                    
                    {/* Product Images */}
                    {listing.images && listing.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {listing.images.slice(0, 3).map((image: string, imgIndex: number) => (
                          <img 
                            key={imgIndex}
                            src={image} 
                            alt={`${listing.crop_type} ${imgIndex + 1}`}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No products available</p>
                <p className="text-sm text-gray-400">
                  Be the first to list your products!
                </p>
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List Your Product
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Market Prices - Legacy View */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Price List</h2>
          <div className="space-y-3">
            {filteredPrices.length > 0 ? (
              filteredPrices.map((price) => (
                <Card key={price.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium capitalize">{price.crop_type}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {price.district}
                          {price.market_name && ` - ${price.market_name}`}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(price.date_recorded).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          MWK {price.price_per_kg}
                        </div>
                        <div className="text-xs text-gray-500">per kg</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
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
            )}
          </div>
        </div>

        {/* Available Produce */}
        {marketListings && marketListings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Produce</h2>
            <div className="space-y-3">
              {marketListings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium capitalize">{listing.crop_type}</h3>
                        <p className="text-sm text-gray-600">
                          {listing.quantity_kg}kg available
                        </p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {listing.location_district}
                        </div>
                        {listing.profiles && (
                          <p className="text-xs text-gray-500 mt-1">
                            Seller: {listing.profiles.first_name} {listing.profiles.last_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          MWK {listing.price_per_kg}
                        </div>
                        <div className="text-xs text-gray-500">per kg</div>
                        <Button size="sm" className="mt-2">
                          Contact Seller
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
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
