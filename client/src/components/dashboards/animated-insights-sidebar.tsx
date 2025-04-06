import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, TrendingUp, BarChart, Brain, Zap, BarChart3, ArrowUpRight, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useProject } from "@/context/ProjectContext";

// Animation variants for the data points
const dataPointVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.8,
  },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }
  }),
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      duration: 0.2
    }
  }
};

// Animation variants for insights
const insightVariants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.15 + 0.3,
      duration: 0.5
    }
  }),
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.3
    }
  }
};

// Data Insights Item Component
interface DataInsightProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
  index: number;
}

const DataInsight = ({ icon, title, value, trend, trendValue, color, index }: DataInsightProps) => (
  <motion.div
    className={cn(
      "p-3 rounded-lg bg-atmf-card border border-white/5 flex items-center justify-between",
      "hover:border-white/20 transition-colors cursor-pointer"
    )}
    variants={dataPointVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    custom={index}
    whileHover="hover"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-atmf-muted">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
    {trend && (
      <div className={cn(
        "flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
        trend === "up" ? "text-green-400 bg-green-950/40" : 
        trend === "down" ? "text-red-400 bg-red-950/40" : 
        "text-blue-400 bg-blue-950/40"
      )}>
        {trend === "up" ? <TrendingUp className="h-3 w-3" /> : 
         trend === "down" ? <TrendingUp className="h-3 w-3 rotate-180" /> : 
         <BarChart className="h-3 w-3" />}
        {trendValue}
      </div>
    )}
  </motion.div>
);

// AI-Generated Insight Component
interface AIInsightProps {
  text: string;
  index: number;
}

const AIInsight = ({ text, index }: AIInsightProps) => (
  <motion.div
    className="p-3 rounded-lg bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-400/30 
               backdrop-blur-md shadow-lg hover:shadow-blue-500/20"
    variants={insightVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    custom={index}
    whileHover={{ 
      scale: 1.02, 
      transition: { duration: 0.2 },
      boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)"
    }}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 rounded-full bg-blue-400/20">
        <Sparkles className="h-3.5 w-3.5 text-blue-300" />
      </div>
      <p className="text-xs text-blue-300 font-medium">AI Insight</p>
    </div>
    <p className="text-sm text-blue-100/90">{text}</p>
    
    {/* Animation effect - subtle glowing border */}
    <motion.div
      className="absolute inset-0 rounded-lg z-[-1]"
      style={{ 
        background: "transparent",
        boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.1)" 
      }}
      animate={{ 
        boxShadow: ["0 0 0 1px rgba(59, 130, 246, 0.1)", "0 0 0 2px rgba(59, 130, 246, 0.3)", "0 0 0 1px rgba(59, 130, 246, 0.1)"]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.div>
);

// Dancing Data Point Component
interface DataPointProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const DataPoint = ({ x, y, size, color, delay }: DataPointProps) => (
  <motion.div
    className={`absolute rounded-full ${color} shadow-glow`}
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      // Enhance glow effect with stronger shadow
      boxShadow: `0 0 ${size * 2}px ${size}px ${color.replace('/80', '')}`,
      filter: 'blur(0.5px)'
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.9, 0],
      scale: [0, 1.2, 0],
      // More dynamic movement
      x: [0, Math.random() * 40 - 20, 0],
      y: [0, Math.random() * 40 - 20, 0],
    }}
    transition={{
      duration: 4, // Longer animation
      ease: "easeInOut",
      delay: delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 1.5,
    }}
  />
);

// Main Component
export function AnimatedInsightsSidebar() {
  const { selectedProject } = useProject();
  const [insights, setInsights] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false); // Start expanded by default
  const [dataPoints, setDataPoints] = useState<DataPointProps[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Generate insights based on the current project
  useEffect(() => {
    if (!selectedProject) return;

    // Generate insights
    const projectInsights = [
      `Test coverage for the ${selectedProject.name} project has increased by 12% this month.`,
      `AI analysis suggests automating the checkout flow tests could reduce test execution time by 40%.`,
      `Recent test failures exhibit patterns related to network connectivity. Consider improving resilience testing.`,
      `Based on historical data, feature X has a 75% higher defect rate than other areas. Consider increasing test coverage.`,
      `Automated visual testing could reduce regression issues by up to 60% for this project type.`,
    ];

    // Randomly select 3 insights
    const shuffled = [...projectInsights].sort(() => 0.5 - Math.random());
    setInsights(shuffled.slice(0, 3));

    // Generate dancing data points
    const newDataPoints = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.floor(Math.random() * 8) + 4, // Larger data points
      color: [
        "bg-blue-500/80", 
        "bg-purple-500/80", 
        "bg-green-500/80", 
        "bg-teal-500/80",
        "bg-indigo-500/80",
        "bg-cyan-500/80"
      ][Math.floor(Math.random() * 6)],
      delay: Math.random() * 2,
    }));
    setDataPoints(newDataPoints);
  }, [selectedProject, refreshTrigger]);

  // Auto-refresh insights every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  if (!selectedProject) return null;

  return (
    <motion.div
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300",
        collapsed ? "translate-x-[calc(100%-2.5rem)]" : "translate-x-0"
      )}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: collapsed ? "calc(100% - 2.5rem)" : 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        duration: 0.8,
        stiffness: 100,
        damping: 15
      }}
    >
      {/* Collapse/Expand Button */}
      <Button
        size="sm"
        variant="outline"
        className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 border border-white/10 bg-atmf-card shadow-lg"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
      </Button>

      {/* Main Sidebar Container */}
      <motion.div 
        className={cn(
          "w-64 bg-gradient-to-l from-black/80 to-black/50 backdrop-blur-md rounded-l-lg border-l border-y border-white/10",
          "flex flex-col overflow-hidden",
          "h-[60vh] max-h-[500px]"
        )}
        initial={{ boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)" }}
        animate={{ 
          boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0)", "0 0 30px 5px rgba(59, 130, 246, 0.3)", "0 0 0 0 rgba(59, 130, 246, 0)"]
        }}
        transition={{
          duration: 2,
          times: [0, 0.5, 1],
          repeat: 3,
          repeatType: "reverse"
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <h3 className="font-medium text-sm">Project Insights</h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            <Zap className="h-4 w-4 text-blue-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 overflow-y-auto relative">
          {/* Dancing data points in the background */}
          {dataPoints.map((point, i) => (
            <DataPoint key={i} {...point} />
          ))}

          {/* Data insights */}
          <div className="space-y-3 relative z-10">
            <AnimatePresence mode="wait">
              <DataInsight
                key="insight-1"
                icon={<BarChart className="h-5 w-5 text-white" />}
                title="Test Coverage"
                value="78%"
                trend="up"
                trendValue="+12%"
                color="bg-blue-500/20"
                index={0}
              />
              <DataInsight
                key="insight-2"
                icon={<ArrowUpRight className="h-5 w-5 text-white" />}
                title="Success Rate"
                value="92.5%"
                trend="up"
                trendValue="+3.5%"
                color="bg-green-500/20"
                index={1}
              />
              <DataInsight
                key="insight-3"
                icon={<BarChart3 className="h-5 w-5 text-white" />}
                title="Automation Score"
                value="3.8/5"
                trend="neutral"
                trendValue="stable"
                color="bg-purple-500/20"
                index={2}
              />
            </AnimatePresence>
          </div>

          {/* AI Insights */}
          <div className="space-y-3 mt-4 relative z-10">
            <h4 className="text-xs text-atmf-muted font-medium pl-2">OPPORTUNITIES</h4>
            <AnimatePresence>
              {insights.map((insight, i) => (
                <AIInsight key={`ai-insight-${i}-${refreshTrigger}`} text={insight} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}