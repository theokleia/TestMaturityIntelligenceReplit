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
  testRuns, type TestRun, type InsertTestRun,
  documents, type Document, type InsertDocument,
  globalSettings, type GlobalSetting, type InsertGlobalSetting,
  jiraTickets, type JiraTicket, type InsertJiraTicket,
  jiraSyncLogs, type JiraSyncLog, type InsertJiraSyncLog,
  testCaseJiraLinks, type TestCaseJiraLink, type InsertTestCaseJiraLink,
  aiAssessments, type AiAssessment, type InsertAiAssessment,
  aiAssessmentActionItems, type AiAssessmentActionItem, type InsertAiAssessmentActionItem,
  aiAssessmentHistory, type AiAssessmentHistory, type InsertAiAssessmentHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, inArray, lt, gte, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProjects(status?: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  archiveProject(id: number): Promise<Project | undefined>;
  unarchiveProject(id: number): Promise<Project | undefined>;

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
  deleteTestSuite(id: number): Promise<{ deletedSuite: boolean; deletedTestCases: number }>;

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
  getTestCasesBySuiteId(suiteId: number): Promise<TestCase[]>;
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
  removeTestCycleItem(id: number): Promise<boolean>;
  addTestCasesToCycle(cycleId: number, testCaseIds: number[], suiteId?: number): Promise<TestCycleItem[]>;
  
  // Test Runs
  getTestRuns(cycleItemId: number): Promise<TestRun[]>;
  getTestRun(id: number): Promise<TestRun | undefined>;
  getTestRunsByTestCase(testCaseId: number): Promise<TestRun[]>;
  getTestRunsByCycleItem(cycleItemId: number): Promise<TestRun[]>;
  createTestRun(testRun: InsertTestRun): Promise<TestRun>;
  updateTestRun(id: number, testRun: Partial<InsertTestRun>): Promise<TestRun | undefined>;
  
  // Documents
  getDocuments(filters?: {
    type?: string;
    status?: string;
    createdBy?: number;
    projectId?: number;
  }): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Global Settings
  getGlobalSettings(category?: string): Promise<GlobalSetting[]>;
  getGlobalSetting(key: string): Promise<GlobalSetting | undefined>;
  createGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting>;
  updateGlobalSetting(id: number, setting: Partial<InsertGlobalSetting>): Promise<GlobalSetting | undefined>;
  deleteGlobalSetting(id: number): Promise<boolean>;
  
  // Jira Tickets
  getJiraTicketsByProject(projectId: number): Promise<JiraTicket[]>;
  getJiraTickets(projectId: number): Promise<JiraTicket[]>; // Alias for getJiraTicketsByProject
  getJiraTicket(id: number): Promise<JiraTicket | undefined>;
  getJiraTicketByKey(jiraKey: string, projectId: number): Promise<JiraTicket | undefined>;
  createJiraTicket(ticket: InsertJiraTicket): Promise<JiraTicket>;
  updateJiraTicket(id: number, ticket: Partial<InsertJiraTicket>): Promise<JiraTicket | undefined>;
  softDeleteJiraTicket(id: number): Promise<boolean>;
  
  // Jira Sync Logs
  getJiraSyncLogs(projectId: number): Promise<JiraSyncLog[]>;
  createJiraSyncLog(log: InsertJiraSyncLog): Promise<number>;
  updateJiraSyncLog(id: number, log: Partial<JiraSyncLog>): Promise<JiraSyncLog | undefined>;
  getLastSuccessfulSync(projectId: number): Promise<JiraSyncLog | undefined>;
  
  // Test Case Jira Links
  getTestCaseJiraLinks(testCaseId: number): Promise<TestCaseJiraLink[]>;
  createTestCaseJiraLink(link: InsertTestCaseJiraLink): Promise<TestCaseJiraLink>;
  deleteTestCaseJiraLink(id: number): Promise<boolean>;

  // AI Assessments
  getAiAssessments(filters?: {
    projectId?: number;
    assessmentType?: string;
    status?: string;
  }): Promise<AiAssessment[]>;
  getAiAssessment(id: number): Promise<AiAssessment | undefined>;
  createAiAssessment(assessment: InsertAiAssessment): Promise<AiAssessment>;
  updateAiAssessment(id: number, assessment: Partial<InsertAiAssessment>): Promise<AiAssessment | undefined>;

  // AI Assessment Action Items
  getAiAssessmentActionItems(filters?: {
    assessmentId?: number;
    projectId?: number;
    status?: string;
    assignedTo?: number;
  }): Promise<AiAssessmentActionItem[]>;
  getAiAssessmentActionItem(id: number): Promise<AiAssessmentActionItem | undefined>;
  createAiAssessmentActionItem(actionItem: InsertAiAssessmentActionItem): Promise<AiAssessmentActionItem>;
  updateAiAssessmentActionItem(id: number, actionItem: Partial<InsertAiAssessmentActionItem>): Promise<AiAssessmentActionItem | undefined>;

  // AI Assessment History
  getAiAssessmentHistory(filters?: {
    projectId?: number;
    assessmentType?: string;
  }): Promise<AiAssessmentHistory[]>;
  createAiAssessmentHistory(history: InsertAiAssessmentHistory): Promise<AiAssessmentHistory>;
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
  async getProjects(status?: string): Promise<Project[]> {
    // If status is provided, filter projects by status
    if (status) {
      return db.select()
        .from(projects)
        .where(eq(projects.status, status))
        .orderBy(desc(projects.createdAt));
    }
    // Otherwise return all projects
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    // Ensure new projects are active by default
    const projectWithDefaults = {
      ...project,
      status: project.status || 'active'
    };
    const [newProject] = await db.insert(projects).values(projectWithDefaults).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ 
        ...project, 
        updatedAt: new Date().toISOString() 
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    try {
      await db
        .delete(projects)
        .where(eq(projects.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  }
  
  async archiveProject(id: number): Promise<Project | undefined> {
    return this.updateProject(id, { status: 'archived' });
  }
  
  async unarchiveProject(id: number): Promise<Project | undefined> {
    return this.updateProject(id, { status: 'active' });
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
      
      // Removed userId filter to allow all users to see all assessments
      
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
      // Removed userId filter to allow all users to see all test suites
      
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

  async deleteTestSuite(id: number): Promise<{ deletedSuite: boolean; deletedTestCases: number }> {
    return await db.transaction(async (tx) => {
      try {
        // First, count the test cases that will be deleted
        const relatedTestCases = await tx
          .select()
          .from(testCases)
          .where(eq(testCases.suiteId, id));
        
        const deletedTestCasesCount = relatedTestCases.length;
        
        // Delete Jira links for all test cases in this suite first (to handle foreign key constraints)
        if (deletedTestCasesCount > 0) {
          for (const testCase of relatedTestCases) {
            await tx.delete(testCaseJiraLinks).where(eq(testCaseJiraLinks.testCaseId, testCase.id));
          }
          
          // Then delete all related test cases
          await tx.delete(testCases).where(eq(testCases.suiteId, id));
        }
        
        // Finally delete the test suite
        const deleteResult = await tx.delete(testSuites).where(eq(testSuites.id, id));
        
        return {
          deletedSuite: true,
          deletedTestCases: deletedTestCasesCount
        };
      } catch (error) {
        console.error('Error deleting test suite:', error);
        return {
          deletedSuite: false,
          deletedTestCases: 0
        };
      }
    });
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
      
      // Removed userId filter to allow all users to see all test cases
      
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
    
    // Get base test cases
    let baseTestCases;
    if (conditions.length > 0) {
      baseTestCases = await db
        .select()
        .from(testCases)
        .where(and(...conditions))
        .orderBy(desc(testCases.createdAt));
    } else {
      baseTestCases = await db
        .select()
        .from(testCases)
        .orderBy(desc(testCases.createdAt));
    }
    
    // Enhance test cases with Jira ticket information
    const enhancedTestCases = await Promise.all(
      baseTestCases.map(async (testCase) => {
        try {
          const jiraTicketResults = await db
            .select({
              jiraKey: jiraTickets.jiraKey,
              summary: jiraTickets.summary
            })
            .from(testCaseJiraLinks)
            .innerJoin(jiraTickets, eq(testCaseJiraLinks.jiraTicketId, jiraTickets.id))
            .where(eq(testCaseJiraLinks.testCaseId, testCase.id));
          
          const jiraTicketsData = jiraTicketResults.map(result => ({
            key: result.jiraKey,
            summary: result.summary || 'No summary'
          }));
          
          const jiraTicketIds = jiraTicketsData.map(ticket => ticket.key);
          
          return {
            ...testCase,
            jiraTickets: jiraTicketsData,
            jiraTicketIds
          };
        } catch (error) {
          console.error(`Error fetching Jira tickets for test case ${testCase.id}:`, error);
          return {
            ...testCase,
            jiraTickets: [],
            jiraTicketIds: []
          };
        }
      })
    );
    
    return enhancedTestCases;
  }

  // Helper method to get Jira tickets for a test case
  async getJiraTicketsForTestCase(testCaseId: number): Promise<Array<{key: string, summary: string}>> {
    try {
      const jiraTicketResults = await db
        .select({
          jiraKey: jiraTickets.jiraKey,
          summary: jiraTickets.summary
        })
        .from(testCaseJiraLinks)
        .innerJoin(jiraTickets, eq(testCaseJiraLinks.jiraTicketId, jiraTickets.id))
        .where(eq(testCaseJiraLinks.testCaseId, testCaseId));
      
      return jiraTicketResults.map(result => ({
        key: result.jiraKey,
        summary: result.summary || 'No summary'
      }));
    } catch (error) {
      console.error(`Error fetching Jira tickets for test case ${testCaseId}:`, error);
      return [];
    }
  }

  async getTestCasesBySuiteId(suiteId: number): Promise<TestCase[]> {
    return db
      .select()
      .from(testCases)
      .where(eq(testCases.suiteId, suiteId))
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
      .set({ ...testCycle, updatedAt: new Date() })
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
  
  async removeTestCycleItem(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(testCycleItems)
        .where(eq(testCycleItems.id, id));
      
      // In Drizzle ORM with PostgreSQL, the operation was successful if no error was thrown
      return true;
    } catch (error) {
      console.error("Error removing test cycle item:", error);
      return false;
    }
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
  
  async addTestSuiteToCycle(cycleId: number, suiteId: number): Promise<TestCycleItem[]> {
    // Get all test cases from the specified suite
    const testCasesInSuite = await db
      .select()
      .from(testCases)
      .where(eq(testCases.suiteId, suiteId));
    
    // If no test cases found, return empty array
    if (!testCasesInSuite.length) {
      return [];
    }
    
    // Extract the test case IDs
    const testCaseIds = testCasesInSuite.map(tc => tc.id);
    
    // Add all test cases to the cycle
    return this.addTestCasesToCycle(cycleId, testCaseIds, suiteId);
  }

  async removeTestCaseFromCycle(itemId: number): Promise<boolean> {
    try {
      await db
        .delete(testCycleItems)
        .where(eq(testCycleItems.id, itemId));
      return true;
    } catch (error) {
      console.error("Error removing test case from cycle:", error);
      return false;
    }
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
  
  async getTestRunsByTestCase(testCaseId: number): Promise<TestRun[]> {
    // First get all cycle items that reference this test case
    const cycleItems = await db
      .select()
      .from(testCycleItems)
      .where(eq(testCycleItems.testCaseId, testCaseId));
    
    if (!cycleItems.length) {
      return [];
    }
    
    // Get the IDs of all cycle items
    const cycleItemIds = cycleItems.map(item => item.id);
    
    // Get all runs for these cycle items
    return db
      .select({
        run: testRuns,
        cycleItem: testCycleItems,
        cycle: testCycles
      })
      .from(testRuns)
      .innerJoin(testCycleItems, eq(testRuns.cycleItemId, testCycleItems.id))
      .innerJoin(testCycles, eq(testCycleItems.cycleId, testCycles.id))
      .where(inArray(testRuns.cycleItemId, cycleItemIds))
      .orderBy(desc(testRuns.executedAt))
      .then(results => results.map(r => ({
        ...r.run,
        cycleName: r.cycle.name,
        cycleId: r.cycle.id
      })));
  }

  async getTestRunsByCycleItem(cycleItemId: number): Promise<TestRun[]> {
    return db
      .select()
      .from(testRuns)
      .where(eq(testRuns.cycleItemId, cycleItemId))
      .orderBy(desc(testRuns.executedAt));
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

  // Project Documents for Documenter AI
  async getDocuments(filters?: {
    type?: string;
    status?: string;
    createdBy?: number;
    projectId?: number;
  }): Promise<Document[]> {
    let conditions: any[] = [];
    
    if (filters) {
      if (filters.type) {
        conditions.push(eq(documents.type, filters.type));
      }
      
      if (filters.status) {
        conditions.push(eq(documents.status, filters.status));
      }
      
      if (filters.createdBy) {
        conditions.push(eq(documents.createdBy, filters.createdBy));
      }
      
      if (filters.projectId) {
        conditions.push(eq(documents.projectId, filters.projectId));
      }
    }
    
    // Apply conditions if any, otherwise return all records
    if (conditions.length > 0) {
      return db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.updatedAt));
    }
    
    return db
      .select()
      .from(documents)
      .orderBy(desc(documents.updatedAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({
        ...document,
        updatedAt: new Date().toISOString()
      })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    try {
      await db
        .delete(documents)
        .where(eq(documents.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }

  // Global Settings implementation
  async getGlobalSettings(category?: string): Promise<GlobalSetting[]> {
    if (category) {
      return db.select()
        .from(globalSettings)
        .where(eq(globalSettings.category, category))
        .orderBy(asc(globalSettings.key));
    }
    return db.select().from(globalSettings).orderBy(asc(globalSettings.key));
  }

  async getGlobalSetting(key: string): Promise<GlobalSetting | undefined> {
    const [setting] = await db.select()
      .from(globalSettings)
      .where(eq(globalSettings.key, key));
    return setting || undefined;
  }

  async createGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting> {
    const [result] = await db.insert(globalSettings)
      .values(setting)
      .returning();
    return result;
  }

  async updateGlobalSetting(id: number, setting: Partial<InsertGlobalSetting>): Promise<GlobalSetting | undefined> {
    const [result] = await db.update(globalSettings)
      .set({
        ...setting,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(globalSettings.id, id))
      .returning();
    return result || undefined;
  }

  async deleteGlobalSetting(id: number): Promise<boolean> {
    try {
      await db.delete(globalSettings)
        .where(eq(globalSettings.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting global setting:", error);
      return false;
    }
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
    
    // Initialize global settings for AI integration
    try {
      const openaiKeyExists = await this.getGlobalSetting("openai_api_key");
      if (!openaiKeyExists) {
        await this.createGlobalSetting({
          key: "openai_api_key",
          value: process.env.OPENAI_API_KEY || "",
          description: "OpenAI API key for AI features",
          category: "AI"
        });
      }
    } catch (error) {
      console.warn("Failed to initialize OpenAI key setting, table may not exist yet:", error);
    }
    
    try {
      const openaiModelExists = await this.getGlobalSetting("openai_model");
      if (!openaiModelExists) {
        await this.createGlobalSetting({
          key: "openai_model",
          value: "gpt-4o",
          description: "OpenAI model to use for general AI features",
          category: "AI"
        });
      }
    } catch (error) {
      console.warn("Failed to initialize OpenAI model setting, table may not exist yet:", error);
    }
    
    try {
      const anthropicKeyExists = await this.getGlobalSetting("anthropic_api_key");
      if (!anthropicKeyExists) {
        await this.createGlobalSetting({
          key: "anthropic_api_key",
          value: process.env.ANTHROPIC_API_KEY || "",
          description: "Anthropic API key for document generation",
          category: "AI"
        });
      }
    } catch (error) {
      console.warn("Failed to initialize Anthropic API key setting, table may not exist yet:", error);
    }
    
    try {
      const anthropicModelExists = await this.getGlobalSetting("anthropic_model");
      if (!anthropicModelExists) {
        await this.createGlobalSetting({
          key: "anthropic_model",
          value: "claude-3-7-sonnet-20250219",
          description: "Anthropic model to use for document generation",
          category: "AI"
        });
      }
    } catch (error) {
      console.warn("Failed to initialize Anthropic model setting, table may not exist yet:", error);
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

  // Jira Tickets
  async getJiraTicketsByProject(projectId: number): Promise<JiraTicket[]> {
    return db.select()
      .from(jiraTickets)
      .where(and(eq(jiraTickets.projectId, projectId), eq(jiraTickets.isDeleted, false)))
      .orderBy(desc(jiraTickets.jiraUpdatedAt));
  }

  // Alias for getJiraTicketsByProject
  async getJiraTickets(projectId: number): Promise<JiraTicket[]> {
    return this.getJiraTicketsByProject(projectId);
  }

  async getJiraTicket(id: number): Promise<JiraTicket | undefined> {
    const [ticket] = await db.select().from(jiraTickets).where(eq(jiraTickets.id, id));
    return ticket || undefined;
  }

  async createJiraTicket(ticket: InsertJiraTicket): Promise<JiraTicket> {
    const [newTicket] = await db.insert(jiraTickets).values(ticket).returning();
    return newTicket;
  }

  async updateJiraTicket(id: number, ticket: Partial<InsertJiraTicket>): Promise<JiraTicket | undefined> {
    const [updatedTicket] = await db
      .update(jiraTickets)
      .set({ ...ticket, updatedAt: new Date().toISOString() })
      .where(eq(jiraTickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async softDeleteJiraTicket(id: number): Promise<boolean> {
    const result = await db
      .update(jiraTickets)
      .set({ isDeleted: true, updatedAt: new Date().toISOString() })
      .where(eq(jiraTickets.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Jira Sync Logs
  async getJiraSyncLogs(projectId: number): Promise<JiraSyncLog[]> {
    return db.select()
      .from(jiraSyncLogs)
      .where(eq(jiraSyncLogs.projectId, projectId))
      .orderBy(desc(jiraSyncLogs.startedAt))
      .limit(50);
  }

  async createJiraSyncLog(log: InsertJiraSyncLog): Promise<number> {
    const [newLog] = await db.insert(jiraSyncLogs).values(log).returning({ id: jiraSyncLogs.id });
    return newLog.id;
  }

  async updateJiraSyncLog(id: number, log: Partial<JiraSyncLog>): Promise<JiraSyncLog | undefined> {
    const [updatedLog] = await db
      .update(jiraSyncLogs)
      .set(log)
      .where(eq(jiraSyncLogs.id, id))
      .returning();
    return updatedLog || undefined;
  }

  async getLastSuccessfulSync(projectId: number): Promise<JiraSyncLog | undefined> {
    const [lastSync] = await db.select()
      .from(jiraSyncLogs)
      .where(and(
        eq(jiraSyncLogs.projectId, projectId),
        eq(jiraSyncLogs.status, 'success')
      ))
      .orderBy(desc(jiraSyncLogs.completedAt))
      .limit(1);
    return lastSync || undefined;
  }

  // Test Case Jira Links
  async getTestCaseJiraLinks(testCaseId: number): Promise<TestCaseJiraLink[]> {
    return db.select()
      .from(testCaseJiraLinks)
      .where(eq(testCaseJiraLinks.testCaseId, testCaseId));
  }

  async createTestCaseJiraLink(link: InsertTestCaseJiraLink): Promise<TestCaseJiraLink> {
    const [newLink] = await db.insert(testCaseJiraLinks).values(link).returning();
    return newLink;
  }

  async getJiraTicketByKey(jiraKey: string, projectId: number): Promise<JiraTicket | undefined> {
    const [ticket] = await db.select()
      .from(jiraTickets)
      .where(and(
        eq(jiraTickets.jiraKey, jiraKey),
        eq(jiraTickets.projectId, projectId)
      ))
      .limit(1);
    return ticket || undefined;
  }

  async createTestCaseJiraLinkByKey(testCaseId: number, jiraKey: string, projectId: number, linkType: string = "covers"): Promise<TestCaseJiraLink | null> {
    // First, find the Jira ticket by key
    const jiraTicket = await this.getJiraTicketByKey(jiraKey, projectId);
    
    if (!jiraTicket) {
      console.log(`Jira ticket ${jiraKey} not found in database - skipping link creation`);
      return null;
    }

    // Create the link using the database ticket ID
    const [newLink] = await db.insert(testCaseJiraLinks).values({
      testCaseId,
      jiraTicketId: jiraTicket.id,
      linkType
    }).returning();
    
    return newLink;
  }

  async deleteTestCaseJiraLink(id: number): Promise<boolean> {
    const result = await db.delete(testCaseJiraLinks).where(eq(testCaseJiraLinks.id, id));
    return (result.rowCount || 0) > 0;
  }

  // AI Assessments
  async getAiAssessments(filters?: {
    projectId?: number;
    assessmentType?: string;
    status?: string;
  }): Promise<AiAssessment[]> {
    let query = db.select().from(aiAssessments);
    
    if (filters) {
      const conditions = [];
      if (filters.projectId) conditions.push(eq(aiAssessments.projectId, filters.projectId));
      if (filters.assessmentType) conditions.push(eq(aiAssessments.assessmentType, filters.assessmentType));
      if (filters.status) conditions.push(eq(aiAssessments.status, filters.status));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(aiAssessments.createdAt));
  }

  async getAiAssessment(id: number): Promise<AiAssessment | undefined> {
    const [assessment] = await db.select().from(aiAssessments).where(eq(aiAssessments.id, id));
    return assessment || undefined;
  }

  async createAiAssessment(assessment: InsertAiAssessment): Promise<AiAssessment> {
    const [newAssessment] = await db.insert(aiAssessments).values(assessment).returning();
    return newAssessment;
  }

  async updateAiAssessment(id: number, assessment: Partial<InsertAiAssessment>): Promise<AiAssessment | undefined> {
    const [updatedAssessment] = await db
      .update(aiAssessments)
      .set({ ...assessment, updatedAt: new Date().toISOString() })
      .where(eq(aiAssessments.id, id))
      .returning();
    return updatedAssessment || undefined;
  }

  // AI Assessment Action Items
  async getAiAssessmentActionItems(filters?: {
    assessmentId?: number;
    projectId?: number;
    status?: string;
    assignedTo?: number;
  }): Promise<AiAssessmentActionItem[]> {
    let query = db.select().from(aiAssessmentActionItems);
    
    if (filters) {
      const conditions = [];
      if (filters.assessmentId) conditions.push(eq(aiAssessmentActionItems.assessmentId, filters.assessmentId));
      if (filters.projectId) conditions.push(eq(aiAssessmentActionItems.projectId, filters.projectId));
      if (filters.status) conditions.push(eq(aiAssessmentActionItems.status, filters.status));
      if (filters.assignedTo) conditions.push(eq(aiAssessmentActionItems.assignedTo, filters.assignedTo));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(aiAssessmentActionItems.createdAt));
  }

  async getAiAssessmentActionItem(id: number): Promise<AiAssessmentActionItem | undefined> {
    const [actionItem] = await db.select().from(aiAssessmentActionItems).where(eq(aiAssessmentActionItems.id, id));
    return actionItem || undefined;
  }

  async createAiAssessmentActionItem(actionItem: InsertAiAssessmentActionItem): Promise<AiAssessmentActionItem> {
    const [newActionItem] = await db.insert(aiAssessmentActionItems).values(actionItem).returning();
    return newActionItem;
  }

  async updateAiAssessmentActionItem(id: number, actionItem: Partial<InsertAiAssessmentActionItem>): Promise<AiAssessmentActionItem | undefined> {
    const [updatedActionItem] = await db
      .update(aiAssessmentActionItems)
      .set({ ...actionItem, updatedAt: new Date().toISOString() })
      .where(eq(aiAssessmentActionItems.id, id))
      .returning();
    return updatedActionItem || undefined;
  }

  // AI Assessment History
  async getAiAssessmentHistory(filters?: {
    projectId?: number;
    assessmentType?: string;
  }): Promise<AiAssessmentHistory[]> {
    let query = db.select().from(aiAssessmentHistory);
    
    if (filters) {
      const conditions = [];
      if (filters.projectId) conditions.push(eq(aiAssessmentHistory.projectId, filters.projectId));
      if (filters.assessmentType) conditions.push(eq(aiAssessmentHistory.assessmentType, filters.assessmentType));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(aiAssessmentHistory.createdAt));
  }

  async createAiAssessmentHistory(history: InsertAiAssessmentHistory): Promise<AiAssessmentHistory> {
    const [newHistory] = await db.insert(aiAssessmentHistory).values(history).returning();
    return newHistory;
  }
}

// Create and initialize the database storage
const storage = new DatabaseStorage();
// Initialize sample data
storage.initSampleData().catch(console.error);

export { storage };
