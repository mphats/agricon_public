
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Users, MessageCircle, Plus, Search, ThumbsUp, CheckCircle, Calendar } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { useToast } from '@/hooks/use-toast';
import { CommunityStats } from '@/components/CommunityStats';
import type { Database } from '@/integrations/supabase/types';

type CropType = Database['public']['Enums']['crop_type'];

const Forum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<CropType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch forum questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ['forum-questions', searchTerm, selectedCrop],
    queryFn: async () => {
      console.log('Fetching forum questions...');
      let query = supabase
        .from('forum_questions')
        .select(`
          *,
          profiles(first_name, last_name, role)
        `)
        .order('created_at', { ascending: false });

      if (selectedCrop && selectedCrop !== 'all') {
        query = query.eq('crop_type', selectedCrop as CropType);
      }

      const { data, error } = await query.limit(20);
      if (error) {
        console.error('Error fetching forum questions:', error);
        throw error;
      }
      console.log('Forum questions fetched:', data);
      return data || [];
    },
  });

  // Fetch answer counts for questions
  const { data: answerCounts } = useQuery({
    queryKey: ['forum-answer-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_answers')
        .select('question_id');
      
      if (error) {
        console.error('Error fetching answer counts:', error);
        return {};
      }

      const counts = {};
      data?.forEach(answer => {
        counts[answer.question_id] = (counts[answer.question_id] || 0) + 1;
      });
      
      return counts;
    },
  });

  // Create new question mutation
  const createQuestion = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      crop_type?: CropType;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('forum_questions')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          crop_type: data.crop_type || null,
          tags: data.crop_type ? [data.crop_type] : []
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Question Posted",
        description: "Your question has been posted successfully.",
      });
      setQuestionTitle('');
      setQuestionContent('');
      setSelectedCrop('all');
      setShowNewQuestion(false);
      queryClient.invalidateQueries({ queryKey: ['forum-questions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive",
      });
      console.error('Question creation error:', error);
    },
  });

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and description for your question.",
        variant: "destructive",
      });
      return;
    }

    createQuestion.mutate({
      title: questionTitle,
      content: questionContent,
      crop_type: selectedCrop !== 'all' ? selectedCrop as CropType : undefined,
    });
  };

  const filteredQuestions = questions?.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'advisor': return 'text-green-700 bg-green-100';
      case 'admin': return 'text-purple-700 bg-purple-100';
      case 'buyer': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Calculate community stats
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => q.is_answered).length || 0;
  const totalMembers = 150; // Mock data
  const activeToday = 23; // Mock data

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-purple-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Community Forum</h1>
            </div>
            <Button
              onClick={() => setShowNewQuestion(!showNewQuestion)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ask
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Community Stats */}
        <CommunityStats
          totalMembers={totalMembers}
          totalQuestions={totalQuestions}
          answeredQuestions={answeredQuestions}
          activeToday={activeToday}
        />

        {/* New Question Form */}
        {showNewQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>
                Get help from fellow farmers and agricultural experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Title
                  </label>
                  <Input
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="What's your question about?"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Crop (Optional)
                  </label>
                  <Select value={selectedCrop} onValueChange={(value: CropType | 'all') => setSelectedCrop(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop if relevant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="maize">Maize</SelectItem>
                      <SelectItem value="beans">Beans</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="cassava">Cassava</SelectItem>
                      <SelectItem value="groundnuts">Groundnuts</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="tobacco">Tobacco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <Textarea
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    placeholder="Provide more details about your question..."
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={createQuestion.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {createQuestion.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </div>
                    ) : (
                      'Post Question'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewQuestion(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCrop} onValueChange={(value: CropType | 'all') => setSelectedCrop(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Crops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  <SelectItem value="maize">Maize</SelectItem>
                  <SelectItem value="beans">Beans</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="cassava">Cassava</SelectItem>
                  <SelectItem value="groundnuts">Groundnuts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <Card key={question.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {question.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
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
                            {answerCounts?.[question.id] || 0}
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No questions found</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm || (selectedCrop && selectedCrop !== 'all')
                        ? "Try adjusting your search filters"
                        : "Be the first to ask a question!"
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Educational Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Resources</CardTitle>
            <CardDescription>
              Educational content and expert guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Maize Growing Guide</h4>
                <p className="text-sm text-green-700">Complete guide from planting to harvest</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Pest Management</h4>
                <p className="text-sm text-blue-700">Integrated pest management strategies</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900">Market Readiness</h4>
                <p className="text-sm text-orange-700">Preparing crops for market sale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default Forum;
