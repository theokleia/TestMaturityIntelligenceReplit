import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ATMFCard } from "@/components/design-system/atmf-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { 
  Brain, 
  Bot,
  X,
  Check,
  CheckCircle
} from "lucide-react";

interface JiraTicket {
  key: string;
  summary: string;
}

interface ProposedTestCase {
  title: string;
  description: string;
  priority: string;
  reasoning: string;
  jiraTickets?: JiraTicket[];
  jiraTicketIds?: string[];
}

interface CoverageAnalysis {
  recommendation?: string;
  summary?: string;
  gapAnalysis?: string;
  riskAssessment?: string;
}

interface AITestCoverageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proposedTestCases: ProposedTestCase[];
  coverageAnalysis: CoverageAnalysis | null;
  onAcceptTestCases: () => void;
  onDeclineTestCases: () => void;
}

export function AITestCoverageDialog({
  isOpen,
  onOpenChange,
  proposedTestCases,
  coverageAnalysis,
  onAcceptTestCases,
  onDeclineTestCases
}: AITestCoverageDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Test Coverage Analysis
          </DialogTitle>
          <DialogDescription>
            AI has analyzed your project context, documentation, and existing test cases to identify coverage gaps and propose additional test cases.
          </DialogDescription>
        </DialogHeader>
        
        {/* Coverage Analysis Summary */}
        {coverageAnalysis && (
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-3">Coverage Analysis</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {coverageAnalysis.summary && (
                <ATMFCard neonEffect="blue" className="p-4">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-text-muted">{coverageAnalysis.summary}</p>
                </ATMFCard>
              )}
              
              {coverageAnalysis.gapAnalysis && (
                <ATMFCard neonEffect="amber" className="p-4">
                  <h4 className="font-medium mb-2">Gap Analysis</h4>
                  <p className="text-sm text-text-muted">{coverageAnalysis.gapAnalysis}</p>
                </ATMFCard>
              )}
              
              {coverageAnalysis.riskAssessment && (
                <ATMFCard neonEffect="red" className="p-4 md:col-span-2">
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <p className="text-sm text-text-muted">{coverageAnalysis.riskAssessment}</p>
                </ATMFCard>
              )}
            </div>
          </div>
        )}

        {/* Show proposed test cases or no additional coverage needed message */}
        {proposedTestCases.length > 0 ? (
          <div>
            <h4 className="font-medium text-lg mb-3">Proposed Additional Test Cases</h4>
            <div className="space-y-4">
              {proposedTestCases.map((testCase, index) => (
                <ATMFCard key={index} neonEffect="blue">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{testCase.title}</h4>
                        <p className="text-text-muted mt-1">{testCase.description}</p>
                      </div>
                      <StatusBadge status={testCase.priority} variant="priority" />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3 text-primary" />
                        <span className="text-text-muted">{testCase.reasoning}</span>
                      </div>
                    </div>
                    
                    {/* Jira Ticket Coverage */}
                    {testCase.jiraTickets && testCase.jiraTickets.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm text-text-muted mb-2">Covers Jira Tickets:</h5>
                        <div className="space-y-2">
                          {testCase.jiraTickets.map((ticket, ticketIndex) => (
                            <div key={ticketIndex} className="bg-atmf-main/50 p-2 rounded border border-white/10">
                              <div className="flex items-start gap-2">
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {ticket.key}
                                  </Badge>
                                  {ticket.summary === 'Ticket not found' && (
                                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-text-muted flex-1">
                                  {ticket.summary === 'Ticket not found' 
                                    ? 'This ticket needs to be created in Jira'
                                    : ticket.summary
                                  }
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Fallback for jiraTicketIds (for backwards compatibility) */}
                    {(!testCase.jiraTickets || testCase.jiraTickets.length === 0) && 
                     testCase.jiraTicketIds && testCase.jiraTicketIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {testCase.jiraTicketIds.map((ticketId: string) => (
                          <Badge key={ticketId} variant="outline" className="text-xs">
                            {ticketId}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </ATMFCard>
              ))}
            </div>
            
            <DialogFooter className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onDeclineTestCases}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                <span>Decline All</span>
              </Button>
              <Button 
                onClick={onAcceptTestCases}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Accept All ({proposedTestCases.length} test cases)</span>
              </Button>
            </DialogFooter>
          </div>
        ) : coverageAnalysis ? (
          <div className="text-center py-8">
            <IconWrapper color="green" size="lg" className="mb-4 mx-auto">
              <CheckCircle className="h-6 w-6" />
            </IconWrapper>
            <h4 className="font-medium text-lg mb-2">Coverage Analysis Complete</h4>
            <p className="text-text-muted">
              {coverageAnalysis.recommendation || "Review the analysis above for detailed coverage insights."}
            </p>
            
            <DialogFooter className="flex justify-center mt-6">
              <Button 
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Close Analysis</span>
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}