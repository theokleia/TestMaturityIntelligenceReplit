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
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("active"), // Added status field for archiving
  // Project details for AI context
  projectType: varchar("project_type", { length: 50 }), // Greenfield, New Software, Legacy, etc.
  industryArea: varchar("industry_area", { length: 100 }), // Healthcare, Finance, E-commerce, etc.
  regulations: text("regulations"), // Applicable regulations (HIPAA, SOX, GDPR, etc.)
  additionalContext: text("additional_context"), // Detailed text about intended use, users, and business context
  qualityFocus: text("quality_focus"), // Areas of quality focus (security, performance, usability)
  // Integration settings
  jiraProjectId: varchar("jira_project_id", { length: 10 }),
  jiraUrl: text("jira_url"), // Added jiraUrl field to store the Jira base URL
  jiraJql: text("jira_jql"),
  jiraApiKey: text("jira_api_key"), // Changed from varchar(100) to text to support longer API keys
  jiraIssueType: varchar("jira_issue_type", { length: 50 }).default("Bug"), // Added field for Jira issue type for test failures
  githubRepo: varchar("github_repo", { length: 100 }),
  githubToken: text("github_token"), // Added GitHub token field
  testCaseFormat: varchar("test_case_format", { length: 20 }).default("structured"),
  outputFormat: varchar("output_format", { length: 20 }).default("markdown"),
  createdAt: timestamp("created_at", { mode: 'string', withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string', withTimezone: true }).defaultNow(),
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

// Test Cycles for organizing test execution
export const testCycles = pgTable("test_cycles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 30 }).default("created"), // created, in-progress, completed, archived
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
});

// Connecting Test Cases to Test Cycles
export const testCycleItems = pgTable("test_cycle_items", {
  id: serial("id").primaryKey(),
  cycleId: integer("cycle_id").notNull().references(() => testCycles.id, { onDelete: "cascade" }),
  testCaseId: integer("test_case_id").notNull().references(() => testCases.id, { onDelete: "cascade" }),
  suiteId: integer("suite_id").references(() => testSuites.id, { onDelete: "set null" }),
  assignedUserId: integer("assigned_user_id").references(() => users.id),
  status: varchar("status", { length: 30 }).default("not-run"), // not-run, pass, fail, skip, blocked
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

// Execution runs for each test case in a cycle
export const testRuns = pgTable("test_runs", {
  id: serial("id").primaryKey(),
  cycleItemId: integer("cycle_item_id").notNull().references(() => testCycleItems.id, { onDelete: "cascade" }),
  executedBy: integer("executed_by").references(() => users.id),
  executedAt: timestamp("executed_at", { mode: 'string' }).defaultNow(),
  duration: integer("duration"), // in seconds
  status: varchar("status", { length: 30 }).notNull(), // pass, fail, skip, blocked, cancelled
  notes: text("notes"),
  evidence: jsonb("evidence").default([]), // list of attachments or screenshots
  environment: varchar("environment", { length: 50 }), // e.g. dev, staging, production
  version: varchar("version", { length: 50 }), // application version tested
  stepResults: jsonb("step_results").default([]), // [{ stepId: 1, status: "pass", actual: "As expected", notes: "" }]
  defects: jsonb("defects").default([]), // list of defect IDs or references
  tags: jsonb("tags").default([]),
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
export const insertTestCycleSchema = createInsertSchema(testCycles);
export const insertTestCycleItemSchema = createInsertSchema(testCycleItems);
export const insertTestRunSchema = createInsertSchema(testRuns);

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

export type InsertTestCycle = z.infer<typeof insertTestCycleSchema>;
export type TestCycle = typeof testCycles.$inferSelect;

export type InsertTestCycleItem = z.infer<typeof insertTestCycleItemSchema>;
export type TestCycleItem = typeof testCycleItems.$inferSelect;

export type InsertTestRun = z.infer<typeof insertTestRunSchema>;
export type TestRun = typeof testRuns.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  testSuites: many(testSuites),
  testCases: many(testCases),
  assessments: many(assessments),
  testCycles: many(testCycles),
  testCycleItems: many(testCycleItems, { relationName: "assignedUser" }),
  testRuns: many(testRuns, { relationName: "executedBy" }),
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
  testCycles: many(testCycles),
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

export const testCasesRelations = relations(testCases, ({ one, many }) => ({
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
  cycleItems: many(testCycleItems),
}));

export const testCyclesRelations = relations(testCycles, ({ one, many }) => ({
  user: one(users, {
    fields: [testCycles.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [testCycles.projectId],
    references: [projects.id],
  }),
  cycleItems: many(testCycleItems),
}));

export const testCycleItemsRelations = relations(testCycleItems, ({ one, many }) => ({
  cycle: one(testCycles, {
    fields: [testCycleItems.cycleId],
    references: [testCycles.id],
  }),
  testCase: one(testCases, {
    fields: [testCycleItems.testCaseId],
    references: [testCases.id],
  }),
  suite: one(testSuites, {
    fields: [testCycleItems.suiteId],
    references: [testSuites.id],
  }),
  assignedUser: one(users, {
    fields: [testCycleItems.assignedUserId],
    references: [users.id],
  }),
  runs: many(testRuns),
}));

export const testRunsRelations = relations(testRuns, ({ one }) => ({
  cycleItem: one(testCycleItems, {
    fields: [testRuns.cycleItemId],
    references: [testCycleItems.id],
  }),
  executedBy: one(users, {
    fields: [testRuns.executedBy],
    references: [users.id],
  }),
}));

// Document schema for the Documenter AI feature
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // PRD, SRS, SDDS, Trace Matrix, Test Plan, Test Report, Custom
  content: text("content").notNull(),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: 'string', withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string', withTimezone: true }).defaultNow(),
  tags: text("tags").array(),
  version: varchar("version", { length: 50 }).default("1.0"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, published, archived
  aiPrompt: text("ai_prompt"), // Store the original prompt used to generate the document
});

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
  }),
}));

// Schemas and types for documents
export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    tags: z.array(z.string()).optional().default([]),
  });

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Global settings for AI integration and system configuration
export const globalSettings = pgTable("global_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., "openai_api_key", "openai_model", "anthropic_api_key", "anthropic_model"
  value: text("value"),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // e.g., "AI", "System", "Integration"
  createdAt: timestamp("created_at", { mode: 'string', withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string', withTimezone: true }).defaultNow(),
});

// Schemas and types for global settings
export const insertGlobalSettingSchema = createInsertSchema(globalSettings)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertGlobalSetting = z.infer<typeof insertGlobalSettingSchema>;
export type GlobalSetting = typeof globalSettings.$inferSelect;
