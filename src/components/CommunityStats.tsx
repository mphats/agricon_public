
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, TrendingUp, Award } from 'lucide-react';

interface CommunityStatsProps {
  totalMembers: number;
  totalQuestions: number;
  answeredQuestions: number;
  activeToday: number;
}

export const CommunityStats = ({ 
  totalMembers, 
  totalQuestions, 
  answeredQuestions, 
  activeToday 
}: CommunityStatsProps) => {
  const answerRate = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
          <p className="text-xs text-gray-600">Community Members</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
          <p className="text-xs text-gray-600">Questions Asked</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{answerRate}%</div>
          <p className="text-xs text-gray-600">Answer Rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">{activeToday}</div>
          <p className="text-xs text-gray-600">Active Today</p>
        </CardContent>
      </Card>
    </div>
  );
};
