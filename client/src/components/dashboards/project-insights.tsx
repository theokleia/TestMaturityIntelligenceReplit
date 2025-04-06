import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, BarChart, Brain, Zap, BarChart3, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject, Project } from "@/context/ProjectContext";
import { ATMFCard, ATMFCardBody, ATMFCardHeader } from "@/components/design-system/atmf-card";

// Animation variants for insights
const insightVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4
    }
  }),
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3
    }
  }
};

// Data Insights Item Component
interface DataInsightProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  color: string;
  index: number;
}

const DataInsight = ({ icon, title, value, trend, trendValue, color, index }: DataInsightProps) => {
  return (
    <motion.div
      variants={insightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index}
      className={`flex items-center p-3 rounded-xl ${color} hover:bg-opacity-30 transition-all duration-200`}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="ml-3 flex-1">
        <div className="text-xs text-atmf-muted font-medium">{title}</div>
        <div className="flex items-center justify-between">
          <div className="text-base font-bold">{value}</div>
          <div className={`flex items-center text-xs ${
            trend === "up" ? "text-green-400" : 
            trend === "down" ? "text-red-400" : 
            "text-gray-400"
          }`}>
            {trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend === "down" && <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />}
            {trendValue}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// AI Insight Component
interface AIInsightProps {
  text: string;
  index: number;
}

const AIInsight = ({ text, index }: AIInsightProps) => {
  return (
    <motion.div
      variants={insightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index + 3} // Start after the data insights
      className="p-3 bg-gradient-to-r from-[#2E75FF]/10 to-[#8A56FF]/10 rounded-xl border border-white/5 backdrop-blur-sm"
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex">
        <div className="mr-2 mt-0.5">
          <Sparkles className="h-4 w-4 text-[#8A56FF]" />
        </div>
        <p className="text-sm">{text}</p>
      </div>
    </motion.div>
  );
};

// Main Component
export function ProjectInsights() {
  const { selectedProject } = useProject();
  const [insights, setInsights] = useState<string[]>([]);
  const [localSelectedProject, setLocalSelectedProject] = useState<Project | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Keep a local copy of the selected project to prevent issues with context changes
  useEffect(() => {
    if (selectedProject) {
      setLocalSelectedProject(selectedProject);
    }
  }, [selectedProject]);

  // Generate insights based on the current project
  useEffect(() => {
    if (!selectedProject && !localSelectedProject) return;
    
    // Use local copy if available for stability
    const currentProject = localSelectedProject || selectedProject;
    
    // Safety check
    if (!currentProject) return;

    // Generate insights with non-null assertion since we've checked already
    const projectInsights = [
      `Test coverage for the ${currentProject!.name} project has increased by 12% this month.`,
      `AI analysis suggests automating the checkout flow tests could reduce test execution time by 40%.`,
      `Recent test failures exhibit patterns related to network connectivity. Consider improving resilience testing.`,
      `Based on historical data, feature X has a 75% higher defect rate than other areas. Consider increasing test coverage.`,
      `Automated visual testing could reduce regression issues by up to 60% for this project type.`,
    ];

    // Randomly select 3 insights
    const shuffled = [...projectInsights].sort(() => 0.5 - Math.random());
    setInsights(shuffled.slice(0, 3));
  }, [selectedProject, localSelectedProject, refreshTrigger]);

  // Auto-refresh insights occasionally
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 60000); // Every minute

    return () => clearInterval(timer);
  }, []);

  // Use either the selected project from context or our local copy
  const currentProject = localSelectedProject || selectedProject;
  if (!currentProject) return null;

  return (
    <ATMFCard>
      <ATMFCardHeader>
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold">Project Insights & Opportunities</h3>
        </div>
      </ATMFCardHeader>
      <ATMFCardBody>
        <div className="space-y-5">
          {/* Data insights */}
          <div className="space-y-3">
            <h4 className="text-xs text-atmf-muted font-medium pl-2">KEY METRICS</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DataInsight
                icon={<BarChart className="h-5 w-5 text-white" />}
                title="Test Coverage"
                value="78%"
                trend="up"
                trendValue="+12%"
                color="bg-blue-500/20"
                index={0}
              />
              <DataInsight
                icon={<ArrowUpRight className="h-5 w-5 text-white" />}
                title="Success Rate"
                value="92.5%"
                trend="up"
                trendValue="+3.5%"
                color="bg-green-500/20"
                index={1}
              />
              <DataInsight
                icon={<BarChart3 className="h-5 w-5 text-white" />}
                title="Automation Score"
                value="3.8/5"
                trend="neutral"
                trendValue="stable"
                color="bg-purple-500/20"
                index={2}
              />
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-3">
            <h4 className="text-xs text-atmf-muted font-medium pl-2">AI OPPORTUNITIES</h4>
            <div className="space-y-3">
              <AnimatePresence>
                {insights.map((insight, i) => (
                  <AIInsight key={`ai-insight-${i}-${refreshTrigger}`} text={insight} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </ATMFCardBody>
    </ATMFCard>
  );
}