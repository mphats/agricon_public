
interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  precipitation: number;
  district: string;
  description: string;
  icon: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  description: string;
  icon: string;
}

const API_KEY = 'd82c1f811b5e46c2e6dae343ee21a3b3';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchCurrentWeather = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.weather || !data.main) {
      throw new Error('Weather data not found. Please check the city name.');
    }
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed * 3.6 || 0), // Convert m/s to km/h
      condition: data.weather[0].main,
      precipitation: Math.round((data.clouds?.all || 0) / 100 * 80), // Estimate from cloud coverage
      district: city,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const fetchWeatherForecast = async (city: string): Promise<ForecastDay[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.list) {
      throw new Error('Forecast data not found.');
    }
    
    // Group forecasts by day and get daily summary
    const dailyForecasts: ForecastDay[] = [];
    const processedDays = new Set<string>();
    
    const dayNames = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let dayIndex = 0;
    
    for (const item of data.list.slice(0, 35)) { // 5 days * 7 forecasts per day
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!processedDays.has(dayKey) && dayIndex < 7) {
        const dayName = dayIndex < dayNames.length ? dayNames[dayIndex] : 
          date.toLocaleDateString('en-US', { weekday: 'short' });
        
        dailyForecasts.push({
          day: dayName,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: getConditionFromIcon(item.weather[0].icon),
          precipitation: Math.round((item.clouds?.all || 0) / 100 * 80),
          description: item.weather[0].description,
          icon: item.weather[0].icon
        });
        
        processedDays.add(dayKey);
        dayIndex++;
      }
    }
    
    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

const getConditionFromIcon = (icon: string): string => {
  const iconCode = icon.substring(0, 2);
  switch (iconCode) {
    case '01': return 'sunny';
    case '02':
    case '03':
    case '04': return 'cloudy';
    case '09':
    case '10':
    case '11': return 'rainy';
    case '13': return 'snowy';
    case '50': return 'foggy';
    default: return 'sunny';
  }
};
