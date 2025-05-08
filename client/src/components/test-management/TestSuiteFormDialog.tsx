import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TestSuite } from "@/hooks/test-management";
import { useProject } from "@/context/ProjectContext";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { ClipboardList } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Schema for test suite form
const testSuiteSchema = z.object({
  name: z.string().min(1, "Test suite name is required"),
  description: z.string().min(1, "Description is required"),
  projectArea: z.string().min(1, "Project area is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  type: z.string().default("functional"),
});

export type TestSuiteFormValues = z.infer<typeof testSuiteSchema>;

interface TestSuiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TestSuiteFormValues) => void;
  testSuite?: TestSuite | null;
  isSubmitting?: boolean;
  mode: "create" | "edit";
}

export function TestSuiteFormDialog({
  open,
  onOpenChange,
  onSubmit,
  testSuite,
  isSubmitting = false,
  mode,
}: TestSuiteFormDialogProps) {
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;

  const form = useForm<TestSuiteFormValues>({
    resolver: zodResolver(testSuiteSchema),
    defaultValues: {
      name: testSuite?.name || "",
      description: testSuite?.description || "",
      projectArea: testSuite?.projectArea || "",
      priority: testSuite?.priority || "medium",
      status: testSuite?.status || "active",
      type: testSuite?.type || "functional",
    },
  });

  // Reset form when selected test suite changes
  useEffect(() => {
    if (testSuite) {
      form.reset({
        name: testSuite.name,
        description: testSuite.description,
        projectArea: testSuite.projectArea,
        priority: testSuite.priority,
        status: testSuite.status,
        type: testSuite.type,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        description: "",
        projectArea: "",
        priority: "medium",
        status: "active",
        type: "functional",
      });
    }
  }, [testSuite, form, mode]);

  // Handle form submission
  const handleSubmit = (data: TestSuiteFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Test Suite" : "Edit Test Suite"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new test suite to organize your test cases"
              : "Update the details of this test suite"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Authentication Tests" {...field} />
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
                      placeholder="Test cases for user authentication flows"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Area</FormLabel>
                  <FormControl>
                    <Input placeholder="Authentication" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="usability">Usability</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
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
                      <ClipboardList className="h-4 w-4" />
                    </IconWrapper>
                    <span>
                      {mode === "create" ? "Creating..." : "Saving..."}
                    </span>
                  </div>
                ) : (
                  mode === "create" ? "Create Test Suite" : "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}