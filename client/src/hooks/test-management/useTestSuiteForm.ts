import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestSuite } from "@/hooks/test-management";
import { TestSuiteFormValues, testSuiteSchema } from "@/schemas/test-management";

interface UseTestSuiteFormProps {
  testSuite?: TestSuite | null;
  mode: "create" | "edit";
}

export function useTestSuiteForm({
  testSuite,
  mode
}: UseTestSuiteFormProps) {
  // Initialize form with validation schema
  const form = useForm<TestSuiteFormValues>({
    resolver: zodResolver(testSuiteSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      priority: "medium",
      projectArea: "",
    },
  });

  // Update form when testSuite changes (for edit mode)
  useEffect(() => {
    if (testSuite && mode === "edit") {
      // Reset form with testSuite values
      form.reset({
        name: testSuite.name,
        description: testSuite.description,
        status: testSuite.status as "draft" | "ready" | "in-progress" | "completed" | "archived",
        priority: testSuite.priority as "high" | "medium" | "low",
        projectArea: testSuite.projectArea,
      });
    }
  }, [testSuite, form, mode]);

  // Format data for submission based on mode
  const formatDataForSubmission = (data: TestSuiteFormValues) => {
    if (mode === "create") {
      return {
        ...data,
      };
    } else {
      // For edit mode, return only the fields that need to be updated
      const updatedFields: Partial<TestSuiteFormValues> = {};
      
      if (testSuite) {
        if (data.name !== testSuite.name) updatedFields.name = data.name;
        if (data.description !== testSuite.description) updatedFields.description = data.description;
        if (data.status !== testSuite.status) updatedFields.status = data.status;
        if (data.priority !== testSuite.priority) updatedFields.priority = data.priority;
        if (data.projectArea !== testSuite.projectArea) updatedFields.projectArea = data.projectArea;
      }
      
      return updatedFields;
    }
  };

  return {
    form,
    formatDataForSubmission,
  };
}