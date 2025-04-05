import { pgTable, text, serial, integer, boolean, jsonb, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("user"),
});

export const maturityDimensions = pgTable("maturity_dimensions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull(),
});

export const maturityLevels = pgTable("maturity_levels", {
  id: serial("id").primaryKey(),
  dimensionId: integer("dimension_id").notNull().references(() => maturityDimensions.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'completed', 'in_progress', 'not_started'
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  previousValue: text("previous_value"),
  targetValue: text("target_value"),
  change: text("change"),
  changeDirection: text("change_direction"), // 'up' or 'down'
  isPositive: boolean("is_positive").default(true),
  color: text("color"),
  dimensionId: integer("dimension_id").references(() => maturityDimensions.id, { onDelete: "set null" }),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'insight', 'recommendation', etc.
  priority: text("priority").default("normal"), // 'high', 'normal', 'low'
  dimensionId: integer("dimension_id").references(() => maturityDimensions.id, { onDelete: "set null" }),
  levelId: integer("level_id").references(() => maturityLevels.id, { onDelete: "set null" }),
  actions: jsonb("actions").default([]),
  status: text("status").default("active"), // 'active', 'dismissed', 'implemented'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
});

export const insertMaturityDimensionSchema = createInsertSchema(maturityDimensions);
export const insertMaturityLevelSchema = createInsertSchema(maturityLevels);
export const insertMetricSchema = createInsertSchema(metrics);
export const insertRecommendationSchema = createInsertSchema(recommendations);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMaturityDimension = z.infer<typeof insertMaturityDimensionSchema>;
export type MaturityDimension = typeof maturityDimensions.$inferSelect;

export type InsertMaturityLevel = z.infer<typeof insertMaturityLevelSchema>;
export type MaturityLevel = typeof maturityLevels.$inferSelect;

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  // A user might have many recommendations, metrics, etc in the future
}));

export const maturityDimensionsRelations = relations(maturityDimensions, ({ many }) => ({
  levels: many(maturityLevels),
  metrics: many(metrics),
  recommendations: many(recommendations),
}));

export const maturityLevelsRelations = relations(maturityLevels, ({ one, many }) => ({
  dimension: one(maturityDimensions, {
    fields: [maturityLevels.dimensionId],
    references: [maturityDimensions.id],
  }),
  recommendations: many(recommendations),
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  dimension: one(maturityDimensions, {
    fields: [metrics.dimensionId],
    references: [maturityDimensions.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  dimension: one(maturityDimensions, {
    fields: [recommendations.dimensionId],
    references: [maturityDimensions.id],
  }),
  level: one(maturityLevels, {
    fields: [recommendations.levelId],
    references: [maturityLevels.id],
  }),
}));
