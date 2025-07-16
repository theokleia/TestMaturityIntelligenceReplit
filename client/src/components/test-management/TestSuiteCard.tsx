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
  Eye,
  GitBranch,
  BookOpen,
  Shield
} from "lucide-react";

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

function parseCoverage(coverage?: string) {
  if (!coverage) return null;
  
  const sections: { type: string; items: string[]; icon: any }[] = [];
  const parts = coverage.split(' | ');
  
  parts.forEach(part => {
    const trimmed = part.trim();
    if (trimmed.startsWith('JIRA_TICKETS:')) {
      const tickets = trimmed.replace('JIRA_TICKETS:', '').trim().split(',').map(t => t.trim()).filter(t => t);
      if (tickets.length > 0) {
        sections.push({ type: 'Jira Tickets', items: tickets, icon: GitBranch });
      }
    } else if (trimmed.startsWith('DOCUMENTS:')) {
      const docs = trimmed.replace('DOCUMENTS:', '').trim().split(',').map(d => d.trim()).filter(d => d);
      if (docs.length > 0) {
        sections.push({ type: 'Documents', items: docs, icon: BookOpen });
      }
    } else if (trimmed.startsWith('COMPLIANCE:')) {
      const compliance = trimmed.replace('COMPLIANCE:', '').trim().split(',').map(c => c.trim()).filter(c => c);
      if (compliance.length > 0) {
        sections.push({ type: 'Compliance', items: compliance, icon: Shield });
      }
    }
  });
  
  return sections;
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
        
        {/* Coverage Information */}
        {suite.coverage && (
          <div className="border-t pt-3 mt-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide">Coverage</h4>
              {parseCoverage(suite.coverage)?.map((section, index) => (
                <div key={index} className="flex items-start gap-2">
                  <section.icon className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700">{section.type}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {section.items.slice(0, 3).map((item, itemIndex) => (
                        <Badge key={itemIndex} variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                          {item}
                        </Badge>
                      ))}
                      {section.items.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                          +{section.items.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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