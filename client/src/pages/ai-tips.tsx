import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import TipCard from "@/components/tip-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface AiTip {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  isBookmarked: boolean;
  isHelpful?: boolean;
  weatherConditions?: string;
  createdAt: string;
}

export default function AiTips() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [categoryFilter, setCategoryFilter] = useState("General Gardening");
  const [seasonFilter, setSeasonFilter] = useState("Current Season");
  const [skillFilter, setSkillFilter] = useState("All Skill Levels");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: tips, isLoading: tipsLoading } = useQuery<AiTip[]>({
    queryKey: ["/api/ai-tips"],
    enabled: isAuthenticated,
  });

  const generateTipMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai-tips/generate", {
        category: categoryFilter,
        season: seasonFilter,
        skillLevel: skillFilter,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-tips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "New gardening tip generated!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate tip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bookmarkTipMutation = useMutation({
    mutationFn: async ({ tipId, bookmark }: { tipId: string; bookmark: boolean }) => {
      const response = await apiRequest("PUT", `/api/ai-tips/${tipId}/bookmark`, { bookmark });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-tips"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async ({ tipId, helpful }: { tipId: string; helpful: boolean }) => {
      const response = await apiRequest("PUT", `/api/ai-tips/${tipId}/helpful`, { helpful });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-tips"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to mark as helpful. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen garden-gradient-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garden-green"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleBookmark = (tipId: string, currentBookmark: boolean) => {
    bookmarkTipMutation.mutate({ tipId, bookmark: !currentBookmark });
  };

  const handleMarkHelpful = (tipId: string, helpful: boolean) => {
    markHelpfulMutation.mutate({ tipId, helpful });
  };

  return (
    <div className="min-h-screen garden-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-effect border-0 shadow-xl mb-8" data-testid="card-ai-tips-header">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2" data-testid="text-page-title">
                  AI Gardening Tips
                </h2>
                <p className="text-gray-600">Personalized advice powered by artificial intelligence</p>
              </div>
              <Button
                className="bg-gradient-to-r from-garden-primary to-garden-secondary text-white hover:shadow-lg transition-all duration-300"
                onClick={() => generateTipMutation.mutate()}
                disabled={generateTipMutation.isPending}
                data-testid="button-generate-tip"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                {generateTipMutation.isPending ? "Generating..." : "Generate New Tip"}
              </Button>
            </div>

            {/* Tip Generation Form */}
            <div className="bg-gray-50 rounded-xl p-6" data-testid="card-tip-customization">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customize Your Tip</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Gardening">General Gardening</SelectItem>
                    <SelectItem value="Vegetable Garden">Vegetable Garden</SelectItem>
                    <SelectItem value="Herb Garden">Herb Garden</SelectItem>
                    <SelectItem value="Flower Garden">Flower Garden</SelectItem>
                    <SelectItem value="Indoor Plants">Indoor Plants</SelectItem>
                    <SelectItem value="Pest Control">Pest Control</SelectItem>
                    <SelectItem value="Soil Care">Soil Care</SelectItem>
                    <SelectItem value="Composting">Composting</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent" data-testid="select-season">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current Season">Current Season</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent" data-testid="select-skill-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Skill Levels">All Skill Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips History */}
        <div className="space-y-6">
          {tipsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="glass-effect border-0">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="w-6 h-6" />
                  </div>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : tips?.length === 0 ? (
            <Card className="glass-effect border-0" data-testid="card-empty-tips">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-garden-primary to-garden-secondary rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No AI tips yet</h3>
                <p className="text-gray-600 mb-6">
                  Generate your first personalized gardening tip to get started with AI-powered advice!
                </p>
                <Button
                  className="bg-gradient-to-r from-garden-primary to-garden-secondary text-white"
                  onClick={() => generateTipMutation.mutate()}
                  disabled={generateTipMutation.isPending}
                  data-testid="button-generate-first-tip"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  {generateTipMutation.isPending ? "Generating..." : "Generate Your First Tip"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="tips-list">
              {tips?.map((tip, index) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  isFeatured={index === 0}
                  onBookmark={() => handleBookmark(tip.id, tip.isBookmarked)}
                  onMarkHelpful={(helpful) => handleMarkHelpful(tip.id, helpful)}
                  isUpdating={bookmarkTipMutation.isPending || markHelpfulMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
