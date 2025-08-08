import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";

interface CareEvent {
  id: string;
  plantId: string;
  eventType: string;
  eventDate: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

interface Plant {
  id: string;
  name: string;
  category: string;
}

export default function Calendar() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const { data: careEvents, isLoading: eventsLoading } = useQuery<CareEvent[]>({
    queryKey: ["/api/care-events"],
    enabled: isAuthenticated,
  });

  const { data: upcomingEvents, isLoading: upcomingLoading } = useQuery<CareEvent[]>({
    queryKey: ["/api/care-events/upcoming"],
    enabled: isAuthenticated,
  });

  const completeCareEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("PUT", `/api/care-events/${eventId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/care-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/care-events/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Care task marked as completed!",
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
        description: "Failed to complete task. Please try again.",
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days to start from Sunday
  const startDate = new Date(monthStart);
  const dayOfWeek = startDate.getDay();
  for (let i = 0; i < dayOfWeek; i++) {
    const paddingDay = new Date(startDate);
    paddingDay.setDate(startDate.getDate() - (dayOfWeek - i));
    calendarDays.unshift(paddingDay);
  }

  // Add padding days to end on Saturday
  const endDate = new Date(monthEnd);
  const endDayOfWeek = endDate.getDay();
  for (let i = endDayOfWeek + 1; i < 7; i++) {
    const paddingDay = new Date(endDate);
    paddingDay.setDate(endDate.getDate() + (i - endDayOfWeek));
    calendarDays.push(paddingDay);
  }

  const getEventsForDay = (day: Date) => {
    return careEvents?.filter(event => 
      isSameDay(new Date(event.eventDate), day)
    ) || [];
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'watering':
        return 'bg-blue-100 text-blue-800';
      case 'fertilizing':
        return 'bg-garden-green/20 text-garden-green';
      case 'pruning':
        return 'bg-purple-100 text-purple-800';
      case 'repotting':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'watering':
        return '💧';
      case 'fertilizing':
        return '🌿';
      case 'pruning':
        return '✂️';
      case 'repotting':
        return '🪴';
      default:
        return '📋';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.charAt(0).toUpperCase() + eventType.slice(1);
  };

  const isOverdue = (eventDate: string) => {
    return new Date(eventDate) < new Date() && !isToday(new Date(eventDate));
  };

  return (
    <div className="min-h-screen garden-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-effect border-0 shadow-xl mb-8" data-testid="card-calendar-header">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6" data-testid="text-page-title">
              Garden Care Calendar
            </h2>
            
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="button-prev-month"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                <h3 className="text-2xl font-semibold text-gray-800" data-testid="text-current-month">
                  {format(currentDate, 'MMMM yyyy')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="button-next-month"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="bg-garden-green text-white hover:bg-garden-green-dark transition-colors"
                  data-testid="button-today"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 hover:bg-gray-50 transition-colors"
                  data-testid="button-month-view"
                >
                  Month
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2" data-testid="calendar-grid">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isDayToday = isToday(day);
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                      isDayToday 
                        ? 'bg-garden-green/10 hover:bg-garden-green/20 border-garden-green' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedDate(day)}
                    data-testid={`calendar-day-${day.getDate()}`}
                  >
                    <div className={`font-medium text-sm mb-1 ${
                      isDayToday 
                        ? 'font-bold text-garden-green' 
                        : isCurrentMonth 
                          ? 'text-gray-800' 
                          : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded mt-1 truncate ${getEventTypeColor(event.eventType)}`}
                        title={`${formatEventType(event.eventType)} - ${event.notes || 'No notes'}`}
                        data-testid={`event-${event.id}`}
                      >
                        {getEventIcon(event.eventType)} {formatEventType(event.eventType)}
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="glass-effect border-0" data-testid="card-upcoming-tasks">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tasks</h3>
            
            {upcomingLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : upcomingEvents?.length === 0 ? (
              <div className="text-center py-8 text-gray-500" data-testid="empty-upcoming-tasks">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <p>No upcoming care tasks scheduled</p>
                <p className="text-sm">Tasks will appear here as you add plants and schedule care activities.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents?.map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isOverdue(event.eventDate) 
                        ? 'bg-red-50 border border-red-200' 
                        : getEventTypeColor(event.eventType).includes('blue')
                          ? 'bg-blue-50'
                          : getEventTypeColor(event.eventType).includes('green')
                            ? 'bg-garden-green/10'
                            : 'bg-purple-50'
                    }`}
                    data-testid={`upcoming-task-${event.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        isOverdue(event.eventDate) 
                          ? 'bg-red-500' 
                          : getEventTypeColor(event.eventType).includes('blue')
                            ? 'bg-blue-500'
                            : getEventTypeColor(event.eventType).includes('green')
                              ? 'bg-garden-green'
                              : 'bg-purple-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-800" data-testid={`task-name-${event.id}`}>
                          {getEventIcon(event.eventType)} {formatEventType(event.eventType)}
                        </div>
                        <div className={`text-sm ${
                          isOverdue(event.eventDate) ? 'text-red-600' : 'text-gray-500'
                        }`} data-testid={`task-date-${event.id}`}>
                          {isOverdue(event.eventDate) 
                            ? `Overdue • ${format(new Date(event.eventDate), 'MMM d')}`
                            : format(new Date(event.eventDate), 'MMM d • EEEE')
                          }
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => completeCareEventMutation.mutate(event.id)}
                      disabled={completeCareEventMutation.isPending}
                      className={`text-sm font-medium hover:underline ${
                        isOverdue(event.eventDate) 
                          ? 'text-red-600 hover:text-red-700' 
                          : getEventTypeColor(event.eventType).includes('blue')
                            ? 'text-blue-500 hover:text-blue-600'
                            : getEventTypeColor(event.eventType).includes('green')
                              ? 'text-garden-green hover:text-garden-green-dark'
                              : 'text-purple-500 hover:text-purple-600'
                      }`}
                      data-testid={`button-complete-${event.id}`}
                    >
                      {completeCareEventMutation.isPending ? "Marking..." : "Mark Done"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
