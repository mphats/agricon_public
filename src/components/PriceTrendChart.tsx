
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceTrendData {
  date: string;
  price: number;
}

interface PriceTrendChartProps {
  data: PriceTrendData[];
  cropType: string;
}

export const PriceTrendChart = ({ data, cropType }: PriceTrendChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No price trend data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `MWK ${value}`}
          />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number) => [`MWK ${value}`, 'Price per kg']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#16a34a" 
            strokeWidth={2}
            dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
