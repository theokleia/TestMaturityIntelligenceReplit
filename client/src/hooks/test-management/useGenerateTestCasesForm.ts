import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestSuite } from "@/hooks/test-management";
import { GenerateTestCasesFormValues, generateTestCasesSchema } from "@/schemas/test-management";

interface UseGenerateTestCasesFormProps {
  testSuite: TestSuite | null;
}

export function useGenerateTestCasesForm({
  testSuite,
}: UseGenerateTestCasesFormProps) {
  // Initialize form with validation schema
  const form = useForm<GenerateTestCasesFormValues>({
    resolver: zodResolver(generateTestCasesSchema),
    defaultValues: {
      feature: "",
      requirements: "",
      complexity: "medium" as "low" | "medium" | "high",
      testSuiteId: testSuite?.id || 0,
    },
  });

  // Update testSuiteId when testSuite changes
  useEffect(() => {
    if (testSuite) {
      form.setValue("testSuiteId", testSuite.id);
    }
  }, [testSuite, form]);

  return {
    form,
  };
}