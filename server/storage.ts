import {
  users,
  plants,
  careEvents,
  aiTips,
  weatherData,
  type User,
  type UpsertUser,
  type Plant,
  type InsertPlant,
  type CareEvent,
  type InsertCareEvent,
  type AiTip,
  type InsertAiTip,
  type WeatherData,
  type InsertWeatherData,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Plant operations
  getPlants(userId: string): Promise<Plant[]>;
  getPlant(id: string, userId: string): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: string, updates: Partial<InsertPlant>, userId: string): Promise<Plant | undefined>;
  deletePlant(id: string, userId: string): Promise<boolean>;
  getPlantsNeedingWater(userId: string): Promise<Plant[]>;
  
  // Care events
  getCareEvents(userId: string, plantId?: string): Promise<CareEvent[]>;
  createCareEvent(careEvent: InsertCareEvent): Promise<CareEvent>;
  updateCareEvent(id: string, updates: Partial<InsertCareEvent>, userId: string): Promise<CareEvent | undefined>;
  getUpcomingCareEvents(userId: string): Promise<CareEvent[]>;
  markCareEventCompleted(id: string, userId: string): Promise<boolean>;
  
  // AI Tips
  getAiTips(userId: string): Promise<AiTip[]>;
  createAiTip(tip: InsertAiTip): Promise<AiTip>;
  bookmarkAiTip(id: string, userId: string, bookmark: boolean): Promise<boolean>;
  markTipHelpful(id: string, userId: string, helpful: boolean): Promise<boolean>;
  
  // Weather
  getWeatherData(location: string): Promise<WeatherData | undefined>;
  upsertWeatherData(weather: InsertWeatherData): Promise<WeatherData>;
  
  // Stats
  getUserStats(userId: string): Promise<{
    totalPlants: number;
    needWater: number;
    careReminders: number;
    aiTipsThisWeek: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Plant operations
  async getPlants(userId: string): Promise<Plant[]> {
    return await db.select().from(plants).where(eq(plants.userId, userId));
  }

  async getPlant(id: string, userId: string): Promise<Plant | undefined> {
    const [plant] = await db
      .select()
      .from(plants)
      .where(and(eq(plants.id, id), eq(plants.userId, userId)));
    return plant;
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    // Calculate next watering date
    const nextWatering = new Date();
    nextWatering.setDate(nextWatering.getDate() + (plant.wateringFrequency || 3));
    
    const [newPlant] = await db
      .insert(plants)
      .values({
        ...plant,
        nextWatering,
      })
      .returning();
    return newPlant;
  }

  async updatePlant(id: string, updates: Partial<InsertPlant>, userId: string): Promise<Plant | undefined> {
    // Recalculate next watering if watering frequency changed or plant was watered
    let nextWatering: Date | undefined;
    if (updates.wateringFrequency || updates.lastWatered) {
      const wateringFreq = updates.wateringFrequency || 3;
      nextWatering = new Date();
      nextWatering.setDate(nextWatering.getDate() + wateringFreq);
    }

    const [updated] = await db
      .update(plants)
      .set({
        ...updates,
        ...(nextWatering && { nextWatering }),
        updatedAt: new Date(),
      })
      .where(and(eq(plants.id, id), eq(plants.userId, userId)))
      .returning();
    return updated;
  }

  async deletePlant(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(plants)
      .where(and(eq(plants.id, id), eq(plants.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getPlantsNeedingWater(userId: string): Promise<Plant[]> {
    return await db
      .select()
      .from(plants)
      .where(
        and(
          eq(plants.userId, userId),
          lte(plants.nextWatering, new Date())
        )
      );
  }

  // Care events
  async getCareEvents(userId: string, plantId?: string): Promise<CareEvent[]> {
    const conditions = [eq(careEvents.userId, userId)];
    if (plantId) {
      conditions.push(eq(careEvents.plantId, plantId));
    }
    
    return await db
      .select()
      .from(careEvents)
      .where(and(...conditions))
      .orderBy(desc(careEvents.eventDate));
  }

  async createCareEvent(careEvent: InsertCareEvent): Promise<CareEvent> {
    const [newEvent] = await db
      .insert(careEvents)
      .values(careEvent)
      .returning();
    return newEvent;
  }

  async updateCareEvent(id: string, updates: Partial<InsertCareEvent>, userId: string): Promise<CareEvent | undefined> {
    const [updated] = await db
      .update(careEvents)
      .set(updates)
      .where(and(eq(careEvents.id, id), eq(careEvents.userId, userId)))
      .returning();
    return updated;
  }

  async getUpcomingCareEvents(userId: string): Promise<CareEvent[]> {
    return await db
      .select()
      .from(careEvents)
      .where(
        and(
          eq(careEvents.userId, userId),
          eq(careEvents.completed, false),
          gte(careEvents.eventDate, new Date())
        )
      )
      .orderBy(careEvents.eventDate);
  }

  async markCareEventCompleted(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(careEvents)
      .set({ completed: true })
      .where(and(eq(careEvents.id, id), eq(careEvents.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Tips
  async getAiTips(userId: string): Promise<AiTip[]> {
    return await db
      .select()
      .from(aiTips)
      .where(eq(aiTips.userId, userId))
      .orderBy(desc(aiTips.createdAt));
  }

  async createAiTip(tip: InsertAiTip): Promise<AiTip> {
    const [newTip] = await db
      .insert(aiTips)
      .values(tip)
      .returning();
    return newTip;
  }

  async bookmarkAiTip(id: string, userId: string, bookmark: boolean): Promise<boolean> {
    const result = await db
      .update(aiTips)
      .set({ isBookmarked: bookmark })
      .where(and(eq(aiTips.id, id), eq(aiTips.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async markTipHelpful(id: string, userId: string, helpful: boolean): Promise<boolean> {
    const result = await db
      .update(aiTips)
      .set({ isHelpful: helpful })
      .where(and(eq(aiTips.id, id), eq(aiTips.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Weather
  async getWeatherData(location: string): Promise<WeatherData | undefined> {
    const [weather] = await db
      .select()
      .from(weatherData)
      .where(eq(weatherData.location, location));
    return weather;
  }

  async upsertWeatherData(weather: InsertWeatherData): Promise<WeatherData> {
    const [upserted] = await db
      .insert(weatherData)
      .values(weather)
      .onConflictDoUpdate({
        target: weatherData.location,
        set: {
          ...weather,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  // Stats
  async getUserStats(userId: string): Promise<{
    totalPlants: number;
    needWater: number;
    careReminders: number;
    aiTipsThisWeek: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalPlantsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(plants)
      .where(eq(plants.userId, userId));

    const [needWaterResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(plants)
      .where(
        and(
          eq(plants.userId, userId),
          lte(plants.nextWatering, new Date())
        )
      );

    const [careRemindersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(careEvents)
      .where(
        and(
          eq(careEvents.userId, userId),
          eq(careEvents.completed, false),
          lte(careEvents.eventDate, new Date())
        )
      );

    const [aiTipsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiTips)
      .where(
        and(
          eq(aiTips.userId, userId),
          gte(aiTips.createdAt, oneWeekAgo)
        )
      );

    return {
      totalPlants: totalPlantsResult.count,
      needWater: needWaterResult.count,
      careReminders: careRemindersResult.count,
      aiTipsThisWeek: aiTipsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
