import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    xs: "h-3 w-3 border-[1.5px]",
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
    xl: "h-12 w-12 border-4",
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full border-primary/30 border-t-primary animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}