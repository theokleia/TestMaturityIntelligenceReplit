import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface AITestSuiteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationType: string;
  onOrganizationTypeChange: (type: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function AITestSuiteDialog({
  isOpen,
  onOpenChange,
  organizationType,
  onOrganizationTypeChange,
  onGenerate,
  isGenerating
}: AITestSuiteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generate AI Test Suites
          </DialogTitle>
          <DialogDescription>
            Select how you'd like to organize your test suites. AI will analyze Jira tickets first to ensure complete coverage, then supplement with project context.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Organization Type</label>
            <Select value={organizationType} onValueChange={onOrganizationTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose organization method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="functions">Business Functions</SelectItem>
                <SelectItem value="components">System Components</SelectItem>
                <SelectItem value="modules">Technical Modules</SelectItem>
                <SelectItem value="test-types">Test Types</SelectItem>
                <SelectItem value="environments">Environments</SelectItem>
                <SelectItem value="user-personas">User Personas</SelectItem>
                <SelectItem value="risk-areas">Risk Areas</SelectItem>
                <SelectItem value="workflows">User Workflows</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {organizationType && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-1">AI Analysis Priority:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Primary:</strong> Jira tickets grouped by {organizationType === 'functions' ? 'business functions' : organizationType === 'components' ? 'system components' : organizationType === 'modules' ? 'technical modules' : organizationType === 'test-types' ? 'test types' : organizationType === 'environments' ? 'environments' : organizationType === 'user-personas' ? 'user personas' : organizationType === 'risk-areas' ? 'risk areas' : 'user workflows'}</li>
                <li>• <strong>Secondary:</strong> Project strategy and compliance requirements</li>
                <li>• <strong>Supplementary:</strong> Documentation and knowledge base</li>
                <li>• Industry compliance needs</li>
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onGenerate}
            disabled={!organizationType || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                <span>Generate Test Suites</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}