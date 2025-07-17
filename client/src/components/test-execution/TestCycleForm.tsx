import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Test data item schema for structured test data
const testDataItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.string(),
  description: z.string().optional(),
});

// Test cycle form schema
const testCycleSchema = z.object({
  name: z.string().min(1, "Cycle name is required"),
  description: z.string().optional(),
  status: z.string().default("planned"),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  testingMode: z.string().default("manual"),
  testDeploymentUrl: z.string().url().optional().or(z.literal("")),
  testData: z.array(testDataItemSchema).default([]),
});

export type TestCycleFormValues = z.infer<typeof testCycleSchema>;

interface TestCycleFormProps {
  initialValues?: Partial<TestCycleFormValues>;
  onSubmit: (data: TestCycleFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

// Test Data Manager Component
interface TestDataItem {
  title: string;
  value: string;
  description?: string;
}

interface TestDataManagerProps {
  value: TestDataItem[];
  onChange: (value: TestDataItem[]) => void;
}

function TestDataManager({ value = [], onChange }: TestDataManagerProps) {
  const [items, setItems] = useState<TestDataItem[]>(value || []);

  // Sync internal state with prop value changes
  useEffect(() => {
    setItems(value || []);
  }, [value]);

  const addItem = () => {
    const newItems = [...items, { title: "", value: "", description: "" }];
    setItems(newItems);
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  const updateItem = (index: number, field: string, newValue: string) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Test Data</h4>
          <p className="text-xs text-muted-foreground">
            Define structured test data for this cycle
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus size={14} className="mr-1" />
          Add Data
        </Button>
      </div>
      
      {items.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Data Item {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X size={12} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Title (e.g., User ID)"
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                />
                <Input
                  placeholder="Value (e.g., user123)"
                  value={item.value}
                  onChange={(e) => updateItem(index, "value", e.target.value)}
                />
              </div>
              
              <Input
                placeholder="Description (optional)"
                value={item.description || ""}
                onChange={(e) => updateItem(index, "description", e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple DatePicker component
interface DatePickerProps {
  selected?: Date | null;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  fromDate?: Date;
}

function DatePicker({ selected, onSelect, placeholder = "Pick a date", fromDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected || undefined}
          onSelect={(date) => {
            onSelect(date);
            setOpen(false);
          }}
          disabled={(date) => fromDate ? date < fromDate : false}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function TestCycleForm({ 
  initialValues = {}, 
  onSubmit, 
  isSubmitting = false,
  submitLabel = "Create Test Cycle"
}: TestCycleFormProps) {
  const form = useForm<TestCycleFormValues>({
    resolver: zodResolver(testCycleSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planned",
      startDate: null,
      endDate: null,
      testingMode: "manual",
      testDeploymentUrl: "",
      testData: [],
      ...initialValues
    }
  });

  // Reset form when initialValues change
  useEffect(() => {
    console.log("TestCycleForm - initialValues changed:", initialValues);
    form.reset({
      name: "",
      description: "",
      status: "planned",
      startDate: null,
      endDate: null,
      testingMode: "manual",
      testDeploymentUrl: "",
      testData: [],
      ...initialValues
    });
  }, [initialValues, form]);

  const handleSubmit = (data: TestCycleFormValues) => {
    console.log("TestCycleForm - submitting data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Sprint 12 Regression Tests" />
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
                  placeholder="Enter test cycle description"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="testingMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Testing Mode</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select testing mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="ai-assisted-manual">AI-Assisted Manual</SelectItem>
                    <SelectItem value="automated">Automated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  placeholder="Select start date"
                />
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
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  placeholder="Select end date"
                  fromDate={form.watch("startDate") || undefined}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="testDeploymentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Deployment URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://staging.myapp.com" />
              </FormControl>
              <FormDescription>
                URL where testers or AI can access the application for testing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <TestDataManager 
          value={form.watch("testData")}
          onChange={(testData) => form.setValue("testData", testData)}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}