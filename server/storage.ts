import { 
  users, type User, type InsertUser,
  maturityDimensions, type MaturityDimension, type InsertMaturityDimension,
  maturityLevels, type MaturityLevel, type InsertMaturityLevel,
  metrics, type Metric, type InsertMetric,
  recommendations, type Recommendation, type InsertRecommendation,
  assessments, type Assessment, type InsertAssessment,
  assessmentTemplates, type AssessmentTemplate, type InsertAssessmentTemplate,
  testSuites, type TestSuite, type InsertTestSuite,
  testCases, type TestCase, type InsertTestCase,
  projects, type Project, type InsertProject,
  testCycles, type TestCycle, type InsertTestCycle,
  testCycleItems, type TestCycleItem, type InsertTestCycleItem,
  testRuns, type TestRun, type InsertTestRun
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, inArray, lt, gte, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;

  // Maturity Dimensions
  getMaturityDimensions(projectId?: number): Promise<MaturityDimension[]>;
  getMaturityDimension(id: number): Promise<MaturityDimension | undefined>;
  createMaturityDimension(dimension: InsertMaturityDimension): Promise<MaturityDimension>;
  updateMaturityDimension(id: number, dimension: Partial<InsertMaturityDimension>): Promise<MaturityDimension | undefined>;

  // Maturity Levels
  getMaturityLevels(dimensionId?: number, projectId?: number): Promise<MaturityLevel[]>;
  getMaturityLevel(id: number): Promise<MaturityLevel | undefined>;
  createMaturityLevel(level: InsertMaturityLevel): Promise<MaturityLevel>;
  updateMaturityLevel(id: number, level: Partial<InsertMaturityLevel>): Promise<MaturityLevel | undefined>;

  // Metrics
  getMetrics(dimensionId?: number, projectId?: number): Promise<Metric[]>;
  getMetric(id: number): Promise<Metric | undefined>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined>;

  // Recommendations
  getRecommendations(dimensionId?: number, levelId?: number, projectId?: number): Promise<Recommendation[]>;
  getRecommendation(id: number): Promise<Recommendation | undefined>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  updateRecommendation(id: number, recommendation: Partial<InsertRecommendation>): Promise<Recommendation | undefined>;
  
  // Assessment Templates
  getAssessmentTemplates(dimensionId?: number, projectId?: number): Promise<AssessmentTemplate[]>;
  getAssessmentTemplate(id: number): Promise<AssessmentTemplate | undefined>;
  createAssessmentTemplate(template: InsertAssessmentTemplate): Promise<AssessmentTemplate>;
  updateAssessmentTemplate(id: number, template: Partial<InsertAssessmentTemplate>): Promise<AssessmentTemplate | undefined>;
  
  // Assessments
  getAssessments(filters?: {
    dimensionId?: number;
    templateId?: number;
    userId?: number;
    status?: string;
    projectId?: number;
  }): Promise<Assessment[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined>;

  // Test Suites
  getTestSuites(filters?: {
    userId?: number;
    status?: string;
    priority?: string;
    projectArea?: string;
    aiGenerated?: boolean;
    projectId?: number;
  }): Promise<TestSuite[]>;
  getTestSuite(id: number): Promise<TestSuite | undefined>;
  createTestSuite(testSuite: InsertTestSuite): Promise<TestSuite>;
  updateTestSuite(id: number, testSuite: Partial<InsertTestSuite>): Promise<TestSuite | undefined>;

  // Test Cases
  getTestCases(filters?: {
    suiteId?: number;
    userId?: number;
    status?: string;
    priority?: string;
    severity?: string;
    aiGenerated?: boolean;
    automatable?: boolean;
    projectId?: number;
  }): Promise<TestCase[]>;
  getTestCase(id: number): Promise<TestCase | undefined>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  updateTestCase(id: number, testCase: Partial<InsertTestCase>): Promise<TestCase | undefined>;
  
  // Test Cycles
  getTestCycles(projectId?: number): Promise<TestCycle[]>;
  getTestCycle(id: number): Promise<TestCycle | undefined>;
  createTestCycle(testCycle: InsertTestCycle): Promise<TestCycle>;
  updateTestCycle(id: number, testCycle: Partial<InsertTestCycle>): Promise<TestCycle | undefined>;
  
  // Test Cycle Items
  getTestCycleItems(cycleId: number): Promise<TestCycleItem[]>;
  getTestCycleItem(id: number): Promise<TestCycleItem | undefined>;
  createTestCycleItem(testCycleItem: InsertTestCycleItem): Promise<TestCycleItem>;
  updateTestCycleItem(id: number, testCycleItem: Partial<InsertTestCycleItem>): Promise<TestCycleItem | undefined>;
  addTestCasesToCycle(cycleId: number, testCaseIds: number[], suiteId?: number): Promise<TestCycleItem[]>;
  
  // Test Runs
  getTestRuns(cycleItemId: number): Promise<TestRun[]>;
  getTestRun(id: number): Promise<TestRun | undefined>;
  createTestRun(testRun: InsertTestRun): Promise<TestRun>;
  updateTestRun(id: number, testRun: Partial<InsertTestRun>): Promise<TestRun | undefined>;
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

  // Projects
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  // Maturity Dimensions
  async getMaturityDimensions(projectId?: number): Promise<MaturityDimension[]> {
    if (projectId) {
      return db
        .select()
        .from(maturityDimensions)
        .where(eq(maturityDimensions.projectId, projectId))
        .orderBy(asc(maturityDimensions.order));
    }
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
  async getMaturityLevels(dimensionId?: number, projectId?: number): Promise<MaturityLevel[]> {
    if (dimensionId && projectId) {
      return db
        .select()
        .from(maturityLevels)
        .where(
          and(
            eq(maturityLevels.dimensionId, dimensionId),
            eq(maturityLevels.projectId, projectId)
          )
        )
        .orderBy(asc(maturityLevels.level));
    } else if (dimensionId) {
      return db
        .select()
        .from(maturityLevels)
        .where(eq(maturityLevels.dimensionId, dimensionId))
        .orderBy(asc(maturityLevels.level));
    } else if (projectId) {
      return db
        .select()
        .from(maturityLevels)
        .where(eq(maturityLevels.projectId, projectId))
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
  async getMetrics(dimensionId?: number, projectId?: number): Promise<Metric[]> {
    if (dimensionId && projectId) {
      return db
        .select()
        .from(metrics)
        .where(
          and(
            eq(metrics.dimensionId, dimensionId),
            eq(metrics.projectId, projectId)
          )
        );
    } else if (dimensionId) {
      return db
        .select()
        .from(metrics)
        .where(eq(metrics.dimensionId, dimensionId));
    } else if (projectId) {
      return db
        .select()
        .from(metrics)
        .where(eq(metrics.projectId, projectId));
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
  async getRecommendations(dimensionId?: number, levelId?: number, projectId?: number): Promise<Recommendation[]> {
    const conditions = [];
    
    if (dimensionId) {
      conditions.push(eq(recommendations.dimensionId, dimensionId));
    }
    
    if (levelId) {
      conditions.push(eq(recommendations.levelId, levelId));
    }
    
    if (projectId) {
      conditions.push(eq(recommendations.projectId, projectId));
    }
    
    if (conditions.length > 0) {
      return db
        .select()
        .from(recommendations)
        .where(and(...conditions))
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
  async getAssessmentTemplates(dimensionId?: number, projectId?: number): Promise<AssessmentTemplate[]> {
    const conditions = [];
    
    if (dimensionId) {
      conditions.push(eq(assessmentTemplates.dimensionId, dimensionId));
    }
    
    if (projectId) {
      conditions.push(eq(assessmentTemplates.projectId, projectId));
    }
    
    if (conditions.length > 0) {
      return db
        .select()
        .from(assessmentTemplates)
        .where(and(...conditions))
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
    projectId?: number;
  }): Promise<Assessment[]> {
    // Collect conditions for the query
    const conditions = [];
    
    if (filters) {
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
      
      if (filters.projectId !== undefined) {
        conditions.push(eq(assessments.projectId, filters.projectId));
      }
    }
    
    // Apply conditions if any, otherwise return all records
    if (conditions.length > 0) {
      return db
        .select()
        .from(assessments)
        .where(and(...conditions))
        .orderBy(desc(assessments.createdAt));
    }
    
    return db
      .select()
      .from(assessments)
      .orderBy(desc(assessments.createdAt));
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

  // Test Suites
  async getTestSuites(filters?: {
    userId?: number;
    status?: string;
    priority?: string;
    projectArea?: string;
    aiGenerated?: boolean;
    projectId?: number;
  }): Promise<TestSuite[]> {
    // Collect conditions for the query
    const conditions = [];
    
    if (filters) {
      if (filters.userId !== undefined) {
        conditions.push(eq(testSuites.userId, filters.userId));
      }
      
      if (filters.status !== undefined) {
        conditions.push(eq(testSuites.status, filters.status));
      }
      
      if (filters.priority !== undefined) {
        conditions.push(eq(testSuites.priority, filters.priority));
      }
      
      if (filters.projectArea !== undefined) {
        conditions.push(eq(testSuites.projectArea, filters.projectArea));
      }
      
      if (filters.aiGenerated !== undefined) {
        conditions.push(eq(testSuites.aiGenerated, filters.aiGenerated));
      }
      
      if (filters.projectId !== undefined) {
        conditions.push(eq(testSuites.projectId, filters.projectId));
      }
    }
    
    // Apply conditions if any, otherwise return all records
    if (conditions.length > 0) {
      return db
        .select()
        .from(testSuites)
        .where(and(...conditions))
        .orderBy(desc(testSuites.createdAt));
    }
    
    return db
      .select()
      .from(testSuites)
      .orderBy(desc(testSuites.createdAt));
  }

  async getTestSuite(id: number): Promise<TestSuite | undefined> {
    const [testSuite] = await db.select().from(testSuites).where(eq(testSuites.id, id));
    return testSuite || undefined;
  }

  async createTestSuite(testSuite: InsertTestSuite): Promise<TestSuite> {
    const [newTestSuite] = await db.insert(testSuites).values(testSuite).returning();
    return newTestSuite;
  }

  async updateTestSuite(id: number, testSuite: Partial<InsertTestSuite>): Promise<TestSuite | undefined> {
    const [updatedTestSuite] = await db
      .update(testSuites)
      .set(testSuite)
      .where(eq(testSuites.id, id))
      .returning();
    return updatedTestSuite || undefined;
  }

  // Test Cases
  async getTestCases(filters?: {
    suiteId?: number;
    userId?: number;
    status?: string;
    priority?: string;
    severity?: string;
    aiGenerated?: boolean;
    automatable?: boolean;
    projectId?: number;
  }): Promise<TestCase[]> {
    // Collect conditions for the query
    const conditions = [];
    
    if (filters) {
      if (filters.suiteId !== undefined) {
        conditions.push(eq(testCases.suiteId, filters.suiteId));
      }
      
      if (filters.userId !== undefined) {
        conditions.push(eq(testCases.userId, filters.userId));
      }
      
      if (filters.status !== undefined) {
        conditions.push(eq(testCases.status, filters.status));
      }
      
      if (filters.priority !== undefined) {
        conditions.push(eq(testCases.priority, filters.priority));
      }
      
      if (filters.severity !== undefined) {
        conditions.push(eq(testCases.severity, filters.severity));
      }
      
      if (filters.aiGenerated !== undefined) {
        conditions.push(eq(testCases.aiGenerated, filters.aiGenerated));
      }
      
      if (filters.automatable !== undefined) {
        conditions.push(eq(testCases.automatable, filters.automatable));
      }
      
      if (filters.projectId !== undefined) {
        conditions.push(eq(testCases.projectId, filters.projectId));
      }
    }
    
    // Apply conditions if any, otherwise return all records
    if (conditions.length > 0) {
      return db
        .select()
        .from(testCases)
        .where(and(...conditions))
        .orderBy(desc(testCases.createdAt));
    }
    
    return db
      .select()
      .from(testCases)
      .orderBy(desc(testCases.createdAt));
  }

  async getTestCase(id: number): Promise<TestCase | undefined> {
    const [testCase] = await db.select().from(testCases).where(eq(testCases.id, id));
    return testCase || undefined;
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    const [newTestCase] = await db.insert(testCases).values(testCase).returning();
    return newTestCase;
  }

  async updateTestCase(id: number, testCase: Partial<InsertTestCase>): Promise<TestCase | undefined> {
    const [updatedTestCase] = await db
      .update(testCases)
      .set(testCase)
      .where(eq(testCases.id, id))
      .returning();
    return updatedTestCase || undefined;
  }
  
  // Test Cycles
  async getTestCycles(projectId?: number): Promise<TestCycle[]> {
    if (projectId) {
      return db
        .select()
        .from(testCycles)
        .where(eq(testCycles.projectId, projectId))
        .orderBy(desc(testCycles.createdAt));
    }
    return db
      .select()
      .from(testCycles)
      .orderBy(desc(testCycles.createdAt));
  }
  
  async getTestCycle(id: number): Promise<TestCycle | undefined> {
    const [cycle] = await db
      .select()
      .from(testCycles)
      .where(eq(testCycles.id, id));
    return cycle || undefined;
  }
  
  async createTestCycle(testCycle: InsertTestCycle): Promise<TestCycle> {
    const [newCycle] = await db
      .insert(testCycles)
      .values(testCycle)
      .returning();
    return newCycle;
  }
  
  async updateTestCycle(id: number, testCycle: Partial<InsertTestCycle>): Promise<TestCycle | undefined> {
    const [updatedCycle] = await db
      .update(testCycles)
      .set({ ...testCycle, updatedAt: new Date().toISOString() })
      .where(eq(testCycles.id, id))
      .returning();
    return updatedCycle || undefined;
  }
  
  // Test Cycle Items
  async getTestCycleItems(cycleId: number): Promise<TestCycleItem[]> {
    return db
      .select()
      .from(testCycleItems)
      .where(eq(testCycleItems.cycleId, cycleId))
      .orderBy(asc(testCycleItems.id));
  }
  
  async getTestCycleItem(id: number): Promise<TestCycleItem | undefined> {
    const [item] = await db
      .select()
      .from(testCycleItems)
      .where(eq(testCycleItems.id, id));
    return item || undefined;
  }
  
  async createTestCycleItem(testCycleItem: InsertTestCycleItem): Promise<TestCycleItem> {
    const [newItem] = await db
      .insert(testCycleItems)
      .values(testCycleItem)
      .returning();
    return newItem;
  }
  
  async updateTestCycleItem(id: number, testCycleItem: Partial<InsertTestCycleItem>): Promise<TestCycleItem | undefined> {
    const [updatedItem] = await db
      .update(testCycleItems)
      .set({ ...testCycleItem, updatedAt: new Date().toISOString() })
      .where(eq(testCycleItems.id, id))
      .returning();
    return updatedItem || undefined;
  }
  
  async addTestCasesToCycle(cycleId: number, testCaseIds: number[], suiteId?: number): Promise<TestCycleItem[]> {
    const items: InsertTestCycleItem[] = testCaseIds.map(testCaseId => ({
      cycleId,
      testCaseId,
      suiteId,
      status: 'not-run'
    }));
    
    return db
      .insert(testCycleItems)
      .values(items)
      .returning();
  }
  
  // Test Runs
  async getTestRuns(cycleItemId: number): Promise<TestRun[]> {
    return db
      .select()
      .from(testRuns)
      .where(eq(testRuns.cycleItemId, cycleItemId))
      .orderBy(desc(testRuns.executedAt));
  }
  
  async getTestRun(id: number): Promise<TestRun | undefined> {
    const [run] = await db
      .select()
      .from(testRuns)
      .where(eq(testRuns.id, id));
    return run || undefined;
  }
  
  async createTestRun(testRun: InsertTestRun): Promise<TestRun> {
    const [newRun] = await db
      .insert(testRuns)
      .values(testRun)
      .returning();
    
    // Update the corresponding cycle item status based on this test run
    if (newRun) {
      await db
        .update(testCycleItems)
        .set({ 
          status: newRun.status,
          updatedAt: new Date().toISOString()
        })
        .where(eq(testCycleItems.id, newRun.cycleItemId));
    }
    
    return newRun;
  }
  
  async updateTestRun(id: number, testRun: Partial<InsertTestRun>): Promise<TestRun | undefined> {
    const [updatedRun] = await db
      .update(testRuns)
      .set(testRun)
      .where(eq(testRuns.id, id))
      .returning();
    
    // Update the corresponding cycle item status if the status changed
    if (updatedRun && testRun.status) {
      await db
        .update(testCycleItems)
        .set({ 
          status: testRun.status,
          updatedAt: new Date().toISOString()
        })
        .where(eq(testCycleItems.id, updatedRun.cycleItemId));
    }
    
    return updatedRun || undefined;
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
    
    // Create sample projects if none exist
    const existingProjects = await this.getProjects();
    if (existingProjects.length === 0) {
      // Sample project 1
      await this.createProject({
        name: "E-Commerce Platform",
        description: "Modernized test suite for online store",
        jiraProjectId: "ECOM",
        jiraJql: "project = ECOM AND issuetype in (Bug, Test) AND status != Closed"
      });
      
      // Sample project 2
      await this.createProject({
        name: "Banking API",
        description: "Security and performance test automation",
        jiraProjectId: "BANK",
        jiraJql: "project = BANK AND component = API AND priority >= Medium"
      });
      
      // Sample project 3
      await this.createProject({
        name: "Healthcare Mobile App",
        description: "End-to-end testing framework",
        jiraProjectId: "HEALTH",
        jiraJql: "project = HEALTH AND labels = mobile"
      });
      
      // Sample project 4
      await this.createProject({
        name: "Cloud Infrastructure",
        description: "DevOps pipeline testing",
        jiraProjectId: "CLOUD",
        jiraJql: "project = CLOUD AND component in (AWS, Azure, GCP)"
      });
      
      // Sample project 5
      await this.createProject({
        name: "IoT Device Management",
        description: "Test automation for connected devices",
        jiraProjectId: "IOT",
        jiraJql: "project = IOT AND issuetype = Test"
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
      
      // Create sample test suites
      const apiTestSuite = await this.createTestSuite({
        name: "API Authentication Tests",
        description: "Test suite for API authentication endpoints",
        type: "integration",
        status: "active",
        priority: "high",
        projectArea: "authentication",
        userId: 1,
        aiGenerated: false,
        tags: ["api", "auth", "security"]
      });
      
      const uiTestSuite = await this.createTestSuite({
        name: "Dashboard UI Tests",
        description: "Functional tests for the dashboard user interface",
        type: "functional",
        status: "active",
        priority: "medium",
        projectArea: "dashboard",
        userId: 1,
        aiGenerated: false,
        tags: ["ui", "dashboard", "visualization"]
      });
      
      const aiGeneratedTestSuite = await this.createTestSuite({
        name: "Payment Processing Tests",
        description: "End-to-end tests for payment processing flows",
        type: "end-to-end",
        status: "active",
        priority: "high",
        projectArea: "payments",
        userId: 1,
        aiGenerated: true,
        tags: ["payments", "e2e", "financial"]
      });
      
      // Create sample test cases
      await this.createTestCase({
        title: "Verify user login with valid credentials",
        description: "Test that users can successfully log in with valid username and password",
        preconditions: "User exists in the system with valid credentials",
        steps: [
          { step: "Navigate to login page", expected: "Login form is displayed" },
          { step: "Enter valid username", expected: "Username is accepted" },
          { step: "Enter valid password", expected: "Password is accepted" },
          { step: "Click login button", expected: "User is authenticated and redirected to dashboard" }
        ],
        expectedResults: "User is successfully logged in and dashboard is displayed",
        priority: "high",
        severity: "critical",
        status: "passed",
        suiteId: apiTestSuite.id,
        userId: 1,
        aiGenerated: false,
        automatable: true,
        automationStatus: "automated"
      });
      
      await this.createTestCase({
        title: "Verify login failure with invalid password",
        description: "Test that login fails when user enters invalid password",
        preconditions: "User exists in the system",
        steps: [
          { step: "Navigate to login page", expected: "Login form is displayed" },
          { step: "Enter valid username", expected: "Username is accepted" },
          { step: "Enter invalid password", expected: "Password field accepts input" },
          { step: "Click login button", expected: "Error message is displayed" }
        ],
        expectedResults: "Login fails with appropriate error message",
        priority: "high",
        severity: "high",
        status: "passed",
        suiteId: apiTestSuite.id,
        userId: 1,
        aiGenerated: false,
        automatable: true,
        automationStatus: "automated"
      });
      
      await this.createTestCase({
        title: "Verify dashboard loads all widgets correctly",
        description: "Test that all dashboard widgets load and display data correctly",
        preconditions: "User is logged in",
        steps: [
          { step: "Navigate to dashboard page", expected: "Dashboard page loads" },
          { step: "Verify metrics widget", expected: "Metrics widget displays current data" },
          { step: "Verify recommendations panel", expected: "Recommendations are displayed" },
          { step: "Verify interactive mindmap", expected: "Mindmap is interactive and displays correctly" }
        ],
        expectedResults: "All dashboard widgets load and display data correctly",
        priority: "medium",
        severity: "normal",
        status: "in-progress",
        suiteId: uiTestSuite.id,
        userId: 1,
        aiGenerated: false,
        automatable: true,
        automationStatus: "not-automated"
      });
      
      await this.createTestCase({
        title: "Verify payment processing with valid credit card",
        description: "Test the complete payment flow with a valid credit card",
        preconditions: "User is logged in and has items in cart",
        steps: [
          { step: "Navigate to checkout page", expected: "Checkout page loads with correct items and total" },
          { step: "Enter shipping information", expected: "Shipping information is accepted" },
          { step: "Enter valid credit card details", expected: "Credit card information is accepted" },
          { step: "Confirm payment", expected: "Payment is processed successfully" },
          { step: "Verify order confirmation", expected: "Order confirmation page displays with correct information" }
        ],
        expectedResults: "Payment is processed successfully and order is confirmed",
        priority: "high",
        severity: "critical",
        status: "draft",
        suiteId: aiGeneratedTestSuite.id,
        userId: 1,
        aiGenerated: true,
        automatable: true,
        automationStatus: "not-automated",
        testData: {
          testCards: [
            { type: "Visa", number: "4111111111111111", expected: "success" },
            { type: "Mastercard", number: "5555555555554444", expected: "success" },
            { type: "American Express", number: "378282246310005", expected: "success" }
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
