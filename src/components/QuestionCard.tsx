
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, Calendar, User, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

interface Question {
  id: string;
  title: string;
  content: string;
  crop_type?: string;
  is_answered: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    role: string;
  };
  forum_answers?: Array<{ count: number }>;
}

interface QuestionCardProps {
  question: Question;
  onViewDetails: (questionId: string) => void;
}

export const QuestionCard = ({ question, onViewDetails }: QuestionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'advisor': return 'text-green-700 bg-green-100';
      case 'admin': return 'text-purple-700 bg-purple-100';
      case 'buyer': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const answerCount = question.forum_answers?.[0]?.count || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                onClick={() => setIsExpanded(!isExpanded)}>
              {question.title}
            </h3>
            <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {question.content}
            </p>
          </div>
          {question.is_answered && (
            <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(question.created_at).toLocaleDateString()}
            </div>
            
            {question.profiles && (
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">
                  {question.profiles.first_name} {question.profiles.last_name}
                </span>
                {question.profiles.role !== 'farmer' && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(question.profiles.role)}`}>
                    {question.profiles.role}
                  </span>
                )}
              </div>
            )}

            {question.crop_type && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">
                {question.crop_type}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center text-gray-500">
              <MessageCircle className="h-3 w-3 mr-1" />
              {answerCount}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(question.id)}
            >
              View
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful
              </Button>
              <Button variant="outline" size="sm">
                Answer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
