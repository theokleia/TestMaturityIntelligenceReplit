import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TestCycle } from "@/hooks/test-execution";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  testingMode: z.string().default("manual"),
  testDeploymentUrl: z.string().optional(),
  testData: z.record(z.any()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TestCycleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  editData?: TestCycle;
  title?: string;
}

export function TestCycleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
  title = "New Test Cycle"
}: TestCycleFormDialogProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [testDataEntries, setTestDataEntries] = useState<Array<{key: string, value: string, description?: string}>>([]);
  
  // Initialize form with edit data if available
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editData ? {
      name: editData.name,
      description: editData.description || "",
      status: editData.status,
      startDate: new Date(editData.startDate),
      endDate: editData.endDate ? new Date(editData.endDate) : undefined,
      testingMode: editData.testingMode || "manual",
      testDeploymentUrl: editData.testDeploymentUrl || "",
      testData: editData.testData || {},
    } : {
      name: "",
      description: "",
      status: "created",
      startDate: new Date(),
      endDate: undefined,
      testingMode: "manual",
      testDeploymentUrl: "",
      testData: {},
    },
  });

  // Initialize test data entries when edit data changes
  useEffect(() => {
    if (editData && editData.testData) {
      const entries = Object.entries(editData.testData).map(([key, value]) => ({
        key,
        value: typeof value === 'object' && value !== null ? (value as any).value || JSON.stringify(value) : String(value),
        description: typeof value === 'object' && value !== null ? (value as any).description || '' : ''
      }));
      setTestDataEntries(entries);
    } else {
      setTestDataEntries([]);
    }
  }, [editData]);

  const handleSubmit = (values: FormValues) => {
    // Convert testDataEntries back to testData object
    const testData: Record<string, any> = {};
    testDataEntries.forEach(entry => {
      if (entry.key.trim()) {
        testData[entry.key] = {
          value: entry.value,
          description: entry.description || ''
        };
      }
    });
    
    onSubmit({
      ...values,
      testData
    });
    onOpenChange(false);
  };

  const addTestDataEntry = () => {
    setTestDataEntries([...testDataEntries, { key: '', value: '', description: '' }]);
  };

  const removeTestDataEntry = (index: number) => {
    setTestDataEntries(testDataEntries.filter((_, i) => i !== index));
  };

  const updateTestDataEntry = (index: number, field: 'key' | 'value' | 'description', value: string) => {
    const updated = [...testDataEntries];
    updated[index][field] = value;
    setTestDataEntries(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Create a new test cycle to organize and track test case execution.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter cycle name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter cycle description"
                      rows={3} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setStartDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setEndDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="testingMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testing Mode</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select testing mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual Testing</SelectItem>
                      <SelectItem value="ai-assisted-manual">AI-Assisted Manual</SelectItem>
                      <SelectItem value="automated">Automated Testing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="testDeploymentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Deployment URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://staging.example.com"
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Test Data Configuration
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestDataEntry}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Entry
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testDataEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No test data entries. Click "Add Entry" to define test data variables.
                  </p>
                ) : (
                  testDataEntries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <Input
                          placeholder="Key"
                          value={entry.key}
                          onChange={(e) => updateTestDataEntry(index, 'key', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Value"
                          value={entry.value}
                          onChange={(e) => updateTestDataEntry(index, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          placeholder="Description (optional)"
                          value={entry.description}
                          onChange={(e) => updateTestDataEntry(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestDataEntry(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editData ? "Update Cycle" : "Create Cycle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}