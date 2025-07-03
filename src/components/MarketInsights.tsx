
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';

interface MarketInsight {
  type: 'increase' | 'decrease' | 'stable' | 'alert';
  title: string;
  description: string;
  percentage?: number;
}

interface MarketInsightsProps {
  insights: MarketInsight[];
}

export const MarketInsights = ({ insights }: MarketInsightsProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'increase': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'increase': return 'bg-green-50 border-green-200';
      case 'decrease': return 'bg-red-50 border-red-200';
      case 'alert': return 'bg-orange-50 border-orange-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Market Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-2">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                  {insight.percentage && (
                    <p className="text-xs font-medium mt-1">
                      {insight.percentage > 0 ? '+' : ''}{insight.percentage}% from last week
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
