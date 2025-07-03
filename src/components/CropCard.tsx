
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CropCardProps {
  crop: {
    id: string;
    crop_type: string;
    price_per_kg: number;
    district: string;
    date_recorded: string;
    market_name?: string;
  };
  rank: number;
  priceChange?: number;
}

const cropImages: Record<string, string> = {
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
  beans: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
  groundnuts: 'https://images.unsplash.com/photo-1605050244419-2e72ae5b0636?w=400&h=300&fit=crop',
  cassava: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop',
  rice: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
  tobacco: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop',
  other: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
};

const getRankColor = (rank: number) => {
  if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
  if (rank <= 6) return 'bg-gradient-to-r from-green-400 to-green-600';
  return 'bg-gradient-to-r from-blue-400 to-blue-600';
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return '🏆';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

export const CropCard = ({ crop, rank, priceChange }: CropCardProps) => {
  const imageUrl = cropImages[crop.crop_type] || cropImages.other;
  
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/95 backdrop-blur-sm">
      <div className="relative">
        {/* Crop Image */}
        <div 
          className="h-32 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* Rank Badge */}
          <div className={`absolute top-2 left-2 ${getRankColor(rank)} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
            {getRankBadge(rank)}
          </div>
          
          {/* Price Change Indicator */}
          {priceChange !== undefined && (
            <div className={`absolute top-2 right-2 flex items-center text-xs font-medium px-2 py-1 rounded-full shadow-lg ${
              priceChange > 0 
                ? 'bg-green-500/90 text-white' 
                : priceChange < 0 
                ? 'bg-red-500/90 text-white' 
                : 'bg-gray-500/90 text-white'
            }`}>
              {priceChange > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : priceChange < 0 ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : null}
              {priceChange > 0 ? '+' : ''}{priceChange}%
            </div>
          )}
          
          {/* Crop Name Overlay */}
          <div className="absolute bottom-2 left-2">
            <h3 className="text-white font-semibold text-sm capitalize drop-shadow-lg">
              {crop.crop_type}
            </h3>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Price */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              MWK {crop.price_per_kg}
            </div>
            <div className="text-xs text-gray-500">per kg</div>
          </div>
          
          {/* Location and Market */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-700">{crop.district}</p>
            {crop.market_name && (
              <p className="text-xs text-gray-500">{crop.market_name}</p>
            )}
            <p className="text-xs text-gray-400">
              {new Date(crop.date_recorded).toLocaleDateString()}
            </p>
          </div>
          
          {/* Market Position */}
          <div className="text-center pt-2 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-600">
              Market Position: #{rank}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
