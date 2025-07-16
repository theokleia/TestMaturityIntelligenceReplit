import { TestSuiteCard } from "./TestSuiteCard";

interface TestSuite {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  projectArea: string;
  coverage?: string;
  userId: number | null;
  aiGenerated: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  projectId: number;
}

interface TestSuiteGridProps {
  testSuites: TestSuite[];
  getTestCasesCount: (suiteId: number) => number;
  onViewSuite: (suite: TestSuite) => void;
  onDeleteSuite: (suite: TestSuite) => void;
  onGenerateTestCases: (suite: TestSuite) => void;
  onGenerateCoverage: (suite: TestSuite) => void;
  onExportSuite: (suite: TestSuite) => void;
  onImportToSuite: (suite: TestSuite) => void;
}

export function TestSuiteGrid({
  testSuites,
  getTestCasesCount,
  onViewSuite,
  onDeleteSuite,
  onGenerateTestCases,
  onGenerateCoverage,
  onExportSuite,
  onImportToSuite
}: TestSuiteGridProps) {
  if (testSuites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted mb-4">No test suites found</div>
        <p className="text-sm text-text-muted">
          Create your first test suite or use AI to generate comprehensive test coverage.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testSuites.map((suite) => (
        <TestSuiteCard
          key={suite.id}
          suite={suite}
          testCasesCount={getTestCasesCount(suite.id)}
          onViewSuite={onViewSuite}
          onDeleteSuite={onDeleteSuite}
          onGenerateTestCases={onGenerateTestCases}
          onGenerateCoverage={onGenerateCoverage}
          onExportSuite={onExportSuite}
          onImportToSuite={onImportToSuite}
        />
      ))}
    </div>
  );
}