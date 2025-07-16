import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  orientation?: "vertical" | "horizontal" | "both";
}

const CustomScrollbar = forwardRef<HTMLDivElement, CustomScrollbarProps>(
  ({ children, className, maxHeight = "400px", orientation = "vertical" }, ref) => {
    const scrollbarClasses = cn(
      "relative overflow-auto",
      // Base scrollbar styling - making it more visible
      "[&::-webkit-scrollbar]:w-3",
      "[&::-webkit-scrollbar]:h-3",
      "[&::-webkit-scrollbar-track]:bg-gray-100",
      "[&::-webkit-scrollbar-track]:rounded-full",
      "[&::-webkit-scrollbar-track]:border",
      "[&::-webkit-scrollbar-track]:border-gray-200",
      
      // Scrollbar thumb styling - dark blue theme, more opaque
      "[&::-webkit-scrollbar-thumb]:bg-blue-600/80",
      "[&::-webkit-scrollbar-thumb]:rounded-full",
      "[&::-webkit-scrollbar-thumb]:border-2",
      "[&::-webkit-scrollbar-thumb]:border-gray-100",
      "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
      
      // Hover states
      "[&::-webkit-scrollbar-thumb]:hover:bg-blue-700",
      "[&::-webkit-scrollbar-thumb]:active:bg-blue-800",
      
      // Dark mode adjustments
      "dark:[&::-webkit-scrollbar-track]:bg-gray-800",
      "dark:[&::-webkit-scrollbar-track]:border-gray-700",
      "dark:[&::-webkit-scrollbar-thumb]:bg-blue-400/80",
      "dark:[&::-webkit-scrollbar-thumb]:border-gray-800",
      "dark:[&::-webkit-scrollbar-thumb]:hover:bg-blue-300",
      "dark:[&::-webkit-scrollbar-thumb]:active:bg-blue-200",
      
      // Corner styling
      "[&::-webkit-scrollbar-corner]:bg-transparent",
      
      // Firefox scrollbar
      "scrollbar-thin",
      "scrollbar-track-transparent",
      "scrollbar-thumb-blue-600/60",
      "hover:scrollbar-thumb-blue-600/80",
      
      // Orientation-specific classes
      orientation === "vertical" && "[&::-webkit-scrollbar-horizontal]:h-0",
      orientation === "horizontal" && "[&::-webkit-scrollbar-vertical]:w-0",
      
      className
    );

    return (
      <div
        ref={ref}
        className={scrollbarClasses}
        style={{ maxHeight }}
      >
        {children}
      </div>
    );
  }
);

CustomScrollbar.displayName = "CustomScrollbar";

export { CustomScrollbar };