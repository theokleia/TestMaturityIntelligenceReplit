import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
    }
  }, [open, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  if (!testCase) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <span className="mr-2">TC-{testCase.id}:</span> {testCase.title}
          </DialogTitle>
          <div className="flex space-x-2 mt-2">
            <StatusBadge variant="priority" status={testCase.priority} />
            {testCase.severity && (
              <StatusBadge variant="severity" status={testCase.severity} />
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Test Details</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            {showHistory && (
              <TabsTrigger value="history">Previous Runs</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold">Description</h4>
              <p className="mt-1 text-sm">{testCase.description || "No description provided."}</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Preconditions</h4>
              <p className="mt-1 text-sm">{testCase.preconditions || "None"}</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Test Steps</h4>
              {testCase.testData ? (
                <ol className="list-decimal list-inside mt-1 space-y-2">
                  {testCase.testData.split('\n').map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="mt-1 text-sm">No steps defined.</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold">Expected Results</h4>
              <p className="mt-1 text-sm">{testCase.expectedResults || "Not specified"}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="execution" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Result</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="passed" className="flex items-center">
                            <div className="flex items-center">
                              <Check className="w-4 h-4 mr-2 text-green-500" />
                              <span>Passed</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="failed">
                            <div className="flex items-center">
                              <X className="w-4 h-4 mr-2 text-red-500" />
                              <span>Failed</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="blocked">
                            <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                              <span>Blocked</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center space-x-4 mt-6">
                  <Button 
                    type="submit"
                    onClick={() => form.setValue("status", "passed")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Pass
                  </Button>
                  <Button 
                    type="submit"
                    onClick={() => form.setValue("status", "failed")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fail
                  </Button>
                  <Button 
                    type="submit"
                    onClick={() => form.setValue("status", "blocked")}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Block
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          {showHistory && (
            <TabsContent value="history" className="mt-4">
              <TestRunHistory runs={previousRuns} />
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}