import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestSuite } from "@/hooks/test-management";
import { GenerateTestCasesFormValues, generateTestCasesSchema } from "@/schemas/test-management";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

export interface GenerateAITestCasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSuite: TestSuite | null;
  onSubmit: (data: GenerateTestCasesFormValues) => void;
  isSubmitting?: boolean;
}

export function GenerateAITestCasesDialog({
  open,
  onOpenChange,
  testSuite,
  onSubmit,
  isSubmitting = false,
}: GenerateAITestCasesDialogProps) {
  const form = useForm<GenerateTestCasesFormValues>({
    resolver: zodResolver(generateTestCasesSchema),
    defaultValues: {
      feature: "",
      requirements: "",
      complexity: "medium" as "low" | "medium" | "high",
      testSuiteId: testSuite?.id || 0,
    },
  });

  React.useEffect(() => {
    if (testSuite) {
      form.setValue("testSuiteId", testSuite.id);
    }
  }, [testSuite, form]);

  const handleSubmit = (data: GenerateTestCasesFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate AI Test Cases</DialogTitle>
          <DialogDescription>
            Describe the feature and its requirements to generate test cases using AI.
          </DialogDescription>
        </DialogHeader>

        <ErrorBoundary name="Generate AI Test Cases Form">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="feature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature Name</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the name of the feature (e.g., User Authentication, Payment Processing)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Clearly describe the feature for which test cases will be generated.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed requirements, acceptance criteria, or user stories"
                        className="resize-none min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide detailed requirements or acceptance criteria. The more details you provide, the better the generated test cases will be.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Complexity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Basic functionality tests</SelectItem>
                        <SelectItem value="medium">Medium - Comprehensive test coverage</SelectItem>
                        <SelectItem value="high">High - Thorough testing including edge cases</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The complexity level determines how detailed and extensive the generated test cases will be.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      Generate Test Cases
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}