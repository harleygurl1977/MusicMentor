import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  date,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  experienceLevel: varchar("experience_level").default('beginner'),
  gardenType: varchar("garden_type").default('outdoor'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const plants = pgTable("plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  variety: varchar("variety"),
  plantedDate: date("planted_date"),
  location: varchar("location").notNull(),
  status: varchar("status").default('healthy'),
  notes: text("notes"),
  imageUrl: varchar("image_url"),
  wateringFrequency: integer("watering_frequency").default(3), // days
  lastWatered: timestamp("last_watered"),
  nextWatering: timestamp("next_watering"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const careEvents = pgTable("care_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  plantId: varchar("plant_id").references(() => plants.id, { onDelete: 'cascade' }),
  eventType: varchar("event_type").notNull(), // watering, fertilizing, pruning, etc.
  eventDate: timestamp("event_date").notNull(),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiTips = pgTable("ai_tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: varchar("category").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  isBookmarked: boolean("is_bookmarked").default(false),
  isHelpful: boolean("is_helpful"),
  weatherConditions: jsonb("weather_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: varchar("location").notNull(),
  temperature: real("temperature"),
  humidity: real("humidity"),
  condition: varchar("condition"),
  description: varchar("description"),
  icon: varchar("icon"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  plants: many(plants),
  careEvents: many(careEvents),
  aiTips: many(aiTips),
}));

export const plantsRelations = relations(plants, ({ one, many }) => ({
  user: one(users, {
    fields: [plants.userId],
    references: [users.id],
  }),
  careEvents: many(careEvents),
}));

export const careEventsRelations = relations(careEvents, ({ one }) => ({
  user: one(users, {
    fields: [careEvents.userId],
    references: [users.id],
  }),
  plant: one(plants, {
    fields: [careEvents.plantId],
    references: [plants.id],
  }),
}));

export const aiTipsRelations = relations(aiTips, ({ one }) => ({
  user: one(users, {
    fields: [aiTips.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  location: true,
  experienceLevel: true,
  gardenType: true,
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  nextWatering: true,
});

export const insertCareEventSchema = createInsertSchema(careEvents).omit({
  id: true,
  createdAt: true,
});

export const insertAiTipSchema = createInsertSchema(aiTips).omit({
  id: true,
  createdAt: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertCareEvent = z.infer<typeof insertCareEventSchema>;
export type CareEvent = typeof careEvents.$inferSelect;
export type InsertAiTip = z.infer<typeof insertAiTipSchema>;
export type AiTip = typeof aiTips.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
