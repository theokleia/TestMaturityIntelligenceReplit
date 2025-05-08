import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TestSuite } from ".";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for AI test case generation
const generateTestCasesSchema = z.object({
  feature: z.string().min(5, "Feature description is required"),
  requirements: z.string().min(5, "Requirements are required"),
  complexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
  testSuiteId: z.number().min(1, "A test suite must be selected"),
});

export type GenerateTestCasesFormValues = z.infer<typeof generateTestCasesSchema>;

export interface GenerateTestCasesFormOptions {
  selectedSuite?: TestSuite | null;
}

export function useGenerateTestCasesForm({
  selectedSuite,
}: GenerateTestCasesFormOptions) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GenerateTestCasesFormValues>({
    resolver: zodResolver(generateTestCasesSchema),
    defaultValues: {
      feature: "",
      requirements: "",
      complexity: "moderate",
      testSuiteId: selectedSuite?.id || 0,
    },
  });

  // Reset the form when the selected suite changes
  if (selectedSuite?.id && form.getValues("testSuiteId") !== selectedSuite.id) {
    form.setValue("testSuiteId", selectedSuite.id);
  }

  const generateTestCases = async (data: GenerateTestCasesFormValues) => {
    setIsGenerating(true);
    try {
      await apiRequest("/api/ai/generate-tests", "POST", data);
      toast({
        title: "Test cases generated",
        description: `Test cases were successfully generated for ${selectedSuite?.name}`,
      });
      return true;
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate test cases. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    form,
    isGenerating,
    generateTestCases,
  };
}