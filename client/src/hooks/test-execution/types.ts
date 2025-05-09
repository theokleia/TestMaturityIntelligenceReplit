import type { 
  TestCycle as SchemaTestCycle, 
  TestCycleItem as SchemaTestCycleItem, 
  TestRun as SchemaTestRun, 
  InsertTestCycle, 
  InsertTestCycleItem,
  InsertTestRun
} from "@shared/schema";

// Re-export types with some extensions
export type TestCycle = SchemaTestCycle;
export type TestCycleItem = SchemaTestCycleItem;

// Extended TestRun interface with explicit field types
export interface TestRun {
  id: number;
  cycleItemId: number;
  executedBy: number | null;
  executedAt: string | null;
  duration: number | null;
  status: string;
  notes: string | null;
  evidence: any;
  environment: string | null;
  version: string | null;
  stepResults: any;
  defects: any;
  tags: any;
  createdAt?: string; // Adding createdAt for compatibility
}

export type { InsertTestCycle, InsertTestCycleItem, InsertTestRun };

// Form types
export interface TestCycleFormValues {
  name: string;
  description?: string;
  status: string;
  startDate: Date;
  endDate?: Date;
}

export interface TestRunFormValues {
  status: string;
  notes?: string;
  steps?: any;
}