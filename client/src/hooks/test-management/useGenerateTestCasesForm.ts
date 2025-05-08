import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { TestSuite } from "@/hooks/test-management";
import { generateTestCasesSchema, GenerateTestCasesFormValues } from "@/schemas/test-management";

type GenerateTestCasesFormOptions = {
  selectedSuite?: TestSuite | null;
  isOpen: boolean;
};

export function useGenerateTestCasesForm({
  selectedSuite,
  isOpen,
}: GenerateTestCasesFormOptions) {
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
    if (isOpen) {
      form.reset({
        feature: "",
        requirements: "",
        complexity: "medium",
        testSuiteId: selectedSuite?.id || 0,
      });
    }
  }, [isOpen, form, selectedSuite]);

  // Update test suite ID when selected suite changes
  useEffect(() => {
    if (selectedSuite?.id && form.getValues("testSuiteId") !== selectedSuite.id) {
      form.setValue("testSuiteId", selectedSuite.id);
    }
  }, [selectedSuite, form]);

  return {
    form
  };
}