import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Plant {
  id: string;
  name: string;
  category: string;
  variety?: string;
  plantedDate: string;
  location: string;
  status: string;
  notes?: string;
  imageUrl?: string;
  wateringFrequency: number;
  lastWatered?: string;
  nextWatering?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlantCardProps {
  plant: Plant;
  onWater: () => void;
  isWatering: boolean;
  onEdit?: () => void;
}

export default function PlantCard({ plant, onWater, isWatering, onEdit }: PlantCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'needs water':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs care':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = plant.nextWatering && new Date(plant.nextWatering) < new Date();
  const daysSincePlanted = plant.plantedDate 
    ? Math.floor((Date.now() - new Date(plant.plantedDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getPlantImage = () => {
    if (plant.imageUrl) return plant.imageUrl;
    
    // Default images based on category
    const defaultImages = {
      vegetable: "https://images.unsplash.com/photo-1592927062191-1c4ef9516988?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
      herb: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
      flower: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
      tree: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&w=400&h=200&fit=crop",
    };
    
    return defaultImages[plant.category.toLowerCase() as keyof typeof defaultImages] || defaultImages.vegetable;
  };

  return (
    <Card className="glass-effect plant-card-hover border-0 overflow-hidden" data-testid={`card-plant-${plant.id}`}>
      <div className="relative">
        <img 
          src={getPlantImage()} 
          alt={plant.name}
          className="w-full h-48 object-cover"
          data-testid={`img-plant-${plant.id}`}
        />
        <Badge 
          className={`absolute top-3 right-3 ${getStatusColor(plant.status)}`}
          data-testid={`badge-status-${plant.id}`}
        >
          {plant.status}
        </Badge>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-800" data-testid={`text-plant-name-${plant.id}`}>
              {plant.name}
            </h3>
            {plant.variety && (
              <p className="text-sm text-gray-500" data-testid={`text-plant-variety-${plant.id}`}>
                {plant.variety}
              </p>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4" data-testid={`text-plant-info-${plant.id}`}>
          {plant.plantedDate && `Planted ${daysSincePlanted} days ago • `}
          {plant.category}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Watered:</span>
            <span className={`font-medium ${isOverdue ? 'text-red-500' : ''}`} data-testid={`text-last-watered-${plant.id}`}>
              {plant.lastWatered 
                ? format(new Date(plant.lastWatered), 'MMM d')
                : 'Never'
              }
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Next Care:</span>
            <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-garden-green'}`} data-testid={`text-next-care-${plant.id}`}>
              {plant.nextWatering 
                ? isOverdue 
                  ? 'Overdue'
                  : format(new Date(plant.nextWatering), 'MMM d')
                : 'Not scheduled'
              }
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            className={`flex-1 ${isOverdue ? 'bg-red-500 hover:bg-red-600' : 'bg-garden-green hover:bg-garden-green-dark'} text-white`}
            onClick={onWater}
            disabled={isWatering}
            data-testid={`button-water-${plant.id}`}
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {isWatering ? "Watering..." : isOverdue ? "Water Now" : "Water"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="px-3 border-gray-200 hover:bg-gray-50"
            onClick={onEdit}
            data-testid={`button-edit-${plant.id}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="px-3 border-gray-200 hover:bg-gray-50"
            data-testid={`button-view-${plant.id}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
