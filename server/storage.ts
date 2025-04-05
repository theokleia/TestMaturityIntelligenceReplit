import { 
  users, type User, type InsertUser,
  maturityDimensions, type MaturityDimension, type InsertMaturityDimension,
  maturityLevels, type MaturityLevel, type InsertMaturityLevel,
  metrics, type Metric, type InsertMetric,
  recommendations, type Recommendation, type InsertRecommendation
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private maturityDimensions: Map<number, MaturityDimension>;
  private maturityLevels: Map<number, MaturityLevel>;
  private metrics: Map<number, Metric>;
  private recommendations: Map<number, Recommendation>;
  
  private currentUserId: number;
  private currentDimensionId: number;
  private currentLevelId: number;
  private currentMetricId: number;
  private currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.maturityDimensions = new Map();
    this.maturityLevels = new Map();
    this.metrics = new Map();
    this.recommendations = new Map();
    
    this.currentUserId = 1;
    this.currentDimensionId = 1;
    this.currentLevelId = 1;
    this.currentMetricId = 1;
    this.currentRecommendationId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Maturity Dimensions
  async getMaturityDimensions(): Promise<MaturityDimension[]> {
    return Array.from(this.maturityDimensions.values()).sort((a, b) => a.order - b.order);
  }

  async getMaturityDimension(id: number): Promise<MaturityDimension | undefined> {
    return this.maturityDimensions.get(id);
  }

  async createMaturityDimension(dimension: InsertMaturityDimension): Promise<MaturityDimension> {
    const id = this.currentDimensionId++;
    const newDimension: MaturityDimension = { ...dimension, id };
    this.maturityDimensions.set(id, newDimension);
    return newDimension;
  }

  async updateMaturityDimension(id: number, dimension: Partial<InsertMaturityDimension>): Promise<MaturityDimension | undefined> {
    const existingDimension = this.maturityDimensions.get(id);
    if (!existingDimension) return undefined;
    
    const updatedDimension = { ...existingDimension, ...dimension };
    this.maturityDimensions.set(id, updatedDimension);
    return updatedDimension;
  }

  // Maturity Levels
  async getMaturityLevels(dimensionId?: number): Promise<MaturityLevel[]> {
    const levels = Array.from(this.maturityLevels.values());
    if (dimensionId) {
      return levels.filter(level => level.dimensionId === dimensionId)
        .sort((a, b) => a.level - b.level);
    }
    return levels.sort((a, b) => a.level - b.level);
  }

  async getMaturityLevel(id: number): Promise<MaturityLevel | undefined> {
    return this.maturityLevels.get(id);
  }

  async createMaturityLevel(level: InsertMaturityLevel): Promise<MaturityLevel> {
    const id = this.currentLevelId++;
    const newLevel: MaturityLevel = { ...level, id };
    this.maturityLevels.set(id, newLevel);
    return newLevel;
  }

  async updateMaturityLevel(id: number, level: Partial<InsertMaturityLevel>): Promise<MaturityLevel | undefined> {
    const existingLevel = this.maturityLevels.get(id);
    if (!existingLevel) return undefined;
    
    const updatedLevel = { ...existingLevel, ...level };
    this.maturityLevels.set(id, updatedLevel);
    return updatedLevel;
  }

  // Metrics
  async getMetrics(dimensionId?: number): Promise<Metric[]> {
    const allMetrics = Array.from(this.metrics.values());
    if (dimensionId) {
      return allMetrics.filter(metric => metric.dimensionId === dimensionId);
    }
    return allMetrics;
  }

  async getMetric(id: number): Promise<Metric | undefined> {
    return this.metrics.get(id);
  }

  async createMetric(metric: InsertMetric): Promise<Metric> {
    const id = this.currentMetricId++;
    const newMetric: Metric = { ...metric, id };
    this.metrics.set(id, newMetric);
    return newMetric;
  }

  async updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined> {
    const existingMetric = this.metrics.get(id);
    if (!existingMetric) return undefined;
    
    const updatedMetric = { ...existingMetric, ...metric };
    this.metrics.set(id, updatedMetric);
    return updatedMetric;
  }

  // Recommendations
  async getRecommendations(dimensionId?: number, levelId?: number): Promise<Recommendation[]> {
    const allRecommendations = Array.from(this.recommendations.values());
    
    if (dimensionId && levelId) {
      return allRecommendations.filter(rec => 
        rec.dimensionId === dimensionId && rec.levelId === levelId);
    }
    
    if (dimensionId) {
      return allRecommendations.filter(rec => rec.dimensionId === dimensionId);
    }
    
    if (levelId) {
      return allRecommendations.filter(rec => rec.levelId === levelId);
    }
    
    return allRecommendations;
  }

  async getRecommendation(id: number): Promise<Recommendation | undefined> {
    return this.recommendations.get(id);
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentRecommendationId++;
    const newRecommendation: Recommendation = { ...recommendation, id };
    this.recommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async updateRecommendation(id: number, recommendation: Partial<InsertRecommendation>): Promise<Recommendation | undefined> {
    const existingRecommendation = this.recommendations.get(id);
    if (!existingRecommendation) return undefined;
    
    const updatedRecommendation = { ...existingRecommendation, ...recommendation };
    this.recommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  // Initialize with sample data
  private initSampleData() {
    // Create Admin user
    this.createUser({
      username: "admin",
      password: "adminpass",
      fullName: "Tecla Reitzi",
      email: "teclareitzi@example.com",
      role: "admin"
    });

    // Create maturity dimensions
    const automationIntelligence = this.createMaturityDimension({
      name: "Automation Intelligence",
      description: "Enhance testing efficiency through intelligent test automation strategies",
      color: "#2E75FF", // Blue
      order: 1
    });

    const devTestSynergy = this.createMaturityDimension({
      name: "Development-Testing Synergy",
      description: "Strengthen collaboration between development and testing teams",
      color: "#8A56FF", // Purple
      order: 2
    });

    const aiQuality = this.createMaturityDimension({
      name: "AI-Augment Quality Engineering",
      description: "Leverage AI to enhance quality engineering practices",
      color: "#2FFFDD", // Teal
      order: 3
    });

    const continuousQuality = this.createMaturityDimension({
      name: "Continuous Quality Engineering",
      description: "Build quality into the continuous delivery pipeline",
      color: "#FFBB3A", // Orange
      order: 4
    });

    // Create maturity levels for Automation Intelligence
    const automationDimId = 1; // First dimension
    this.createMaturityLevel({
      dimensionId: automationDimId,
      level: 1,
      name: "Foundation",
      description: "Basic processes established",
      status: "completed"
    });

    this.createMaturityLevel({
      dimensionId: automationDimId,
      level: 2,
      name: "Integration",
      description: "Automated tests integrated",
      status: "in_progress"
    });

    this.createMaturityLevel({
      dimensionId: automationDimId,
      level: 3,
      name: "Optimization",
      description: "Continuous improvement of processes",
      status: "in_progress"
    });

    this.createMaturityLevel({
      dimensionId: automationDimId,
      level: 4,
      name: "Autonomy",
      description: "Self-optimizing processes",
      status: "not_started"
    });

    // Create metrics
    this.createMetric({
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

    this.createMetric({
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

    this.createMetric({
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
    this.createRecommendation({
      title: "Testing Efficiency Opportunity",
      description: "Based on analysis of your test execution patterns over the last 30 days, we've identified that 23% of your UI tests are redundant with your API tests. Consider refactoring these tests to improve execution time.",
      type: "insight",
      priority: "high",
      dimensionId: 1,
      levelId: 3,
      actions: ["View Details", "Dismiss", "Schedule Review"],
      status: "active"
    });

    this.createRecommendation({
      title: "AI Recommendation",
      description: "Based on your recent test results, consider implementing automated regression tests for your API endpoints to improve coverage.",
      type: "recommendation",
      priority: "normal",
      dimensionId: 1,
      levelId: 2,
      actions: ["Implement", "Dismiss"],
      status: "active"
    });
  }
}

export const storage = new MemStorage();
