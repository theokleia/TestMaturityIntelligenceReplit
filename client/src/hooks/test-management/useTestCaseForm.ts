import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestCase, TestSuite } from ".";
import { testCaseSchema, TestCaseFormValues } from "@/schemas/test-management";

interface UseTestCaseFormProps {
  testCase?: TestCase | null;
  selectedSuite?: TestSuite | null;
  isStructured: boolean;
  mode: "create" | "edit";
}

export function useTestCaseForm({
  testCase,
  selectedSuite,
  isStructured,
  mode,
}: UseTestCaseFormProps) {
  const form = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      title: testCase?.title || "",
      description: testCase?.description || "",
      preconditions: testCase?.preconditions || "",
      steps: testCase?.steps || (isStructured ? [{ step: "", expected: "" }] : undefined),
      expectedResults: testCase?.expectedResults || "",
      priority: (testCase?.priority as "high" | "medium" | "low") || "medium",
      severity: (testCase?.severity as "critical" | "high" | "normal" | "low") || "normal",
      status: (testCase?.status as "draft" | "ready" | "in-progress" | "blocked" | "completed") || "draft",
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
        priority: testCase.priority as "high" | "medium" | "low",
        severity: testCase.severity as "critical" | "high" | "normal" | "low",
        status: testCase.status as "draft" | "ready" | "in-progress" | "blocked" | "completed",
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
    if (selectedSuite?.id && form.getValues().suiteId !== selectedSuite.id) {
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
    removeStep,
  };
}