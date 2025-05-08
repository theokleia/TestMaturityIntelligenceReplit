import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { TestCase, TestSuite } from "@/hooks/test-management";
import { testCaseSchema, TestCaseFormValues } from "@/schemas/test-management";

type TestCaseFormOptions = {
  testCase?: TestCase | null;
  selectedSuite?: TestSuite | null;
  isStructured?: boolean;
  mode: "create" | "edit";
};

export function useTestCaseForm({
  testCase,
  selectedSuite,
  isStructured = false,
  mode,
}: TestCaseFormOptions) {
  const form = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      title: testCase?.title || "",
      description: testCase?.description || "",
      preconditions: testCase?.preconditions || "",
      steps: testCase?.steps || (isStructured ? [{ step: "", expected: "" }] : undefined),
      expectedResults: testCase?.expectedResults || "",
      priority: testCase?.priority || "medium",
      severity: testCase?.severity || "normal",
      status: testCase?.status || "draft",
      suiteId: testCase?.suiteId || selectedSuite?.id || 0,
      automatable: testCase?.automatable || false,
    },
  });

  // Reset form when test case changes
  useEffect(() => {
    if (testCase) {
      form.reset({
        title: testCase.title,
        description: testCase.description,
        preconditions: testCase.preconditions,
        steps: testCase.steps || [],
        expectedResults: testCase.expectedResults,
        priority: testCase.priority,
        severity: testCase.severity,
        status: testCase.status,
        suiteId: testCase.suiteId,
        automatable: testCase.automatable,
      });
    } else if (mode === "create") {
      form.reset({
        title: "",
        description: "",
        preconditions: "",
        steps: isStructured ? [{ step: "", expected: "" }] : undefined,
        expectedResults: "",
        priority: "medium",
        severity: "normal",
        status: "draft",
        suiteId: selectedSuite?.id || 0,
        automatable: false,
      });
    }
  }, [testCase, form, mode, isStructured, selectedSuite]);

  // Update suite ID when selected suite changes
  useEffect(() => {
    if (selectedSuite?.id && form.getValues("suiteId") !== selectedSuite.id) {
      form.setValue("suiteId", selectedSuite.id);
    }
  }, [selectedSuite, form]);

  // Function to add a new step
  const addStep = () => {
    const currentSteps = form.getValues("steps") || [];
    form.setValue("steps", [...currentSteps, { step: "", expected: "" }]);
  };

  // Function to remove a step
  const removeStep = (index: number) => {
    const currentSteps = form.getValues("steps") || [];
    if (currentSteps.length > 1) {
      const newSteps = currentSteps.filter((_, i) => i !== index);
      form.setValue("steps", newSteps);
    }
  };

  return {
    form,
    addStep,
    removeStep
  };
}