import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestSuite, TestCase } from "@/hooks/test-management";
import { 
  TestCaseFormValues, 
  testCaseSchema, 
  testStepSchema 
} from "@/schemas/test-management";
import { z } from "zod";

interface UseTestCaseFormProps {
  testCase?: TestCase | null;
  selectedSuite?: TestSuite | null;
  isStructured?: boolean;
  mode: "create" | "edit";
}

const defaultTestStep = {
  step: "",
  expected: "",
};

export function useTestCaseForm({
  testCase,
  selectedSuite,
  isStructured = true,
  mode
}: UseTestCaseFormProps) {
  const [steps, setSteps] = useState<{ step: string; expected: string }[]>([defaultTestStep]);

  // Initialize form with validation schema
  const form = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
      priority: "medium",
      suiteId: selectedSuite?.id || 0,
      severity: "normal",
      automatable: false,
      preconditions: "",
      expectedResults: "",
      steps: [defaultTestStep],
    },
  });

  // Update form when testCase changes (for edit mode)
  useEffect(() => {
    if (testCase && mode === "edit") {
      // Reset form with testCase values
      form.reset({
        title: testCase.title,
        description: testCase.description,
        status: testCase.status as "draft" | "ready" | "in-progress" | "completed" | "blocked",
        priority: testCase.priority as "high" | "medium" | "low",
        suiteId: testCase.suiteId,
        severity: testCase.severity as "critical" | "high" | "normal" | "low",
        automatable: testCase.automatable,
        preconditions: testCase.preconditions || "",
        expectedResults: testCase.expectedResults,
        steps: testCase.steps || [defaultTestStep],
      });

      // Update steps state for steps UI management
      if (testCase.steps && testCase.steps.length > 0) {
        setSteps(testCase.steps);
      }
    }
  }, [testCase, form, mode]);

  // Update suiteId when selectedSuite changes
  useEffect(() => {
    if (selectedSuite) {
      form.setValue("suiteId", selectedSuite.id);
    }
  }, [selectedSuite, form]);

  // Add new step
  const addStep = () => {
    setSteps([...steps, defaultTestStep]);
    const currentSteps = form.getValues("steps") || [];
    form.setValue("steps", [...currentSteps, defaultTestStep]);
  };

  // Remove step
  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    form.setValue("steps", updatedSteps);
  };

  // Update a specific step field
  const updateStepField = (index: number, field: "step" | "expected", value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };
    
    setSteps(updatedSteps);
    form.setValue("steps", updatedSteps);
    
    // Validate the step field after update
    const stepValidator = z.object({
      steps: z.array(testStepSchema)
    });
    
    const result = stepValidator.safeParse({ steps: updatedSteps });
    if (!result.success) {
      // Extract error details for the specific field
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.steps) {
        // Set form error for the specific step
        form.setError(`steps.${index}.${field}` as any, {
          type: "manual",
          message: fieldErrors.steps[0] || `Invalid ${field}`,
        });
      }
    } else {
      // Clear error if validation passes
      form.clearErrors(`steps.${index}.${field}` as any);
    }
  };

  return {
    form,
    steps,
    addStep,
    removeStep,
    updateStepField,
    isStructured,
  };
}