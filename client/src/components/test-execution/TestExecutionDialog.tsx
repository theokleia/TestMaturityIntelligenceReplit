import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Check, X, AlertTriangle } from "lucide-react";
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

const formSchema = z.object({
  status: z.string(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TestExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  testCase?: TestCase;
  previousRuns?: TestRun[];
  showHistory?: boolean;
}

export function TestExecutionDialog({
  open,
  onOpenChange,
  onSubmit,
  testCase,
  previousRuns = [],
  showHistory = true
}: TestExecutionDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "passed",
      notes: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        status: "passed",
        notes: "",
      });
      // Set the active tab to details when opening
      setActiveTab("details");
    }
  }, [open, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    onOpenChange(false);
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
              {hasStructuredSteps ? (
                <div className="space-y-3 mt-3">
                  {testCase.steps.map((step: any, index: number) => (
                    <div key={index} className="flex gap-3 p-3 bg-card rounded-md border">
                      <div className="font-mono text-sm bg-primary/20 w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-primary">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{step.step}</p>
                        {step.expected && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Expected:</span> {step.expected}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {testCase.testData ? (
                    <div>
                      {typeof testCase.testData === 'string' && testCase.testData.trim() ? (
                        <ol className="list-decimal list-inside mt-1 space-y-2 pl-4">
                          {testCase.testData.split('\n').map((step, index) => (
                            <li key={index} className="pl-2">{step}</li>
                          ))}
                        </ol>
                      ) : typeof testCase.testData === 'object' && Object.keys(testCase.testData).length > 0 ? (
                        <div className="space-y-3 mt-3">
                          {Object.entries(testCase.testData).map(([key, value], index) => (
                            <div key={index} className="p-3 bg-card rounded-md border">
                              <p className="font-medium">{key}: {value}</p>
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter test execution notes, observations, or defect details..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Button 
                  type="submit"
                  onClick={() => form.setValue("status", "passed")}
                  className="bg-green-600 hover:bg-green-700 min-w-[90px]"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Pass
                </Button>
                <Button 
                  type="submit"
                  onClick={() => form.setValue("status", "failed")}
                  className="bg-red-600 hover:bg-red-700 min-w-[90px]"
                >
                  <X className="mr-2 h-4 w-4" />
                  Fail
                </Button>
                <Button 
                  type="submit"
                  onClick={() => form.setValue("status", "blocked")}
                  className="bg-amber-600 hover:bg-amber-700 min-w-[90px]"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Block
                </Button>
                <Button 
                  type="submit"
                  onClick={() => form.setValue("status", "skipped")}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[90px]"
                >
                  <span className="mr-2">⏭</span>
                  Skip
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}