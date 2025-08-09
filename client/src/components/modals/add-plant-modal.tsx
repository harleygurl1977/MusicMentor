import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlantForm {
  name: string;
  category: string;
  variety: string;
  plantedDate: string;
  location: string;
  wateringFrequency: number;
  notes: string;
}

export default function AddPlantModal({ isOpen, onClose }: AddPlantModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<PlantForm>({
    name: '',
    category: '',
    variety: '',
    plantedDate: new Date().toISOString().split('T')[0],
    location: 'outdoor',
    wateringFrequency: 3,
    notes: '',
  });

  const addPlantMutation = useMutation({
    mutationFn: async (plantData: PlantForm) => {
      const response = await apiRequest("POST", "/api/plants", {
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
        description: "Plant added successfully!",
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
        description: "Failed to add plant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      variety: '',
      plantedDate: new Date().toISOString().split('T')[0],
      location: 'outdoor',
      wateringFrequency: 3,
      notes: '',
    });
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
    addPlantMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PlantForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-add-plant">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800" data-testid="text-modal-title">
            Add New Plant
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
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

          <div className="flex space-x-4 pt-4">
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
              disabled={addPlantMutation.isPending}
              data-testid="button-add-plant"
            >
              {addPlantMutation.isPending ? "Adding..." : "Add Plant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
