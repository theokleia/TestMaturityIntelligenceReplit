import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useCreateTestCase } from "@/hooks/test-management";

const createTestCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  preconditions: z.string().min(1, "Preconditions are required"),
  expectedResults: z.string().min(1, "Expected results are required"),
  priority: z.string().min(1, "Priority is required"),
  severity: z.string().min(1, "Severity is required"),
  status: z.string().default("draft"),
});

type FormData = z.infer<typeof createTestCaseSchema>;

interface CreateTestCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  suiteId?: number;
  projectId?: number;
  onSuccess: () => void;
}

export function CreateTestCaseDialog({
  isOpen,
  onOpenChange,
  suiteId,
  projectId,
  onSuccess
}: CreateTestCaseDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateTestCase();

  const form = useForm<FormData>({
    resolver: zodResolver(createTestCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      preconditions: "",
      expectedResults: "",
      priority: "medium",
      severity: "normal",
      status: "draft",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!suiteId || !projectId) {
      toast({
        title: "Error",
        description: "Suite ID and Project ID are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...data,
        suiteId,
        projectId,
        steps: [],
        userId: null, // Will be set by backend if user is authenticated
        aiGenerated: false,
        automatable: false,
        automationStatus: "not-automated",
      });

      toast({
        title: "Success",
        description: "Test case created successfully",
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test case",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Test Case</DialogTitle>
          <DialogDescription>
            Create a new test case in the selected test suite.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter test case title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this test case validates"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preconditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preconditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the conditions that must be met before executing this test"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedResults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Results</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the expected outcome of this test"
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trivial">Trivial</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="blocker">Blocker</SelectItem>
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
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Test Case"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}