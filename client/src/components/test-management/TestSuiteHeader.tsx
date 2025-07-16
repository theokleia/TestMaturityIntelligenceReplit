import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ListFilter, 
  FolderPlus, 
  Search, 
  Plus, 
  Brain
} from "lucide-react";

interface TestSuiteHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onCreateSuite: () => void;
  onAIGenerate: () => void;
}

export function TestSuiteHeader({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateSuite,
  onAIGenerate
}: TestSuiteHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search test suites..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onAIGenerate}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">AI Generate</span>
        </Button>
        <Button
          onClick={onCreateSuite}
          className="flex items-center gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Suite</span>
        </Button>
      </div>
    </div>
  );
}