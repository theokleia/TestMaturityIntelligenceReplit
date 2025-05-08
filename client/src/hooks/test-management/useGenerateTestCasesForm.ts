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
  count: z.number().min(1).max(10),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  suiteId: z.number().min(1, "A test suite must be selected"),
});

type GenerateTestCasesFormValues = z.infer<typeof generateTestCasesSchema>;

type GenerateTestCasesFormOptions = {
  selectedSuite?: TestSuite | null;
  isOpen: boolean;
};

export function useGenerateTestCasesForm({
  selectedSuite,
  isOpen,
}: GenerateTestCasesFormOptions) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GenerateTestCasesFormValues>({
    resolver: zodResolver(generateTestCasesSchema),
    defaultValues: {
      feature: "",
      requirements: "",
      count: 3,
      priority: "medium",
      suiteId: selectedSuite?.id || 0,
    },
  });

  // Reset the form when it's opened
  if (isOpen && selectedSuite?.id && form.getValues("suiteId") !== selectedSuite.id) {
    form.setValue("suiteId", selectedSuite.id);
  }

  const generateTestCases = async (data: GenerateTestCasesFormValues) => {
    setIsGenerating(true);
    try {
      await apiRequest("/api/ai/generate-tests", "POST", data);
      toast({
        title: "Test cases generated",
        description: `${data.count} test cases were successfully generated for ${selectedSuite?.name}`,
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