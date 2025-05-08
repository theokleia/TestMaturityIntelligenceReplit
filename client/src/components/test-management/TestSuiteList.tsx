import { useState } from "react";
import { TestSuite, useTestSuites } from "@/hooks/test-management";
import { StatusBadge } from "@/components/design-system/status-badge";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { FileText, Pencil, Trash2, Search, FolderPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProject } from "@/context/ProjectContext";

interface TestSuiteListProps {
  selectedSuite: TestSuite | null;
  onSelectSuite: (suite: TestSuite) => void;
  onCreateSuite: () => void;
  onEditSuite: (suite: TestSuite) => void;
  onDeleteSuite: (suite: TestSuite) => void;
}

export function TestSuiteList({
  selectedSuite,
  onSelectSuite,
  onCreateSuite,
  onEditSuite,
  onDeleteSuite
}: TestSuiteListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // Fetch test suites
  const { data: testSuites, isLoading: isLoadingTestSuites } = useTestSuites({
    projectId
  });
  
  // Filter test suites based on search term
  const filteredTestSuites = testSuites?.filter((suite) => 
    suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.projectArea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ATMFCard>
      <ATMFCardHeader
        title="Test Suites"
        action={
          <Badge variant="outline" className="text-xs font-normal">
            {filteredTestSuites?.length || 0} suites
          </Badge>
        }
      />
      <div className="p-4 pt-0">
        <div className="relative w-full mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search test suites..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
          {isLoadingTestSuites ? (
            <div className="flex justify-center items-center h-24">
              <p>Loading test suites...</p>
            </div>
          ) : filteredTestSuites && filteredTestSuites.length > 0 ? (
            <div className="space-y-2">
              {filteredTestSuites.map((suite) => (
                <ATMFCard 
                  key={suite.id} 
                  className={`cursor-pointer transition-colors ${selectedSuite?.id === suite.id ? 'bg-primary/10 border-primary/50' : ''}`}
                  neonEffect={selectedSuite?.id === suite.id ? "blue" : "none"}
                  onClick={() => onSelectSuite(suite)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="truncate font-medium" title={suite.name}>
                        {suite.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={suite.status} variant="test" />
                        {selectedSuite?.id === suite.id && (
                          <div className="flex items-center ml-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditSuite(suite);
                              }}
                              title="Edit test suite"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSuite(suite);
                              }}
                              title="Delete test suite"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2" title={suite.description}>
                      {suite.description}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{suite.projectArea}</span>
                      </div>
                      <StatusBadge status={suite.priority} variant="priority" />
                    </div>
                  </div>
                </ATMFCard>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <p className="text-text-muted">No test suites found</p>
              <Button 
                variant="link" 
                onClick={onCreateSuite}
                className="mt-2"
              >
                Create your first test suite
              </Button>
            </div>
          )}
        </div>
      </div>
    </ATMFCard>
  );
}