import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestSuite } from "@/hooks/test-management";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { Brain } from "lucide-react";
import { generateTestCasesSchema, GenerateTestCasesFormValues } from "@/schemas/test-management";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GenerateAITestCasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GenerateTestCasesFormValues) => void;
  suites?: TestSuite[];
  selectedSuite?: TestSuite | null;
  isSubmitting?: boolean;
}

export function GenerateAITestCasesDialog({
  open,
  onOpenChange,
  onSubmit,
  suites = [],
  selectedSuite,
  isSubmitting = false,
}: GenerateAITestCasesDialogProps) {
  const form = useForm<GenerateTestCasesFormValues>({
    resolver: zodResolver(generateTestCasesSchema),
    defaultValues: {
      feature: "",
      requirements: "",
      complexity: "medium",
      testSuiteId: selectedSuite?.id || 0,
    },
  });

  // Reset form values when opening the dialog
  useEffect(() => {
    if (open) {
      form.reset({
        feature: "",
        requirements: "",
        complexity: "medium",
        testSuiteId: selectedSuite?.id || 0,
      });
    }
  }, [open, form, selectedSuite]);

  // Update test suite ID when selected suite changes
  useEffect(() => {
    if (selectedSuite?.id && form.getValues("testSuiteId") !== selectedSuite.id) {
      form.setValue("testSuiteId", selectedSuite.id);
    }
  }, [selectedSuite, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Test Cases with AI</DialogTitle>
          <DialogDescription>
            Describe the feature and requirements to automatically generate test cases
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="feature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feature Name</FormLabel>
                  <FormControl>
                    <Input placeholder="User Authentication" {...field} />
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
                  <FormLabel>Feature Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Users should be able to login with email/password or SSO. Failed login attempts should be limited to 3 before temporary lockout. Password reset functionality should send a secure token via email."
                      rows={6}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complexity</FormLabel>
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
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="complex">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testSuiteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Suite</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
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
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <IconWrapper className="animate-spin">
                      <Brain className="h-4 w-4" />
                    </IconWrapper>
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Test Cases"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}