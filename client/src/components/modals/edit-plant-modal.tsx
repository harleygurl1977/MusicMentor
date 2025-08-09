import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";

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

interface EditPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: Plant | null;
}

interface PlantForm {
  name: string;
  category: string;
  variety: string;
  plantedDate: string;
  location: string;
  status: string;
  wateringFrequency: number;
  notes: string;
}

export default function EditPlantModal({ isOpen, onClose, plant }: EditPlantModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<PlantForm>({
    name: '',
    category: '',
    variety: '',
    plantedDate: new Date().toISOString().split('T')[0],
    location: 'outdoor',
    status: 'healthy',
    wateringFrequency: 3,
    notes: '',
  });

  // Populate form with plant data when plant changes
  useEffect(() => {
    if (plant) {
      setFormData({
        name: plant.name || '',
        category: plant.category || '',
        variety: plant.variety || '',
        plantedDate: plant.plantedDate ? new Date(plant.plantedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        location: plant.location || 'outdoor',
        status: plant.status || 'healthy',
        wateringFrequency: plant.wateringFrequency || 3,
        notes: plant.notes || '',
      });
    }
  }, [plant]);

  const editPlantMutation = useMutation({
    mutationFn: async (plantData: PlantForm) => {
      if (!plant) throw new Error("No plant to edit");
      const response = await apiRequest("PATCH", `/api/plants/${plant.id}`, {
        ...plantData,
        plantedDate: plantData.plantedDate ? new Date(plantData.plantedDate) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Plant updated successfully!",
      });
      handleClose();
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
        description: "Failed to update plant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    editPlantMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PlantForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!plant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] flex flex-col" data-testid="modal-edit-plant">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-800" data-testid="text-modal-title">
            Edit Plant: {plant.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update your plant's information, care schedule, and current status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-4 pb-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                Plant Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Cherry Tomatoes"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent"
                data-testid="input-plant-name"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent" data-testid="select-plant-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetable">Vegetable</SelectItem>
                  <SelectItem value="herb">Herb</SelectItem>
                  <SelectItem value="flower">Flower</SelectItem>
                  <SelectItem value="tree">Tree</SelectItem>
                  <SelectItem value="succulent">Succulent</SelectItem>
                  <SelectItem value="houseplant">Houseplant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="variety" className="text-sm font-medium text-gray-700 mb-2 block">
                Variety (Optional)
              </Label>
              <Input
                id="variety"
                placeholder="e.g., Cherokee Purple, Sweet Basil"
                value={formData.variety}
                onChange={(e) => handleInputChange('variety', e.target.value)}
                className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent"
                data-testid="input-plant-variety"
              />
            </div>

            <div>
              <Label htmlFor="plantedDate" className="text-sm font-medium text-gray-700 mb-2 block">
                Planting Date
              </Label>
              <Input
                id="plantedDate"
                type="date"
                value={formData.plantedDate}
                onChange={(e) => handleInputChange('plantedDate', e.target.value)}
                className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent"
                data-testid="input-planted-date"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                Location
              </Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent" data-testid="select-plant-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outdoor">Outdoor Garden</SelectItem>
                  <SelectItem value="indoor">Indoor Pot</SelectItem>
                  <SelectItem value="greenhouse">Greenhouse</SelectItem>
                  <SelectItem value="balcony">Balcony</SelectItem>
                  <SelectItem value="container">Container Garden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent" data-testid="select-plant-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="needs water">Needs Water</SelectItem>
                  <SelectItem value="needs care">Needs Care</SelectItem>
                  <SelectItem value="dormant">Dormant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="wateringFrequency" className="text-sm font-medium text-gray-700 mb-2 block">
                Watering Frequency (days)
              </Label>
              <Select 
                value={formData.wateringFrequency.toString()} 
                onValueChange={(value) => handleInputChange('wateringFrequency', parseInt(value))}
              >
                <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent" data-testid="select-watering-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Daily</SelectItem>
                  <SelectItem value="2">Every 2 days</SelectItem>
                  <SelectItem value="3">Every 3 days</SelectItem>
                  <SelectItem value="7">Weekly</SelectItem>
                  <SelectItem value="14">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special care instructions or observations..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="border-gray-200 focus:ring-2 focus:ring-garden-green focus:border-transparent"
                rows={3}
                data-testid="textarea-plant-notes"
              />
            </div>

            <div className="flex space-x-4 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-garden-green to-garden-green-dark hover:shadow-lg transition-all duration-300"
                disabled={editPlantMutation.isPending}
                data-testid="button-save-plant"
              >
                {editPlantMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}