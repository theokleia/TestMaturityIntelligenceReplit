import { 
  users, type User, type InsertUser,
  maturityDimensions, type MaturityDimension, type InsertMaturityDimension,
  maturityLevels, type MaturityLevel, type InsertMaturityLevel,
  metrics, type Metric, type InsertMetric,
  recommendations, type Recommendation, type InsertRecommendation,
  assessments, type Assessment, type InsertAssessment,
  assessmentTemplates, type AssessmentTemplate, type InsertAssessmentTemplate
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, inArray, lt, gte, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Maturity Dimensions
  getMaturityDimensions(): Promise<MaturityDimension[]>;
  getMaturityDimension(id: number): Promise<MaturityDimension | undefined>;
  createMaturityDimension(dimension: InsertMaturityDimension): Promise<MaturityDimension>;
  updateMaturityDimension(id: number, dimension: Partial<InsertMaturityDimension>): Promise<MaturityDimension | undefined>;

  // Maturity Levels
  getMaturityLevels(dimensionId?: number): Promise<MaturityLevel[]>;
  getMaturityLevel(id: number): Promise<MaturityLevel | undefined>;
  createMaturityLevel(level: InsertMaturityLevel): Promise<MaturityLevel>;
  updateMaturityLevel(id: number, level: Partial<InsertMaturityLevel>): Promise<MaturityLevel | undefined>;

  // Metrics
  getMetrics(dimensionId?: number): Promise<Metric[]>;
  getMetric(id: number): Promise<Metric | undefined>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined>;

  // Recommendations
  getRecommendations(dimensionId?: number, levelId?: number): Promise<Recommendation[]>;
  getRecommendation(id: number): Promise<Recommendation | undefined>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  updateRecommendation(id: number, recommendation: Partial<InsertRecommendation>): Promise<Recommendation | undefined>;
  
  // Assessment Templates
  getAssessmentTemplates(dimensionId?: number): Promise<AssessmentTemplate[]>;
  getAssessmentTemplate(id: number): Promise<AssessmentTemplate | undefined>;
  createAssessmentTemplate(template: InsertAssessmentTemplate): Promise<AssessmentTemplate>;
  updateAssessmentTemplate(id: number, template: Partial<InsertAssessmentTemplate>): Promise<AssessmentTemplate | undefined>;
  
  // Assessments
  getAssessments(filters?: {
    dimensionId?: number;
    templateId?: number;
    userId?: number;
    status?: string;
  }): Promise<Assessment[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Maturity Dimensions
  async getMaturityDimensions(): Promise<MaturityDimension[]> {
    return db.select().from(maturityDimensions).orderBy(asc(maturityDimensions.order));
  }

  async getMaturityDimension(id: number): Promise<MaturityDimension | undefined> {
    const [dimension] = await db.select().from(maturityDimensions).where(eq(maturityDimensions.id, id));
    return dimension || undefined;
  }

  async createMaturityDimension(dimension: InsertMaturityDimension): Promise<MaturityDimension> {
    const [newDimension] = await db.insert(maturityDimensions).values(dimension).returning();
    return newDimension;
  }

  async updateMaturityDimension(id: number, dimension: Partial<InsertMaturityDimension>): Promise<MaturityDimension | undefined> {
    const [updatedDimension] = await db
      .update(maturityDimensions)
      .set(dimension)
      .where(eq(maturityDimensions.id, id))
      .returning();
    return updatedDimension || undefined;
  }

  // Maturity Levels
  async getMaturityLevels(dimensionId?: number): Promise<MaturityLevel[]> {
    if (dimensionId) {
      return db
        .select()
        .from(maturityLevels)
        .where(eq(maturityLevels.dimensionId, dimensionId))
        .orderBy(asc(maturityLevels.level));
    }
    return db.select().from(maturityLevels).orderBy(asc(maturityLevels.level));
  }

  async getMaturityLevel(id: number): Promise<MaturityLevel | undefined> {
    const [level] = await db.select().from(maturityLevels).where(eq(maturityLevels.id, id));
    return level || undefined;
  }

  async createMaturityLevel(level: InsertMaturityLevel): Promise<MaturityLevel> {
    const [newLevel] = await db.insert(maturityLevels).values(level).returning();
    return newLevel;
  }

  async updateMaturityLevel(id: number, level: Partial<InsertMaturityLevel>): Promise<MaturityLevel | undefined> {
    const [updatedLevel] = await db
      .update(maturityLevels)
      .set(level)
      .where(eq(maturityLevels.id, id))
      .returning();
    return updatedLevel || undefined;
  }

  // Metrics
  async getMetrics(dimensionId?: number): Promise<Metric[]> {
    if (dimensionId) {
      return db.select().from(metrics).where(eq(metrics.dimensionId, dimensionId));
    }
    return db.select().from(metrics);
  }

  async getMetric(id: number): Promise<Metric | undefined> {
    const [metric] = await db.select().from(metrics).where(eq(metrics.id, id));
    return metric || undefined;
  }

  async createMetric(metric: InsertMetric): Promise<Metric> {
    const [newMetric] = await db.insert(metrics).values(metric).returning();
    return newMetric;
  }

  async updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined> {
    const [updatedMetric] = await db
      .update(metrics)
      .set(metric)
      .where(eq(metrics.id, id))
      .returning();
    return updatedMetric || undefined;
  }

  // Recommendations
  async getRecommendations(dimensionId?: number, levelId?: number): Promise<Recommendation[]> {
    if (dimensionId && levelId) {
      return db
        .select()
        .from(recommendations)
        .where(
          and(
            eq(recommendations.dimensionId, dimensionId),
            eq(recommendations.levelId, levelId)
          )
        )
        .orderBy(desc(recommendations.createdAt));
    }
    
    if (dimensionId) {
      return db
        .select()
        .from(recommendations)
        .where(eq(recommendations.dimensionId, dimensionId))
        .orderBy(desc(recommendations.createdAt));
    }
    
    if (levelId) {
      return db
        .select()
        .from(recommendations)
        .where(eq(recommendations.levelId, levelId))
        .orderBy(desc(recommendations.createdAt));
    }
    
    return db
      .select()
      .from(recommendations)
      .orderBy(desc(recommendations.createdAt));
  }

  async getRecommendation(id: number): Promise<Recommendation | undefined> {
    const [recommendation] = await db.select().from(recommendations).where(eq(recommendations.id, id));
    return recommendation || undefined;
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const [newRecommendation] = await db.insert(recommendations).values(recommendation).returning();
    return newRecommendation;
  }

  async updateRecommendation(id: number, recommendation: Partial<InsertRecommendation>): Promise<Recommendation | undefined> {
    const [updatedRecommendation] = await db
      .update(recommendations)
      .set(recommendation)
      .where(eq(recommendations.id, id))
      .returning();
    return updatedRecommendation || undefined;
  }
  
  // Assessment Templates
  async getAssessmentTemplates(dimensionId?: number): Promise<AssessmentTemplate[]> {
    if (dimensionId) {
      return db
        .select()
        .from(assessmentTemplates)
        .where(eq(assessmentTemplates.dimensionId, dimensionId))
        .orderBy(desc(assessmentTemplates.createdAt));
    }
    return db
      .select()
      .from(assessmentTemplates)
      .orderBy(desc(assessmentTemplates.createdAt));
  }

  async getAssessmentTemplate(id: number): Promise<AssessmentTemplate | undefined> {
    const [template] = await db.select().from(assessmentTemplates).where(eq(assessmentTemplates.id, id));
    return template || undefined;
  }

  async createAssessmentTemplate(template: InsertAssessmentTemplate): Promise<AssessmentTemplate> {
    const [newTemplate] = await db.insert(assessmentTemplates).values(template).returning();
    return newTemplate;
  }

  async updateAssessmentTemplate(id: number, template: Partial<InsertAssessmentTemplate>): Promise<AssessmentTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(assessmentTemplates)
      .set(template)
      .where(eq(assessmentTemplates.id, id))
      .returning();
    return updatedTemplate || undefined;
  }
  
  // Assessments
  async getAssessments(filters?: {
    dimensionId?: number;
    templateId?: number;
    userId?: number;
    status?: string;
  }): Promise<Assessment[]> {
    let queryBuilder = db.select().from(assessments);
    
    // Apply filters if provided
    if (filters) {
      const conditions = [];
      
      if (filters.dimensionId !== undefined) {
        conditions.push(eq(assessments.dimensionId, filters.dimensionId));
      }
      
      if (filters.templateId !== undefined) {
        conditions.push(eq(assessments.templateId, filters.templateId));
      }
      
      if (filters.userId !== undefined) {
        conditions.push(eq(assessments.userId, filters.userId));
      }
      
      if (filters.status !== undefined) {
        conditions.push(eq(assessments.status, filters.status));
      }
      
      if (conditions.length > 0) {
        queryBuilder = queryBuilder.where(and(...conditions));
      }
    }
    
    return await queryBuilder.orderBy(desc(assessments.createdAt));
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db.insert(assessments).values(assessment).returning();
    return newAssessment;
  }

  async updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set(assessment)
      .where(eq(assessments.id, id))
      .returning();
    return updatedAssessment || undefined;
  }

  // Initialize database with sample data
  async initSampleData() {
    // Create Admin user
    const adminExists = await this.getUserByUsername("admin");
    if (!adminExists) {
      await this.createUser({
        username: "admin",
        password: "adminpass",
        fullName: "Tecla Reitzi",
        email: "teclareitzi@example.com",
        role: "admin"
      });
    }

    // Create maturity dimensions if none exist
    const dimensions = await this.getMaturityDimensions();
    if (dimensions.length === 0) {
      await this.createMaturityDimension({
        name: "Automation Intelligence",
        description: "Enhance testing efficiency through intelligent test automation strategies",
        color: "#2E75FF", // Blue
        order: 1
      });

      await this.createMaturityDimension({
        name: "Development-Testing Synergy",
        description: "Strengthen collaboration between development and testing teams",
        color: "#8A56FF", // Purple
        order: 2
      });

      await this.createMaturityDimension({
        name: "AI-Augment Quality Engineering",
        description: "Leverage AI to enhance quality engineering practices",
        color: "#2FFFDD", // Teal
        order: 3
      });

      await this.createMaturityDimension({
        name: "Continuous Quality Engineering",
        description: "Build quality into the continuous delivery pipeline",
        color: "#FFBB3A", // Orange
        order: 4
      });

      // Create maturity levels for Automation Intelligence
      const automationDimId = 1; // First dimension
      await this.createMaturityLevel({
        dimensionId: automationDimId,
        level: 1,
        name: "Foundation",
        description: "Basic processes established",
        status: "completed"
      });

      await this.createMaturityLevel({
        dimensionId: automationDimId,
        level: 2,
        name: "Integration",
        description: "Automated tests integrated",
        status: "in_progress"
      });

      await this.createMaturityLevel({
        dimensionId: automationDimId,
        level: 3,
        name: "Optimization",
        description: "Continuous improvement of processes",
        status: "in_progress"
      });

      await this.createMaturityLevel({
        dimensionId: automationDimId,
        level: 4,
        name: "Autonomy",
        description: "Self-optimizing processes",
        status: "not_started"
      });

      // Create metrics
      await this.createMetric({
        name: "Test Automation Coverage",
        value: "68%",
        previousValue: "56%",
        targetValue: "80%",
        change: "12%",
        changeDirection: "up",
        isPositive: true,
        color: "#2E75FF", // Blue
        dimensionId: 1
      });

      await this.createMetric({
        name: "Test Execution Time",
        value: "18 min",
        previousValue: "21 min",
        targetValue: "12 min",
        change: "15%",
        changeDirection: "down",
        isPositive: true,
        color: "#8A56FF", // Purple
        dimensionId: 1
      });

      await this.createMetric({
        name: "Defect Density",
        value: "5.2",
        previousValue: "5.0",
        targetValue: "3.0",
        change: "3%",
        changeDirection: "up",
        isPositive: false,
        color: "#2FFFDD", // Teal
        dimensionId: 1
      });

      // Create recommendations
      await this.createRecommendation({
        title: "Testing Efficiency Opportunity",
        description: "Based on analysis of your test execution patterns over the last 30 days, we've identified that 23% of your UI tests are redundant with your API tests. Consider refactoring these tests to improve execution time.",
        type: "insight",
        priority: "high",
        dimensionId: 1,
        levelId: 3,
        actions: ["View Details", "Dismiss", "Schedule Review"],
        status: "active"
      });

      await this.createRecommendation({
        title: "AI Recommendation",
        description: "Based on your recent test results, consider implementing automated regression tests for your API endpoints to improve coverage.",
        type: "recommendation",
        priority: "normal",
        dimensionId: 1,
        levelId: 2,
        actions: ["Implement", "Dismiss"],
        status: "active"
      });
      
      // Create assessment templates
      await this.createAssessmentTemplate({
        name: "Automation Intelligence Assessment",
        description: "Evaluate the current state of test automation and identify areas for improvement",
        dimensionId: 1,
        criteria: [
          {
            id: 1,
            question: "What percentage of your tests are automated?",
            options: ["Less than 25%", "25-50%", "50-75%", "More than 75%"],
            weight: 10
          },
          {
            id: 2,
            question: "How frequently are automated tests executed?",
            options: ["On demand only", "Weekly", "Daily", "With every code change"],
            weight: 10
          },
          {
            id: 3,
            question: "Do you have a dedicated test automation framework?",
            options: ["No", "Yes, but it's limited", "Yes, it's comprehensive", "Yes, and it's continuously improved"],
            weight: 15
          }
        ]
      });
      
      await this.createAssessmentTemplate({
        name: "Development-Testing Synergy Assessment",
        description: "Evaluate collaboration between development and testing teams",
        dimensionId: 2,
        criteria: [
          {
            id: 1,
            question: "How early are testers involved in the development process?",
            options: ["After development is complete", "During implementation", "During design", "From requirements gathering"],
            weight: 15
          },
          {
            id: 2,
            question: "Do developers write unit tests for their code?",
            options: ["Rarely", "Sometimes", "Most of the time", "Always"],
            weight: 10
          },
          {
            id: 3,
            question: "Is there a shared responsibility for quality?",
            options: ["No, only testers are responsible", "Somewhat", "Yes, but testers lead quality efforts", "Yes, quality is everyone's responsibility"],
            weight: 15
          }
        ]
      });
      
      // Create sample assessments
      await this.createAssessment({
        name: "Q1 2025 Automation Assessment",
        dimensionId: 1,
        templateId: 1,
        status: "scheduled",
        scheduledDate: new Date("2025-01-15T00:00:00Z"),
        userId: 1
      });
      
      await this.createAssessment({
        name: "Q4 2024 Dev-Test Synergy Assessment",
        dimensionId: 2,
        templateId: 2,
        score: 72,
        scorePercent: 72,
        status: "completed",
        completedDate: new Date("2024-12-10T00:00:00Z"),
        userId: 1,
        results: {
          answers: [
            { questionId: 1, answer: "During design", score: 3 },
            { questionId: 2, answer: "Most of the time", score: 3 },
            { questionId: 3, answer: "Yes, but testers lead quality efforts", score: 3 }
          ],
          summary: "Good collaboration between development and testing teams, with room for improvement in shared responsibility.",
          recommendations: [
            "Implement paired programming/testing sessions",
            "Establish quality metrics that both teams are accountable for"
          ]
        }
      });
    }
  }
}

// Create and initialize the database storage
const storage = new DatabaseStorage();
// Initialize sample data
storage.initSampleData().catch(console.error);

export { storage };
