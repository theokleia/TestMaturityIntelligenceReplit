import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { TestSuite } from "@/hooks/test-management";
import { testSuiteSchema, TestSuiteFormValues } from "@/schemas/test-management";

type TestSuiteFormOptions = {
  testSuite?: TestSuite | null;
  mode: "create" | "edit";
};

export function useTestSuiteForm({
  testSuite,
  mode,
}: TestSuiteFormOptions) {
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

  // Reset form when test suite changes
  useEffect(() => {
    if (testSuite && mode === "edit") {
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

  return {
    form
  };
}