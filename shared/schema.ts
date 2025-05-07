import { pgTable, text, serial, integer, boolean, jsonb, timestamp, foreignKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("user"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  jiraProjectId: varchar("jira_project_id", { length: 10 }),
  jiraJql: text("jira_jql"),
  jiraApiKey: varchar("jira_api_key", { length: 100 }),
  githubRepo: varchar("github_repo", { length: 100 }),
  testCaseFormat: varchar("test_case_format", { length: 20 }).default("structured"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maturityDimensions = pgTable("maturity_dimensions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
});

export const maturityLevels = pgTable("maturity_levels", {
  id: serial("id").primaryKey(),
  dimensionId: integer("dimension_id").notNull().references(() => maturityDimensions.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'completed', 'in_progress', 'not_started'
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
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
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
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
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
});

export const assessmentTemplates = pgTable("assessment_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  dimensionId: integer("dimension_id").references(() => maturityDimensions.id),
  criteria: jsonb("criteria").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dimensionId: integer("dimension_id").references(() => maturityDimensions.id),
  templateId: integer("template_id").references(() => assessmentTemplates.id),
  score: integer("score"),
  scorePercent: integer("score_percent"),
  status: text("status").notNull(), // "completed", "scheduled", "in_progress"
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  userId: integer("user_id").references(() => users.id),
  results: jsonb("results").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
});

export const testSuites = pgTable("test_suites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // functional, integration, end-to-end, etc.
  status: varchar("status", { length: 30 }).default("active"), // active, archived
  priority: varchar("priority", { length: 20 }).default("medium"), // high, medium, low
  projectArea: varchar("project_area", { length: 100 }), // e.g., "authentication", "payment", "checkout"
  userId: integer("user_id").references(() => users.id),
  aiGenerated: boolean("ai_generated").default(false),
  tags: jsonb("tags").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  preconditions: text("preconditions"),
  steps: jsonb("steps").default([]), // [{ step: "Login as admin", expected: "Login successful" }]
  expectedResults: text("expected_results"),
  actualResults: text("actual_results"),
  priority: varchar("priority", { length: 20 }).default("medium"), // high, medium, low
  severity: varchar("severity", { length: 20 }).default("normal"), // critical, high, normal, low
  status: varchar("status", { length: 30 }).default("draft"), // draft, ready, in-progress, passed, failed
  suiteId: integer("suite_id").references(() => testSuites.id, { onDelete: "set null" }),
  userId: integer("user_id").references(() => users.id),
  aiGenerated: boolean("ai_generated").default(false),
  automatable: boolean("automatable"),
  automationStatus: varchar("automation_status", { length: 30 }), // not-automated, in-progress, automated
  testData: jsonb("test_data").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
});

// Insert Schemas
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
export const insertAssessmentTemplateSchema = createInsertSchema(assessmentTemplates);
export const insertAssessmentSchema = createInsertSchema(assessments);
export const insertTestSuiteSchema = createInsertSchema(testSuites);
export const insertTestCaseSchema = createInsertSchema(testCases);
export const insertProjectSchema = createInsertSchema(projects);

// Types
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

export type InsertAssessmentTemplate = z.infer<typeof insertAssessmentTemplateSchema>;
export type AssessmentTemplate = typeof assessmentTemplates.$inferSelect;

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

export type InsertTestSuite = z.infer<typeof insertTestSuiteSchema>;
export type TestSuite = typeof testSuites.$inferSelect;

export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCases.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  testSuites: many(testSuites),
  testCases: many(testCases),
  assessments: many(assessments),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  maturityDimensions: many(maturityDimensions),
  maturityLevels: many(maturityLevels),
  metrics: many(metrics),
  recommendations: many(recommendations),
  assessmentTemplates: many(assessmentTemplates),
  assessments: many(assessments),
  testSuites: many(testSuites),
  testCases: many(testCases),
}));

export const maturityDimensionsRelations = relations(maturityDimensions, ({ one, many }) => ({
  levels: many(maturityLevels),
  metrics: many(metrics),
  recommendations: many(recommendations),
  project: one(projects, {
    fields: [maturityDimensions.projectId],
    references: [projects.id],
  }),
}));

export const maturityLevelsRelations = relations(maturityLevels, ({ one, many }) => ({
  dimension: one(maturityDimensions, {
    fields: [maturityLevels.dimensionId],
    references: [maturityDimensions.id],
  }),
  recommendations: many(recommendations),
  project: one(projects, {
    fields: [maturityLevels.projectId],
    references: [projects.id],
  }),
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  dimension: one(maturityDimensions, {
    fields: [metrics.dimensionId],
    references: [maturityDimensions.id],
  }),
  project: one(projects, {
    fields: [metrics.projectId],
    references: [projects.id],
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
  project: one(projects, {
    fields: [recommendations.projectId],
    references: [projects.id],
  }),
}));

export const assessmentTemplatesRelations = relations(assessmentTemplates, ({ one, many }) => ({
  dimension: one(maturityDimensions, {
    fields: [assessmentTemplates.dimensionId],
    references: [maturityDimensions.id],
  }),
  assessments: many(assessments),
  project: one(projects, {
    fields: [assessmentTemplates.projectId],
    references: [projects.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  dimension: one(maturityDimensions, {
    fields: [assessments.dimensionId],
    references: [maturityDimensions.id],
  }),
  template: one(assessmentTemplates, {
    fields: [assessments.templateId],
    references: [assessmentTemplates.id],
  }),
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [assessments.projectId],
    references: [projects.id],
  }),
}));

export const testSuitesRelations = relations(testSuites, ({ one, many }) => ({
  user: one(users, {
    fields: [testSuites.userId],
    references: [users.id],
  }),
  testCases: many(testCases),
  project: one(projects, {
    fields: [testSuites.projectId],
    references: [projects.id],
  }),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  suite: one(testSuites, {
    fields: [testCases.suiteId],
    references: [testSuites.id],
  }),
  user: one(users, {
    fields: [testCases.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [testCases.projectId],
    references: [projects.id],
  }),
}));
