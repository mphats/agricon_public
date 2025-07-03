
interface FarmingAdvice {
  title: string;
  content: string;
  icon: string;
}

interface SeasonalData {
  avgRainfall: number;
  avgTemp: number;
  outlook: string;
}

export const generateFarmingAdvice = (temperature: number, humidity: number, condition: string, precipitation: number): FarmingAdvice[] => {
  const advice: FarmingAdvice[] = [];

  // Temperature-based advice
  if (temperature > 30) {
    advice.push({
      title: "Heat Stress Management",
      content: "High temperatures detected. Increase irrigation frequency and consider shade nets for sensitive crops. Plant heat-resistant varieties.",
      icon: "thermometer"
    });
  } else if (temperature < 15) {
    advice.push({
      title: "Cold Protection",
      content: "Cool weather ahead. Protect young plants with mulching and consider frost protection measures for sensitive crops.",
      icon: "thermometer"
    });
  } else {
    advice.push({
      title: "Optimal Growing Conditions",
      content: "Temperature is ideal for most crops. Good time for planting and transplanting activities.",
      icon: "thermometer"
    });
  }

  // Humidity and precipitation-based advice
  if (humidity > 80 && precipitation > 60) {
    advice.push({
      title: "Disease Prevention",
      content: "High humidity and rain expected. Apply preventive fungicides and ensure good drainage to prevent root rot and fungal diseases.",
      icon: "cloud-rain"
    });
  } else if (humidity < 40 && precipitation < 20) {
    advice.push({
      title: "Drought Management",
      content: "Low humidity and minimal rain expected. Increase irrigation, apply mulch to retain soil moisture, and consider drought-resistant varieties.",
      icon: "sun"
    });
  } else if (precipitation > 70) {
    advice.push({
      title: "Water Management",
      content: "Heavy rains expected. Ensure proper drainage systems and delay fertilizer application to prevent nutrient runoff.",
      icon: "cloud-rain"
    });
  }

  // Condition-specific advice
  if (condition === 'rainy' || condition === 'Rain') {
    advice.push({
      title: "Rainy Season Activities",
      content: "Perfect time for land preparation and planting rain-fed crops like maize and beans. Avoid field operations during heavy rains.",
      icon: "cloud-rain"
    });
  } else if (condition === 'sunny' || condition === 'Clear') {
    advice.push({
      title: "Sunny Weather Advantage",
      content: "Excellent conditions for field work, harvesting, and drying activities. Good time for pesticide and fertilizer application.",
      icon: "sun"
    });
  }

  // If we have less than 3 pieces of advice, add general advice
  if (advice.length < 3) {
    advice.push({
      title: "Soil Health",
      content: "Monitor soil moisture levels regularly and maintain organic matter through composting and crop rotation practices.",
      icon: "wind"
    });
  }

  return advice.slice(0, 3); // Return max 3 pieces of advice
};

export const getSeasonalData = (city: string): SeasonalData => {
  // Seasonal data for major Malawian cities
  const seasonalDatabase: Record<string, SeasonalData> = {
    'Lilongwe': {
      avgRainfall: 850,
      avgTemp: 26,
      outlook: "La Niña conditions may bring above-normal rainfall this season. Consider drought-resistant varieties as backup and ensure proper drainage systems."
    },
    'Blantyre': {
      avgRainfall: 1200,
      avgTemp: 28,
      outlook: "Higher rainfall expected due to southern location. Excellent for tobacco and tea cultivation. Monitor for excess moisture diseases."
    },
    'Mzuzu': {
      avgRainfall: 1400,
      avgTemp: 24,
      outlook: "Cooler temperatures and higher rainfall ideal for coffee and temperate crops. Watch for frost in higher elevations."
    },
    'Zomba': {
      avgRainfall: 950,
      avgTemp: 25,
      outlook: "Moderate rainfall with good distribution. Suitable for diverse crop production including cereals and legumes."
    }
  };

  return seasonalDatabase[city] || seasonalDatabase['Lilongwe'];
};
