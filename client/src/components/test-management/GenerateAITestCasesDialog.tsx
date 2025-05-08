import React from "react";
import { TestSuite, useGenerateTestCasesForm } from "@/hooks/test-management";
import { GenerateTestCasesFormValues } from "@/schemas/test-management";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateAITestCasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: GenerateTestCasesFormValues) => void;
  suites: TestSuite[];
  selectedSuite?: TestSuite | null;
  isGenerating?: boolean;
}

export function GenerateAITestCasesDialog({
  open,
  onOpenChange,
  onGenerate,
  suites,
  selectedSuite,
  isGenerating = false,
}: GenerateAITestCasesDialogProps) {
  const { form } = useGenerateTestCasesForm({
    selectedSuite,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate AI Test Cases</DialogTitle>
          <DialogDescription>
            Generate test cases using AI based on feature description and requirements
          </DialogDescription>
        </DialogHeader>

        <ErrorBoundary name="Generate AI Test Cases Form">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onGenerate)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="testSuiteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Suite</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a test suite" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suites.map((suite) => (
                          <SelectItem key={suite.id} value={suite.id.toString()}>
                            {suite.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the feature you want to test"
                        className="h-24"
                        {...field}
                      />
                    </FormControl>
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
                        placeholder="List functional and non-functional requirements"
                        className="h-24"
                        {...field}
                      />
                    </FormControl>
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
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="complex">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    "Generate Test Cases"
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