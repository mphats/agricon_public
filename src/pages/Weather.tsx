
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { fetchCurrentWeather, fetchWeatherForecast } from '@/services/weatherService';
import { generateFarmingAdvice, getSeasonalData } from '@/utils/farmingAdvice';

const Weather = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Lilongwe');

  // Fetch active weather alerts
  const { data: weatherAlerts } = useQuery({
    queryKey: ['weather-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch current weather from OpenWeather API
  const { data: currentWeather, isLoading: isLoadingCurrent, error: currentWeatherError } = useQuery({
    queryKey: ['current-weather', selectedDistrict],
    queryFn: () => fetchCurrentWeather(selectedDistrict),
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 2,
  });

  // Fetch weather forecast from OpenWeather API
  const { data: weeklyForecast, isLoading: isLoadingForecast, error: forecastError } = useQuery({
    queryKey: ['weather-forecast', selectedDistrict],
    queryFn: () => fetchWeatherForecast(selectedDistrict),
    refetchInterval: 600000, // Refresh every 10 minutes
    retry: 2,
  });

  // Generate dynamic farming advice based on current weather
  const farmingAdvice = currentWeather ? generateFarmingAdvice(
    currentWeather.temperature,
    currentWeather.humidity,
    currentWeather.condition,
    currentWeather.precipitation
  ) : [];

  // Get seasonal data for selected district
  const seasonalData = getSeasonalData(selectedDistrict);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-5 w-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-5 w-5 text-blue-500" />;
      default: return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getAdviceIcon = (iconType: string) => {
    switch (iconType) {
      case 'thermometer': return <Thermometer className="h-4 w-4 text-blue-600" />;
      case 'cloud-rain': return <CloudRain className="h-4 w-4 text-blue-600" />;
      case 'sun': return <Sun className="h-4 w-4 text-orange-600" />;
      case 'wind': return <Wind className="h-4 w-4 text-blue-600" />;
      default: return <Cloud className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'medium': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'critical': return 'border-red-300 bg-red-100 text-red-900';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getWeatherBackground = () => {
    if (!currentWeather) return 'bg-gradient-to-br from-blue-400 to-blue-600';
    
    switch (currentWeather.condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-blue-400';
      case 'clouds':
      case 'cloudy':
        return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        return 'bg-gradient-to-br from-gray-700 via-blue-600 to-blue-800';
      case 'snow':
        return 'bg-gradient-to-br from-gray-200 via-blue-200 to-white';
      case 'mist':
      case 'fog':
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
      default:
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
    }
  };

  const getAnimationClass = () => {
    if (!currentWeather) return '';
    
    switch (currentWeather.condition.toLowerCase()) {
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        return 'animate-pulse';
      case 'clear':
      case 'sunny':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Beautiful Clouds Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-white/20 to-blue-600/40"></div>
        
        {/* Animated Cloud Projections */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-24 h-16 bg-white/20 rounded-full blur-xl animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute top-20 right-20 w-32 h-20 bg-white/15 rounded-full blur-2xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
          <div className="absolute bottom-32 left-1/4 w-28 h-18 bg-white/25 rounded-full blur-xl animate-[float_7s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-12 bg-white/20 rounded-full blur-xl animate-[float_9s_ease-in-out_infinite_reverse]"></div>
        </div>
      </div>

      {/* Header - Mobile Optimized */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="h-5 w-5 text-white mr-2" />
              <h1 className="text-lg font-semibold text-white">Weather & Climate</h1>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs bg-white/20 border border-white/30 rounded px-2 py-1 text-white backdrop-blur-sm"
            >
              <option value="Lilongwe">Lilongwe</option>
              <option value="Blantyre">Blantyre</option>
              <option value="Mzuzu">Mzuzu</option>
              <option value="Zomba">Zomba</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-3 py-4 space-y-4">
        {/* Weather Alerts - Mobile Optimized */}
        {weatherAlerts && weatherAlerts.length > 0 && (
          <div className="space-y-2">
            {weatherAlerts.map((alert) => (
              <Card key={alert.id} className={`border-2 backdrop-blur-lg bg-white/20 border-white/30 shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-xl ${getAlertColor(alert.severity)}`}>
                <CardContent className="p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm">{alert.title}</h3>
                      <p className="text-xs mt-1 leading-tight">{alert.description}</p>
                      {alert.mitigation_advice && (
                        <p className="text-xs mt-2 font-medium leading-tight">
                          Action: {alert.mitigation_advice}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Current Weather - Mobile Optimized */}
        <Card className="backdrop-blur-lg bg-white/10 border-white/30 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 rounded-2xl overflow-hidden border-2">
          <div className="bg-gradient-to-r from-white/30 to-white/20 p-1">
            <CardHeader className="bg-gradient-to-r from-white/20 to-white/10 rounded-t-xl p-4">
              <CardTitle className="flex items-center text-white text-base">
                <Thermometer className="h-5 w-5 text-orange-400 mr-2" />
                Current Weather - {selectedDistrict}
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent className="p-4">
            {isLoadingCurrent ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="ml-3 text-white text-sm">Loading weather data...</span>
              </div>
            ) : currentWeatherError ? (
              <div className="text-center py-8">
                <p className="text-red-300 mb-2 text-sm">Failed to load weather data</p>
                <p className="text-xs text-white/70">Please check your internet connection and try again.</p>
              </div>
            ) : currentWeather ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">
                    {currentWeather.temperature}°C
                  </div>
                  <p className="text-sm text-white/90 capitalize font-medium">{currentWeather.description}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <Droplets className="h-4 w-4 text-blue-300 mr-2" />
                    <span className="text-white font-medium">Humidity: {currentWeather.humidity}%</span>
                  </div>
                  <div className="flex items-center text-sm bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <Wind className="h-4 w-4 text-gray-300 mr-2" />
                    <span className="text-white font-medium">Wind: {currentWeather.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center text-sm bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <CloudRain className="h-4 w-4 text-blue-300 mr-2" />
                    <span className="text-white font-medium">Rain chance: {currentWeather.precipitation}%</span>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 7-Day Forecast - Mobile Optimized */}
        <Card className="backdrop-blur-lg bg-white/10 border-white/30 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 rounded-2xl overflow-hidden border-2">
          <div className="bg-gradient-to-r from-white/30 to-white/20 p-1">
            <CardHeader className="bg-gradient-to-r from-white/20 to-white/10 rounded-t-xl p-4">
              <CardTitle className="flex items-center text-white text-base">
                <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                7-Day Forecast
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent className="p-4">
            {isLoadingForecast ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="ml-3 text-white text-sm">Loading forecast...</span>
              </div>
            ) : forecastError ? (
              <div className="text-center py-8">
                <p className="text-red-300 mb-2 text-sm">Failed to load forecast data</p>
                <p className="text-xs text-white/70">Please check your internet connection and try again.</p>
              </div>
            ) : weeklyForecast && weeklyForecast.length > 0 ? (
              <div className="space-y-3">
                {weeklyForecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/20 rounded-xl backdrop-blur-lg hover:bg-white/30 transition-all duration-300 border border-white/20">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getWeatherIcon(day.condition)}
                      <span className="font-semibold text-white text-sm truncate">{day.day}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="text-white/90">{day.precipitation}%</span>
                      <span className="font-bold text-white">
                        {day.high}°/{day.low}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 text-sm">No forecast data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Climate-Smart Farming Advice - Mobile Optimized */}
        <Card className="backdrop-blur-lg bg-white/10 border-white/30 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 rounded-2xl overflow-hidden border-2">
          <div className="bg-gradient-to-r from-white/30 to-white/20 p-1">
            <CardHeader className="bg-gradient-to-r from-white/20 to-white/10 rounded-t-xl p-4">
              <CardTitle className="text-white text-base">Climate-Smart Farming Tips</CardTitle>
              <CardDescription className="text-white/90 text-sm">
                Recommendations based on current weather conditions
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="p-4">
            {currentWeather ? (
              <div className="space-y-3">
                {farmingAdvice.map((advice, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/20 rounded-xl backdrop-blur-lg hover:bg-white/30 transition-all duration-300 border border-white/20">
                    {getAdviceIcon(advice.icon)}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-white text-sm">{advice.title}</h4>
                      <p className="text-sm text-white/90 mt-1 leading-tight">{advice.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 text-sm">Loading farming advice...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historical Weather Data - Mobile Optimized */}
        <Card className="backdrop-blur-lg bg-white/10 border-white/30 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 rounded-2xl overflow-hidden border-2">
          <div className="bg-gradient-to-r from-white/30 to-white/20 p-1">
            <CardHeader className="bg-gradient-to-r from-white/20 to-white/10 rounded-t-xl p-4">
              <CardTitle className="text-white text-base">Seasonal Trends</CardTitle>
              <CardDescription className="text-white/90 text-sm">
                Historical weather patterns for {selectedDistrict}
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-lg border border-white/20">
                <div className="text-3xl font-bold text-green-300 mb-2">{seasonalData.avgRainfall}mm</div>
                <p className="text-sm text-white/90">Average Annual Rainfall</p>
              </div>
              <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-lg border border-white/20">
                <div className="text-3xl font-bold text-orange-300 mb-2">{seasonalData.avgTemp}°C</div>
                <p className="text-sm text-white/90">Average Temperature</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white/20 rounded-xl backdrop-blur-lg border border-white/20">
              <p className="text-sm text-white/95 leading-tight">
                <strong>Season Outlook:</strong> {seasonalData.outlook}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default Weather;
