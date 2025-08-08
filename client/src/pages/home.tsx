import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface UserStats {
  totalPlants: number;
  needWater: number;
  careReminders: number;
  aiTipsThisWeek: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  recommendations: {
    watering: string;
    planting: string;
    general: string;
  };
}

interface AiTip {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: weather, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather", user?.location || "New York"],
    enabled: isAuthenticated && !!user?.location,
  });

  const { data: recentTip, isLoading: tipLoading } = useQuery<AiTip[]>({
    queryKey: ["/api/ai-tips"],
    enabled: isAuthenticated,
    select: (data) => data.slice(0, 1), // Get the most recent tip
  });

  const generateTipMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai-tips/generate", {
        category: "General Gardening",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-tips"] });
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

  if (isLoading) {
    return <div className="min-h-screen garden-gradient-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garden-green"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen garden-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <Card className="glass-effect border-0 shadow-xl mb-8" data-testid="card-welcome">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2" data-testid="text-greeting">
                  {greeting()}, {user?.firstName || 'Gardener'}! 🌱
                </h2>
                <p className="text-gray-600">Here's what's happening in your garden today</p>
              </div>
              <div className="mt-4 md:mt-0">
                {weatherLoading ? (
                  <Skeleton className="h-24 w-48" />
                ) : weather ? (
                  <div className="bg-gradient-to-r from-garden-primary to-garden-secondary text-white px-6 py-3 rounded-xl">
                    <div className="text-sm opacity-90">Today's Weather</div>
                    <div className="text-xl font-semibold" data-testid="text-temperature">
                      {weather.temperature}°F
                    </div>
                    <div className="text-sm" data-testid="text-weather-condition">
                      {weather.description}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 px-6 py-3 rounded-xl">
                    <div className="text-sm text-gray-600">Weather unavailable</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="glass-effect border-0">
                <CardContent className="p-6 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="glass-effect border-0" data-testid="card-total-plants">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-garden-green" data-testid="text-total-plants">
                    {stats?.totalPlants || 0}
                  </div>
                  <div className="text-gray-600">Total Plants</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-0" data-testid="card-need-water">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-500" data-testid="text-need-water">
                    {stats?.needWater || 0}
                  </div>
                  <div className="text-gray-600">Need Water</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-0" data-testid="card-care-reminders">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-500" data-testid="text-care-reminders">
                    {stats?.careReminders || 0}
                  </div>
                  <div className="text-gray-600">Care Reminders</div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-0" data-testid="card-ai-tips">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-500" data-testid="text-ai-tips">
                    {stats?.aiTipsThisWeek || 0}
                  </div>
                  <div className="text-gray-600">AI Tips This Week</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Daily AI Tip */}
        <Card className="glass-effect border-0 shadow-xl mb-8" data-testid="card-daily-tip">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-garden-primary to-garden-secondary p-3 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Today's AI Gardening Tip</h3>
                <div className="text-sm text-gray-500">Personalized for your garden</div>
              </div>
            </div>
            
            {tipLoading ? (
              <div className="bg-gradient-to-r from-garden-green to-garden-green-dark p-6 rounded-xl">
                <Skeleton className="h-20 w-full mb-4 bg-white/20" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 bg-white/20" />
                  <Skeleton className="h-8 w-24 bg-white/20" />
                </div>
              </div>
            ) : recentTip && recentTip[0] ? (
              <div className="bg-gradient-to-r from-garden-green to-garden-green-dark text-white p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-2" data-testid="text-tip-title">
                  {recentTip[0].title}
                </h4>
                <p className="text-base leading-relaxed mb-4" data-testid="text-tip-content">
                  {recentTip[0].content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-90" data-testid="text-tip-category">
                    📚 {recentTip[0].category}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => generateTipMutation.mutate()}
                    disabled={generateTipMutation.isPending}
                    data-testid="button-generate-tip"
                  >
                    {generateTipMutation.isPending ? "Generating..." : "Get Another Tip"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-garden-green to-garden-green-dark text-white p-6 rounded-xl">
                <p className="text-lg leading-relaxed mb-4">
                  Welcome to GardenAI! Generate your first personalized gardening tip to get started.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-90">🌱 Ready to grow smarter?</div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => generateTipMutation.mutate()}
                    disabled={generateTipMutation.isPending}
                    data-testid="button-generate-first-tip"
                  >
                    {generateTipMutation.isPending ? "Generating..." : "Generate First Tip"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Weather Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="glass-effect border-0" data-testid="card-quick-actions">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost"
                  className="w-full justify-between p-4 bg-garden-green/10 hover:bg-garden-green/20 h-auto"
                  onClick={() => window.location.href = "/plants"}
                  data-testid="button-add-plant"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-garden-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add New Plant</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                
                <Button 
                  variant="ghost"
                  className="w-full justify-between p-4 bg-blue-50 hover:bg-blue-100 h-auto"
                  onClick={() => window.location.href = "/plants"}
                  data-testid="button-log-watering"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Log Watering</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                
                <Button 
                  variant="ghost"
                  className="w-full justify-between p-4 bg-purple-50 hover:bg-purple-100 h-auto"
                  onClick={() => window.location.href = "/ai-tips"}
                  data-testid="button-generate-ai-tip"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span>Generate AI Tip</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weather Recommendations */}
          <Card className="glass-effect border-0" data-testid="card-weather-recommendations">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Weather-Based Tips</h3>
              {weatherLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : weather?.recommendations ? (
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Watering</div>
                      <div className="text-sm text-gray-500" data-testid="text-watering-recommendation">
                        {weather.recommendations.watering}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-garden-green/10 rounded-lg">
                    <div className="w-10 h-10 bg-garden-green rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Planting</div>
                      <div className="text-sm text-gray-500" data-testid="text-planting-recommendation">
                        {weather.recommendations.planting}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">General</div>
                      <div className="text-sm text-gray-500" data-testid="text-general-recommendation">
                        {weather.recommendations.general}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Weather recommendations will appear here once location data is available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
