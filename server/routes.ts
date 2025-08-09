import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateGardeningTip, analyzePlantHealth } from "./services/openai";
import { getWeatherData, getGardeningRecommendations } from "./services/weather";
import { z } from "zod";
import { insertPlantSchema, insertCareEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Plants routes
  app.get('/api/plants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plants = await storage.getPlants(userId);
      res.json(plants);
    } catch (error) {
      console.error("Error fetching plants:", error);
      res.status(500).json({ message: "Failed to fetch plants" });
    }
  });

  app.get('/api/plants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plant = await storage.getPlant(req.params.id, userId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(plant);
    } catch (error) {
      console.error("Error fetching plant:", error);
      res.status(500).json({ message: "Failed to fetch plant" });
    }
  });

  app.post('/api/plants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plantData = insertPlantSchema.parse({ ...req.body, userId });
      const plant = await storage.createPlant(plantData);
      res.status(201).json(plant);
    } catch (error) {
      console.error("Error creating plant:", error);
      res.status(400).json({ message: "Failed to create plant" });
    }
  });

  app.put('/api/plants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertPlantSchema.partial().parse(req.body);
      const plant = await storage.updatePlant(req.params.id, updates, userId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(plant);
    } catch (error) {
      console.error("Error updating plant:", error);
      res.status(400).json({ message: "Failed to update plant" });
    }
  });

  app.patch('/api/plants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertPlantSchema.partial().parse(req.body);
      const plant = await storage.updatePlant(req.params.id, updates, userId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(plant);
    } catch (error) {
      console.error("Error updating plant:", error);
      res.status(400).json({ message: "Failed to update plant" });
    }
  });

  app.delete('/api/plants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deletePlant(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting plant:", error);
      res.status(500).json({ message: "Failed to delete plant" });
    }
  });

  // Water plant endpoint
  app.post('/api/plants/:id/water', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const now = new Date();
      
      // Update plant's last watered time
      const plant = await storage.updatePlant(req.params.id, {
        lastWatered: now,
        status: 'healthy'
      }, userId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }

      // Create care event
      await storage.createCareEvent({
        userId,
        plantId: req.params.id,
        eventType: 'watering',
        eventDate: now,
        completed: true,
        notes: 'Plant watered'
      });

      res.json(plant);
    } catch (error) {
      console.error("Error watering plant:", error);
      res.status(500).json({ message: "Failed to water plant" });
    }
  });

  // Care events routes
  app.get('/api/care-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plantId = req.query.plantId as string;
      const events = await storage.getCareEvents(userId, plantId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching care events:", error);
      res.status(500).json({ message: "Failed to fetch care events" });
    }
  });

  app.get('/api/care-events/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUpcomingCareEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  app.post('/api/care-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertCareEventSchema.parse({ ...req.body, userId });
      const event = await storage.createCareEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating care event:", error);
      res.status(400).json({ message: "Failed to create care event" });
    }
  });

  app.put('/api/care-events/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.markCareEventCompleted(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Care event not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing care event:", error);
      res.status(500).json({ message: "Failed to complete care event" });
    }
  });

  // AI Tips routes
  app.get('/api/ai-tips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tips = await storage.getAiTips(userId);
      res.json(tips);
    } catch (error) {
      console.error("Error fetching AI tips:", error);
      res.status(500).json({ message: "Failed to fetch AI tips" });
    }
  });

  app.post('/api/ai-tips/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category, season, skillLevel } = req.body;
      
      // Get user's location and plants for context
      const user = await storage.getUser(userId);
      const userPlants = await storage.getPlants(userId);
      
      // Get weather data if location is available
      let weatherConditions;
      if (user?.location) {
        const weather = await getWeatherData(user.location);
        if (weather) {
          weatherConditions = {
            temperature: weather.temperature,
            humidity: weather.humidity,
            condition: weather.condition
          };
          
          // Update weather data in database
          await storage.upsertWeatherData({
            location: user.location,
            temperature: weather.temperature,
            humidity: weather.humidity,
            condition: weather.condition,
            description: weather.description,
            icon: weather.icon
          });
        }
      }

      const tipData = await generateGardeningTip({
        category,
        season,
        skillLevel: skillLevel || user?.experienceLevel || 'beginner',
        location: user?.location || undefined,
        weatherConditions,
        userPlants: userPlants.map(plant => ({
          name: plant.name,
          category: plant.category,
          plantedDate: plant.plantedDate ? new Date(plant.plantedDate).toISOString() : ''
        }))
      });

      const tip = await storage.createAiTip({
        userId,
        category: tipData.category,
        title: tipData.title,
        content: tipData.content,
        tags: tipData.tags,
        weatherConditions: weatherConditions ? JSON.stringify(weatherConditions) : null
      });

      res.status(201).json(tip);
    } catch (error) {
      console.error("Error generating AI tip:", error);
      res.status(500).json({ message: "Failed to generate AI tip" });
    }
  });

  app.put('/api/ai-tips/:id/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookmark } = req.body;
      const success = await storage.bookmarkAiTip(req.params.id, userId, bookmark);
      if (!success) {
        return res.status(404).json({ message: "Tip not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error bookmarking tip:", error);
      res.status(500).json({ message: "Failed to bookmark tip" });
    }
  });

  app.put('/api/ai-tips/:id/helpful', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { helpful } = req.body;
      const success = await storage.markTipHelpful(req.params.id, userId, helpful);
      if (!success) {
        return res.status(404).json({ message: "Tip not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking tip helpful:", error);
      res.status(500).json({ message: "Failed to mark tip helpful" });
    }
  });

  // Weather route
  app.get('/api/weather/:location', isAuthenticated, async (req: any, res) => {
    try {
      const location = req.params.location;
      
      // Try to get cached weather data first
      let weather = await storage.getWeatherData(location);
      
      // If no cached data or data is older than 30 minutes, fetch fresh data
      if (!weather || (weather.updatedAt && Date.now() - new Date(weather.updatedAt).getTime() > 30 * 60 * 1000)) {
        const freshWeather = await getWeatherData(location);
        if (freshWeather) {
          weather = await storage.upsertWeatherData({
            location: freshWeather.location,
            temperature: freshWeather.temperature,
            humidity: freshWeather.humidity,
            condition: freshWeather.condition,
            description: freshWeather.description,
            icon: freshWeather.icon
          });
        }
      }
      
      if (!weather) {
        return res.status(404).json({ message: "Weather data not available" });
      }
      
      // Add gardening recommendations
      const recommendations = getGardeningRecommendations(
        weather.temperature!,
        weather.humidity!,
        weather.condition!
      );
      
      res.json({
        ...weather,
        recommendations
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
