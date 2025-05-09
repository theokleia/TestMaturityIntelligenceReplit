import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/design-system/status-badge";
import { Pencil, Trash } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { TestCycle } from "@/hooks/test-execution";

interface TestCycleTableProps {
  testCycles: TestCycle[];
  isLoading: boolean;
  onView: (cycleId: number) => void;
  onEdit: (cycle: TestCycle) => void;
  onDelete: (cycleId: number) => void;
}

export function TestCycleTable({ 
  testCycles, 
  isLoading, 
  onView, 
  onEdit, 
  onDelete 
}: TestCycleTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<number | null>(null);

  const handleDeleteClick = (cycleId: number) => {
    setCycleToDelete(cycleId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cycleToDelete !== null) {
      onDelete(cycleToDelete);
      setDeleteDialogOpen(false);
      setCycleToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading test cycles...</div>;
  }

  if (!testCycles || testCycles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No test cycles found. Create a new test cycle to get started.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testCycles.map((cycle) => (
            <TableRow key={cycle.id}>
              <TableCell className="font-medium">{cycle.name}</TableCell>
              <TableCell>
                <StatusBadge variant="cycle" status={cycle.status} />
              </TableCell>
              <TableCell>{formatDate(cycle.startDate)}</TableCell>
              <TableCell>{formatDate(cycle.endDate)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onView(cycle.id)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(cycle)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteClick(cycle.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-80">
            <h3 className="font-semibold text-lg mb-2">Delete Test Cycle</h3>
            <p className="mb-4">Are you sure you want to delete this test cycle? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}