import { glassmorphismStyles } from "@/lib/glassmorphism";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  className?: string;
}

export function Header({ title, className }: HeaderProps) {
  return (
    <header className={cn(
      "h-14 border-b border-white/5 flex items-center justify-between px-6",
      glassmorphismStyles.light,
      className
    )}>
      <h1 className="text-lg font-heading font-medium">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <i className="bx bx-search text-lg text-text-muted absolute left-3 top-1/2 transform -translate-y-1/2"></i>
          <input 
            type="text" 
            placeholder="Search..." 
            className="glassmorphism-light pl-10 pr-4 py-2 rounded-lg text-sm text-text-light w-56 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        
        <button className="h-9 w-9 rounded-full glassmorphism-light flex items-center justify-center hover:bg-primary/10 transition-colors">
          <i className="bx bx-bell text-lg text-text-muted"></i>
        </button>
        
        <button className="h-9 w-9 rounded-full glassmorphism-light flex items-center justify-center hover:bg-primary/10 transition-colors">
          <i className="bx bx-cog text-lg text-text-muted"></i>
        </button>
      </div>
    </header>
  );
}