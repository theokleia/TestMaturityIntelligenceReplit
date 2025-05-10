import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Check, X, AlertTriangle, Bug, TicketIcon } from "lucide-react";
import { StatusBadge } from "@/components/design-system/status-badge";
import { TestCase } from "@/hooks/test-management";
import { TestRun } from "@/hooks/test-execution";
import { formatDate } from "@/lib/utils";
import { TestRunHistory } from "./TestRunHistory";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useProject } from "@/context/ProjectContext";

// Interface for test data formats
interface TestData {
  [key: string]: any;
}

// Define a dynamic validation schema that can be updated based on selected status
const getFormSchema = (status: string) => {
  if (status === "failed") {
    return z.object({
      status: z.string(),
      notes: z.string().min(5, { message: "Notes are required for failed tests (min 5 characters)" }),
      createJiraTicket: z.boolean().optional(),
    });
  } else {
    return z.object({
      status: z.string(),
      notes: z.string().optional(),
      createJiraTicket: z.boolean().optional(),
    });
  }
};

// Base schema for initialization
const formSchema = z.object({
  status: z.string(),
  notes: z.string().optional(),
  createJiraTicket: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TestExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<boolean | void> | void;
  testCase?: TestCase;
  previousRuns?: TestRun[];
  isPending?: boolean;
  showHistory?: boolean;
}

export function TestExecutionDialog({
  open,
  onOpenChange,
  onSubmit,
  testCase,
  previousRuns = [],
  isPending = false
}: TestExecutionDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [currentStatus, setCurrentStatus] = useState("passed");
  const { selectedProject } = useProject();
  
  // Determine if project has Jira integration
  const hasJiraIntegration = Boolean(
    selectedProject?.jiraUrl && 
    selectedProject?.jiraProjectId && 
    selectedProject?.jiraApiKey
  );
  
  const form = useForm<FormValues>({
    // Use our dynamic resolver which updates validation based on status
    resolver: zodResolver(getFormSchema(currentStatus)),
    defaultValues: {
      status: "passed",
      notes: "",
      createJiraTicket: false,
    },
  });

  // Watch for status changes to update validation
  const watchedStatus = form.watch("status");
  
  // Update validation schema when status changes
  useEffect(() => {
    if (watchedStatus && watchedStatus !== currentStatus) {
      setCurrentStatus(watchedStatus);
      
      // When switching to failed status, make sure to validate the form again
      if (watchedStatus === "failed") {
        form.trigger("notes");
      } else {
        form.clearErrors();
      }
    }
  }, [watchedStatus, currentStatus, form]);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        status: "passed",
        notes: "",
        createJiraTicket: false,
      });
      setCurrentStatus("passed");
      // Set the active tab to details when opening
      setActiveTab("details");
    }
  }, [open, form]);

  const handleSubmit = async (values: FormValues) => {
    // Only submit and close if the form is valid
    // The form has already been validated at this point
    
    // Call onSubmit and wait for the result
    // If onSubmit returns false, it means validation failed
    const result = await onSubmit(values);
    
    // Only close the dialog if submission was successful (not explicitly false)
    if (result === false) {
      // Keep dialog open because validation failed
      console.log("Validation failed, keeping dialog open");
    } else {
      // Close the dialog
      onOpenChange(false);
    }
  };

  if (!testCase) {
    return null;
  }

  // Render status badge for previous runs
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      "passed": { color: "bg-green-500 text-white", label: "Passed" },
      "failed": { color: "bg-red-500 text-white", label: "Failed" },
      "blocked": { color: "bg-amber-500 text-white", label: "Blocked" },
      "skipped": { color: "bg-blue-500 text-white", label: "Skipped" },
      "not-run": { color: "bg-gray-500 text-white", label: "Not Run" },
      "not_executed": { color: "bg-gray-500 text-white", label: "Not Executed" }
    };

    const { color, label } = statusMap[status] || { color: "bg-gray-500 text-white", label: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Check if steps are an array of objects with step property
  const hasStructuredSteps = Array.isArray(testCase.steps) && 
                             testCase.steps.length > 0 && 
                             typeof testCase.steps[0] === 'object';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <span className="mr-2">TC-{testCase.id}:</span> {testCase.title}
          </DialogTitle>
          <DialogDescription>
            Execute this test case and record the results
          </DialogDescription>
          <div className="flex space-x-2 mt-2">
            <StatusBadge variant="priority" status={testCase.priority} />
            {testCase.severity && (
              <StatusBadge variant="severity" status={testCase.severity} />
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
            <div>
              <h4 className="font-semibold text-primary">Description</h4>
              <p className="mt-1">{testCase.description || "No description provided."}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary">Preconditions</h4>
              <p className="mt-1">{testCase.preconditions || "None"}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="font-semibold text-primary">Test Steps</h4>
              {testCase.steps && testCase.steps.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {testCase.steps.map((step, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-card rounded-md border">
                      <div className="font-mono text-sm bg-primary/20 w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-primary">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{
                          typeof step === 'string' 
                            ? step 
                            : (step as any).step
                        }</p>
                        {typeof step !== 'string' && (step as any).expected && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Expected:</span> {(step as any).expected}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {/* Fallback for when step data is stored in another format */}
                  {(testCase as any).testData ? (
                    <div>
                      {typeof (testCase as any).testData === 'string' && (testCase as any).testData.trim() ? (
                        <ol className="list-decimal list-inside mt-1 space-y-2 pl-4">
                          {(testCase as any).testData.split('\n').map((step: string, index: number) => (
                            <li key={index} className="pl-2">{step}</li>
                          ))}
                        </ol>
                      ) : typeof (testCase as any).testData === 'object' && Object.keys((testCase as any).testData).length > 0 ? (
                        <div className="space-y-3 mt-3">
                          {Object.entries((testCase as any).testData).map(([key, value], index) => (
                            <div key={index} className="p-3 bg-card rounded-md border">
                              <p className="font-medium">{key}: {String(value)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-muted-foreground italic">No test data provided.</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-muted-foreground italic">No steps defined.</p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-primary">Expected Results</h4>
              <p className="mt-1">{testCase.expectedResults || "Not specified"}</p>
            </div>
          </div>
          
          {previousRuns && previousRuns.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary">Previous Runs</h4>
              <Table className="mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>{run.executedAt ? new Date(run.executedAt).toLocaleString() : "N/A"}</TableCell>
                      <TableCell>{renderStatusBadge(run.status)}</TableCell>
                      <TableCell className="truncate max-w-[280px]">{run.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Separator />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Notes
                        {currentStatus === "failed" && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder={currentStatus === "failed" 
                            ? "Required: Describe the failure details, actual behavior, and any relevant context..."
                            : "Enter test execution notes, observations, or defect details..."}
                          rows={4}
                          className={currentStatus === "failed" ? "border-red-400 focus:border-red-500" : ""}
                        />
                      </FormControl>
                      {currentStatus === "failed" && (
                        <FormDescription className="text-amber-500">
                          Notes are required for failed tests
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Jira ticket creation option - only visible for failed tests and if Jira integration exists */}
                {currentStatus === "failed" && hasJiraIntegration && (
                  <FormField
                    control={form.control}
                    name="createJiraTicket"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base">
                            <div className="flex items-center">
                              <TicketIcon className="h-4 w-4 mr-2 text-blue-400" />
                              Create Jira ticket for this failure
                            </div>
                          </FormLabel>
                          <FormDescription>
                            AI will analyze your notes and generate a detailed {selectedProject?.jiraIssueType || "Bug"} ticket
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {/* Make all buttons type="button" so we can handle validation ourselves */}
                <Button 
                  type="button"
                  onClick={() => {
                    form.setValue("status", "passed");
                    // For passed tests, just submit the form
                    form.handleSubmit(handleSubmit)();
                  }}
                  className="bg-green-600 hover:bg-green-700 min-w-[90px]"
                  isPending={isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Pass
                </Button>
                <Button 
                  type="button"
                  onClick={async () => {
                    form.setValue("status", "failed");
                    if (hasJiraIntegration) {
                      form.setValue("createJiraTicket", true);
                    }
                    
                    // Trigger notes validation first, but don't close the dialog
                    const isValid = await form.trigger("notes");
                    
                    // If the notes field is already valid, submit the form
                    if (isValid) {
                      const notes = form.getValues("notes");
                      if (notes && notes.length >= 5) {
                        form.handleSubmit(handleSubmit)();
                      }
                    } else {
                      // Focus on the notes field to draw user's attention
                      setTimeout(() => {
                        const notesElement = document.querySelector('textarea[name="notes"]');
                        if (notesElement) {
                          (notesElement as HTMLTextAreaElement).focus();
                        }
                      }, 100);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 min-w-[90px]"
                  isPending={isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Fail
                </Button>
                <Button 
                  type="button"
                  onClick={() => {
                    form.setValue("status", "blocked");
                    // For blocked tests, just submit the form
                    form.handleSubmit(handleSubmit)();
                  }}
                  className="bg-amber-600 hover:bg-amber-700 min-w-[90px]"
                  isPending={isPending}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Block
                </Button>
                <Button 
                  type="button"
                  onClick={() => {
                    form.setValue("status", "skipped");
                    // For skipped tests, just submit the form
                    form.handleSubmit(handleSubmit)();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[90px]"
                  isPending={isPending}
                >
                  <span className="mr-2">⏭</span>
                  Skip
                </Button>
                {/* Add a button to submit the form with the current status when the status is "failed" */}
                {currentStatus === "failed" && (
                  <Button 
                    type="button"
                    className="bg-primary hover:bg-primary/90 w-full mt-2"
                    onClick={async () => {
                      // Validate the form and submit if valid
                      const isValid = await form.trigger();
                      if (isValid) {
                        form.handleSubmit(handleSubmit)();
                      }
                    }}
                  >
                    Submit Failed Test
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}