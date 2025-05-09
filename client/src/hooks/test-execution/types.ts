import type { 
  TestCycle as SchemaTestCycle, 
  TestCycleItem as SchemaTestCycleItem, 
  TestRun as SchemaTestRun, 
  InsertTestCycle, 
  InsertTestCycleItem,
  InsertTestRun
} from "@shared/schema";

// Re-export types
export type TestCycle = SchemaTestCycle;
export type TestCycleItem = SchemaTestCycleItem;
export type TestRun = SchemaTestRun;
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