import { useState } from "react";
import { TestCase, TestSuite, useTestCases } from "@/hooks/test-management";
import { StatusBadge } from "@/components/design-system/status-badge";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { Bot, Eye, FileText, Plus, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface TestCaseTableProps {
  selectedSuite: TestSuite | null;
  onCreateTestCase: () => void;
  onGenerateAI: () => void;
  onViewTestCase: (testCase: TestCase) => void;
  projectId?: number;
}

export function TestCaseTable({
  selectedSuite,
  onCreateTestCase,
  onGenerateAI,
  onViewTestCase,
  projectId
}: TestCaseTableProps) {
  // Fetch test cases for the selected suite
  const { testCases, isLoading: isLoadingTestCases } = useTestCases({
    suiteId: selectedSuite?.id,
    projectId
  });
  
  console.log("TestCaseTable - testCases:", testCases);

  if (!selectedSuite) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <IconWrapper color="muted" size="lg" className="mb-4">
          <FileText className="h-6 w-6" />
        </IconWrapper>
        <p className="text-text-muted">Select a test suite to view its test cases</p>
      </div>
    );
  }

  if (isLoadingTestCases) {
    return (
      <div className="flex justify-center items-center h-24">
        <p>Loading test cases...</p>
      </div>
    );
  }

  if (!testCases || testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <IconWrapper color="muted" size="lg" className="mb-4">
          <FileText className="h-6 w-6" />
        </IconWrapper>
        <p className="text-text-muted mb-4">No test cases in this suite yet</p>
        <div className="flex space-x-4">
          <Button 
            size="sm" 
            onClick={onCreateTestCase}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Test Case</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onGenerateAI}
            className="flex items-center gap-1"
          >
            <Brain className="h-3.5 w-3.5" />
            <span>Generate with AI</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="w-[80px]">Auto</TableHead>
          <TableHead>Jira</TableHead>
          <TableHead>Source</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testCases.map((testCase) => (
          <TableRow 
            key={testCase.id}
            className="cursor-pointer hover:bg-primary/5"
            onClick={() => onViewTestCase(testCase)}
          >
            <TableCell className="font-medium">{testCase.title}</TableCell>
            <TableCell>
              <StatusBadge status={testCase.status} variant="test" />
            </TableCell>
            <TableCell>
              <StatusBadge status={testCase.priority} variant="priority" />
            </TableCell>
            <TableCell className="text-center">
              <IconWrapper 
                color={testCase.automatable ? "green" : "muted"} 
                size="xs"
              >
                {testCase.automatable ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </IconWrapper>
            </TableCell>
            <TableCell>
              {testCase.jiraTicketIds && testCase.jiraTicketIds.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {testCase.jiraTicketIds.slice(0, 2).map((ticketId: string) => (
                    <Badge key={ticketId} variant="outline" className="text-xs">
                      {ticketId}
                    </Badge>
                  ))}
                  {testCase.jiraTicketIds.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{testCase.jiraTicketIds.length - 2}
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-text-muted text-xs">—</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {testCase.aiGenerated ? (
                  <IconWrapper color="blue" size="xs">
                    <Bot className="h-3 w-3" />
                  </IconWrapper>
                ) : (
                  <IconWrapper color="primary" size="xs">
                    <FileText className="h-3 w-3" />
                  </IconWrapper>
                )}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTestCase(testCase);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}