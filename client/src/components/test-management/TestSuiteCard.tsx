import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  FileText, 
  Calendar, 
  Clock, 
  FileOutput, 
  FileUp, 
  Plus, 
  Brain, 
  Bot,
  Trash2,
  Eye
} from "lucide-react";

interface TestSuite {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  projectArea: string;
  userId: number | null;
  aiGenerated: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  projectId: number;
}

interface TestSuiteCardProps {
  suite: TestSuite;
  testCasesCount: number;
  onViewSuite: (suite: TestSuite) => void;
  onDeleteSuite: (suite: TestSuite) => void;
  onGenerateTestCases: (suite: TestSuite) => void;
  onGenerateCoverage: (suite: TestSuite) => void;
  onExportSuite: (suite: TestSuite) => void;
  onImportToSuite: (suite: TestSuite) => void;
}

export function TestSuiteCard({
  suite,
  testCasesCount,
  onViewSuite,
  onDeleteSuite,
  onGenerateTestCases,
  onGenerateCoverage,
  onExportSuite,
  onImportToSuite
}: TestSuiteCardProps) {
  return (
    <Card className="relative group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
              {suite.name}
            </CardTitle>
            <p className="text-sm text-text-muted line-clamp-2">
              {suite.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <StatusBadge status={suite.status} variant="status" />
            <StatusBadge status={suite.priority} variant="priority" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-primary" />
              <span className="text-text-muted">{testCasesCount} test cases</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" />
              <span className="text-text-muted">{suite.type}</span>
            </div>
          </div>
          
          {suite.aiGenerated && (
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-600">AI Generated</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Clock className="h-3 w-3" />
          <span>Updated {new Date(suite.updatedAt).toLocaleDateString()}</span>
        </div>
        
        {suite.tags && suite.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suite.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {suite.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{suite.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewSuite(suite)}
            className="flex items-center gap-1 text-xs"
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerateTestCases(suite)}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Cases
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerateCoverage(suite)}
            className="flex items-center gap-1 text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
          >
            <Brain className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700">AI Coverage</span>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExportSuite(suite)}
            className="flex items-center gap-1 text-xs"
          >
            <FileOutput className="h-3 w-3" />
            Export
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onImportToSuite(suite)}
            className="flex items-center gap-1 text-xs"
          >
            <FileUp className="h-3 w-3" />
            Import
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeleteSuite(suite)}
            className="flex items-center gap-1 text-xs ml-auto"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}