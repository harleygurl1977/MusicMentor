import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

interface TipCardProps {
  tip: AiTip;
  isFeatured?: boolean;
  onBookmark: () => void;
  onMarkHelpful: (helpful: boolean) => void;
  isUpdating: boolean;
}

export default function TipCard({ tip, isFeatured = false, onBookmark, onMarkHelpful, isUpdating }: TipCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vegetable garden':
      case 'vegetables':
        return '🍅';
      case 'herb garden':
      case 'herbs':
        return '🌿';
      case 'flower garden':
      case 'flowers':
        return '🌸';
      case 'pest control':
        return '🐛';
      case 'watering':
        return '💧';
      case 'soil care':
        return '🌱';
      case 'composting':
        return '♻️';
      case 'indoor plants':
        return '🪴';
      default:
        return '📚';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return format(date, 'MMM d, yyyy');
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-garden-green/10 text-garden-green',
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
    ];
    
    // Simple hash to consistently assign colors to tags
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Card 
      className={`glass-effect border-0 ${isFeatured ? 'border-l-4 border-garden-green' : ''}`}
      data-testid={`card-tip-${tip.id}`}
    >
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-garden-primary to-garden-secondary p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800" data-testid={`text-tip-title-${tip.id}`}>
                {tip.title}
              </h3>
              <div className="text-sm text-gray-500" data-testid={`text-tip-meta-${tip.id}`}>
                {formatTimeAgo(tip.createdAt)} • {tip.category}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBookmark}
            disabled={isUpdating}
            className={`p-2 ${tip.isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
            data-testid={`button-bookmark-${tip.id}`}
          >
            <svg 
              className="w-5 h-5" 
              fill={tip.isBookmarked ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </Button>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4" data-testid={`text-tip-content-${tip.id}`}>
          {tip.content}
        </p>
        
        {tip.weatherConditions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center text-sm text-blue-700">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Based on current weather conditions
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {tip.tags?.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                className={`text-xs ${getTagColor(tag)}`}
                data-testid={`badge-tag-${tag}-${tip.id}`}
              >
                {getCategoryIcon(tag)} {tag}
              </Badge>
            ))}
            {tip.tags?.length > 3 && (
              <span className="text-xs text-gray-500">+{tip.tags.length - 3} more</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkHelpful(true)}
                disabled={isUpdating}
                className={`text-sm ${tip.isHelpful === true ? 'text-garden-green' : 'text-gray-500 hover:text-garden-green'}`}
                data-testid={`button-helpful-${tip.id}`}
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                Helpful
              </Button>
              
              {tip.isHelpful === true && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkHelpful(false)}
                  disabled={isUpdating}
                  className="text-sm text-gray-400 hover:text-red-500"
                  data-testid={`button-not-helpful-${tip.id}`}
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  Not Helpful
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid={`button-share-${tip.id}`}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
