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
import { 
  Bot,
  FileText,
  Check,
  X,
  Tag,
  GitBranch
} from "lucide-react";

interface ProposedSuite {
  name: string;
  description: string;
  type: string;
  priority: string;
  projectArea: string;
  coverage?: string;
}

interface AITestSuiteProposalsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proposedSuites: ProposedSuite[];
  organizationType: string;
  onAcceptAll: () => void;
  onDeclineAll: () => void;
}

export function AITestSuiteProposalsDialog({
  isOpen,
  onOpenChange,
  proposedSuites,
  organizationType,
  onAcceptAll,
  onDeclineAll
}: AITestSuiteProposalsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Test Suite Proposals
          </DialogTitle>
          <DialogDescription>
            Review the AI-generated test suites organized by {organizationType}. You can accept all proposals or decline to return to the main view.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid gap-4">
            {proposedSuites.map((suite, index) => (
              <ATMFCard key={index} className="p-4" neonEffect="blue">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{suite.name}</h3>
                      <p className="text-sm text-text-muted mt-1">{suite.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={suite.priority} variant="priority" />
                      <Badge variant="outline">{suite.type}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{suite.projectArea}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span>AI Generated</span>
                    </div>
                  </div>
                  
                  {suite.coverage && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-md border">
                      <div className="flex items-center gap-1 mb-2">
                        <GitBranch className="h-3 w-3 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Coverage Details</span>
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        {suite.coverage.split(' | ').map((part, partIndex) => (
                          <div key={partIndex} className="mb-1">
                            <span className="font-medium">{part.split(': ')[0]}:</span> {part.split(': ')[1] || 'None specified'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ATMFCard>
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onDeclineAll}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            <span>Decline All</span>
          </Button>
          <Button 
            onClick={onAcceptAll}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Accept All ({proposedSuites.length} suites)</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}