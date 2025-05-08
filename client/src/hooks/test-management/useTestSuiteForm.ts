import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestSuite } from ".";
import { testSuiteSchema, TestSuiteFormValues } from "@/schemas/test-management";
import { useProject } from "@/context/ProjectContext";

interface UseTestSuiteFormProps {
  testSuite?: TestSuite | null;
  mode: "create" | "edit";
}

export function useTestSuiteForm({
  testSuite,
  mode,
}: UseTestSuiteFormProps) {
  const { selectedProject } = useProject();

  const form = useForm<TestSuiteFormValues>({
    resolver: zodResolver(testSuiteSchema),
    defaultValues: {
      name: testSuite?.name || "",
      description: testSuite?.description || "",
      projectArea: testSuite?.projectArea || "",
      priority: (testSuite?.priority as "high" | "medium" | "low") || "medium",
      status: (testSuite?.status as "draft" | "ready" | "in-progress" | "completed") || "draft",
      projectId: selectedProject?.id || 0,
    },
  });

  // Reset form when test suite changes
  useEffect(() => {
    if (testSuite) {
      form.reset({
        name: testSuite.name,
        description: testSuite.description,
        projectArea: testSuite.projectArea,
        priority: testSuite.priority as "high" | "medium" | "low",
        status: testSuite.status as "draft" | "ready" | "in-progress" | "completed",
        projectId: testSuite.projectId,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        description: "",
        projectArea: "",
        priority: "medium",
        status: "draft",
        projectId: selectedProject?.id || 0,
      });
    }
  }, [testSuite, form, mode, selectedProject]);

  // Update project ID when selected project changes
  useEffect(() => {
    if (selectedProject?.id && form.getValues().projectId !== selectedProject.id) {
      form.setValue("projectId", selectedProject.id);
    }
  }, [selectedProject, form]);

  return {
    form,
  };
}