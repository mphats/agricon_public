
interface MarketPrice {
  id: string;
  crop_type: string;
  price_per_kg: number;
  date_recorded: string;
  district: string;
}

export const generateMarketInsights = (prices: MarketPrice[]) => {
  if (!prices || prices.length === 0) return [];

  const insights = [];
  const cropGroups = prices.reduce((acc, price) => {
    if (!acc[price.crop_type]) acc[price.crop_type] = [];
    acc[price.crop_type].push(price);
    return acc;
  }, {} as Record<string, MarketPrice[]>);

  // Price trend insights
  Object.entries(cropGroups).forEach(([crop, cropPrices]) => {
    if (cropPrices.length >= 2) {
      const sortedPrices = cropPrices.sort((a, b) => 
        new Date(b.date_recorded).getTime() - new Date(a.date_recorded).getTime()
      );
      const latest = sortedPrices[0];
      const previous = sortedPrices[1];
      
      const percentChange = ((latest.price_per_kg - previous.price_per_kg) / previous.price_per_kg) * 100;
      
      if (Math.abs(percentChange) > 5) {
        insights.push({
          type: percentChange > 0 ? 'increase' : 'decrease',
          title: `${crop.charAt(0).toUpperCase() + crop.slice(1)} Price ${percentChange > 0 ? 'Increase' : 'Decrease'}`,
          description: `Prices have ${percentChange > 0 ? 'risen' : 'fallen'} significantly in recent days. Consider ${percentChange > 0 ? 'selling now' : 'holding or buying'}.`,
          percentage: Math.round(percentChange)
        });
      }
    }
  });

  // Seasonal insights
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 3 && currentMonth <= 5) { // April-June (harvest season)
    insights.push({
      type: 'alert',
      title: 'Harvest Season Impact',
      description: 'Prices typically drop during harvest season due to increased supply. Plan your sales accordingly.'
    });
  } else if (currentMonth >= 10 || currentMonth <= 1) { // Nov-Feb (planting season)
    insights.push({
      type: 'increase',
      title: 'Pre-Planting Season',
      description: 'Demand for quality seeds and inputs is high. Good time to sell stored produce.'
    });
  }

  // District price variations
  const districtPrices = prices.reduce((acc, price) => {
    const key = `${price.crop_type}-${price.district}`;
    if (!acc[key] || new Date(price.date_recorded) > new Date(acc[key].date_recorded)) {
      acc[key] = price;
    }
    return acc;
  }, {} as Record<string, MarketPrice>);

  const cropDistrictGroups = Object.values(districtPrices).reduce((acc, price) => {
    if (!acc[price.crop_type]) acc[price.crop_type] = [];
    acc[price.crop_type].push(price);
    return acc;
  }, {} as Record<string, MarketPrice[]>);

  Object.entries(cropDistrictGroups).forEach(([crop, districtPrices]) => {
    if (districtPrices.length > 1) {
      const sortedByPrice = districtPrices.sort((a, b) => b.price_per_kg - a.price_per_kg);
      const highest = sortedByPrice[0];
      const lowest = sortedByPrice[sortedByPrice.length - 1];
      
      if ((highest.price_per_kg - lowest.price_per_kg) / lowest.price_per_kg > 0.15) {
        insights.push({
          type: 'alert',
          title: `Price Variation in ${crop.charAt(0).toUpperCase() + crop.slice(1)}`,
          description: `Significant price differences between districts. ${highest.district} offers the best prices.`
        });
      }
    }
  });

  return insights.slice(0, 4); // Limit to 4 insights
};

export const generatePriceTrendData = (prices: MarketPrice[], cropType: string) => {
  const cropPrices = prices
    .filter(price => price.crop_type === cropType)
    .sort((a, b) => new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime())
    .slice(-30); // Last 30 data points

  return cropPrices.map(price => ({
    date: price.date_recorded,
    price: price.price_per_kg
  }));
};
