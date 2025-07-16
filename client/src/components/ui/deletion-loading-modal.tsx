import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeletionLoadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: "test suite" | "test case" | "project";
  stage: "deleting" | "success" | "error";
  message?: string;
  deletedCount?: number;
}

const stages = [
  { text: "Preparing deletion...", delay: 0 },
  { text: "Removing linked data...", delay: 800 },
  { text: "Finalizing cleanup...", delay: 1600 },
  { text: "Complete!", delay: 2400 }
];

export function DeletionLoadingModal({
  open,
  onOpenChange,
  itemName,
  itemType,
  stage,
  message,
  deletedCount = 0
}: DeletionLoadingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-sm shadow-2xl">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            {stage === "deleting" && (
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-destructive/20 animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-destructive animate-spin" />
                <Trash2 className="absolute inset-0 m-auto w-6 h-6 text-destructive animate-bounce" />
              </div>
            )}
            
            {stage === "success" && (
              <div className="relative animate-in zoom-in-50 duration-500">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            )}
            
            {stage === "error" && (
              <div className="relative animate-in zoom-in-50 duration-500">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">
              {stage === "deleting" && `Deleting ${itemType}`}
              {stage === "success" && "Deletion Complete"}
              {stage === "error" && "Deletion Failed"}
            </h3>
            
            <p className="text-sm text-muted-foreground max-w-sm">
              {stage === "deleting" && (
                <>
                  Removing "<span className="font-medium">{itemName}</span>" and all related data...
                </>
              )}
              {stage === "success" && (
                <>
                  Successfully deleted "<span className="font-medium">{itemName}</span>"
                  {deletedCount > 0 && ` and ${deletedCount} related test cases`}
                </>
              )}
              {stage === "error" && (
                message || `Failed to delete "${itemName}". Please try again.`
              )}
            </p>
          </div>

          {/* Animated Progress Dots */}
          {stage === "deleting" && (
            <div className="flex space-x-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full bg-destructive/30",
                    "animate-pulse"
                  )}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: "1s"
                  }}
                />
              ))}
            </div>
          )}

          {/* Stage Progress */}
          {stage === "deleting" && (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progress</span>
                <span>Processing...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-destructive h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}