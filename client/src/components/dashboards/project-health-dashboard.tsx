import { useProject } from "@/context/ProjectContext";
import { ATMFCard, ATMFCardBody, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { HealthIndicator, HealthIndicatorGroup, HealthStatus } from "@/components/design-system/health-indicator";
import { useState, useEffect } from "react";
import { AlertCircle, ShieldAlert, Activity, Bug, Code, ClipboardCheck, GitBranch, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Types for health data
interface HealthCategory {
  name: string;
  icon: React.ReactNode;
  metrics: HealthMetric[];
}

interface HealthMetric {
  name: string;
  status: HealthStatus;
  value?: number;
  target?: number;
  unit?: string;
}

export function ProjectHealthDashboard() {
  const { selectedProject, projects } = useProject();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthCategory[]>([]);
  
  // Fetch health data when project changes
  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      
      // Simulate fetching data from API
      // In a real application, this would be an API call
      setTimeout(() => {
        // Generate random but consistent health data for the selected project
        // In a real app, this would come from the API
        const generatedData = generateHealthData(selectedProject.id);
        setHealthData(generatedData);
        setLoading(false);
      }, 800);
    } else {
      // No project selected
      setHealthData([]);
      setLoading(false);
    }
  }, [selectedProject]);
  
  // Function to generate deterministic health data based on project ID
  const generateHealthData = (projectId: number): HealthCategory[] => {
    // Use project ID as a seed for pseudo-randomness
    // This ensures the same project always gets the same health data in this demo
    const seed = projectId;
    
    // Simple pseudo-random function based on the seed
    const getPseudoRandom = (offset: number) => {
      const value = (seed * 9301 + offset * 49297) % 233280;
      return value / 233280;
    };
    
    // Helper to get a random status with specific weights
    const getWeightedStatus = (goodChance: number, offset: number): HealthStatus => {
      const rand = getPseudoRandom(offset);
      if (rand < goodChance * 0.8) return "healthy";
      if (rand < goodChance * 0.8 + 0.15) return "warning"; 
      return "critical";
    };
    
    // Calculate the overall project health factor (0-1)
    // Different projects will have different health profiles
    let healthFactor: number;
    
    // Projects 1 and 3 are in good shape, 2 and 5 are okay, 4 is struggling
    switch (projectId) {
      case 1: // E-Commerce Platform
        healthFactor = 0.85;
        break;
      case 2: // Banking API
        healthFactor = 0.65;
        break;
      case 3: // Healthcare Mobile App
        healthFactor = 0.9;
        break;
      case 4: // Cloud Infrastructure
        healthFactor = 0.4;
        break;
      case 5: // IoT Device Management
        healthFactor = 0.7;
        break;
      default:
        // Custom projects created by the user
        healthFactor = 0.5 + getPseudoRandom(0) * 0.5; // 0.5 to 1.0
    }
    
    return [
      {
        name: "Test Quality",
        icon: <ClipboardCheck className="h-5 w-5 text-blue-400" />,
        metrics: [
          {
            name: "Code Coverage",
            status: getWeightedStatus(healthFactor, 1),
            value: Math.round(30 + healthFactor * 60),
            target: 80,
            unit: "%"
          },
          {
            name: "Test Case Quality",
            status: getWeightedStatus(healthFactor, 2),
            value: Math.round(2 + healthFactor * 3),
            target: 4,
            unit: "/5"
          },
          {
            name: "Documentation",
            status: getWeightedStatus(healthFactor, 3),
            value: Math.round(40 + healthFactor * 55),
            target: 90,
            unit: "%"
          }
        ]
      },
      {
        name: "Build & CI",
        icon: <GitBranch className="h-5 w-5 text-purple-400" />,
        metrics: [
          {
            name: "Pipeline Success",
            status: getWeightedStatus(healthFactor, 4),
            value: Math.round(70 + healthFactor * 30),
            target: 95,
            unit: "%"
          },
          {
            name: "Build Time",
            status: getWeightedStatus(healthFactor, 5),
            value: Math.round(15 - healthFactor * 10),
            target: 5,
            unit: "min"
          },
          {
            name: "Deployment Frequency",
            status: getWeightedStatus(healthFactor, 6),
            value: Math.round(healthFactor * 14),
            target: 7,
            unit: "/week"
          }
        ]
      },
      {
        name: "Security & Compliance",
        icon: <ShieldAlert className="h-5 w-5 text-red-400" />,
        metrics: [
          {
            name: "Vulnerability Tests",
            status: getWeightedStatus(healthFactor, 7),
            value: Math.round(70 + healthFactor * 30),
            target: 100,
            unit: "%"
          },
          {
            name: "Critical Threats",
            status: getWeightedStatus(1 - healthFactor * 0.8, 8), // Invert health factor for threats
            value: Math.round(10 - healthFactor * 9),
            target: 0,
            unit: ""
          },
          {
            name: "Compliance Score",
            status: getWeightedStatus(healthFactor, 9),
            value: Math.round(50 + healthFactor * 45),
            target: 90,
            unit: "%"
          }
        ]
      },
      {
        name: "Performance & Reliability",
        icon: <Activity className="h-5 w-5 text-green-400" />,
        metrics: [
          {
            name: "Page Load Speed",
            status: getWeightedStatus(healthFactor, 10),
            value: Math.round(3000 - healthFactor * 2500),
            target: 1000,
            unit: "ms"
          },
          {
            name: "API Response Time",
            status: getWeightedStatus(healthFactor, 11),
            value: Math.round(300 - healthFactor * 250),
            target: 100,
            unit: "ms"
          },
          {
            name: "Uptime",
            status: getWeightedStatus(healthFactor, 12),
            value: 99.0 + healthFactor * 0.99,
            target: 99.9,
            unit: "%"
          }
        ]
      },
      {
        name: "Issues & Bugs",
        icon: <Bug className="h-5 w-5 text-orange-400" />,
        metrics: [
          {
            name: "Open Bugs",
            status: getWeightedStatus(1 - healthFactor * 0.7, 13), // Invert health factor
            value: Math.round(50 - healthFactor * 45),
            target: 10,
            unit: ""
          },
          {
            name: "Critical Issues",
            status: getWeightedStatus(1 - healthFactor * 0.9, 14), // Invert health factor
            value: Math.round(8 - healthFactor * 7),
            target: 0,
            unit: ""
          },
          {
            name: "Average Resolution",
            status: getWeightedStatus(healthFactor, 15),
            value: Math.round(5 - healthFactor * 3.5),
            target: 2,
            unit: "days"
          }
        ]
      }
    ];
  };
  
  // Function to calculate overall health status from all metrics
  const calculateOverallHealth = (): HealthStatus => {
    if (!healthData.length) return "unknown";
    
    let criticalCount = 0;
    let warningCount = 0;
    let healthyCount = 0;
    let totalCount = 0;
    
    healthData.forEach(category => {
      category.metrics.forEach(metric => {
        totalCount++;
        if (metric.status === "critical") criticalCount++;
        if (metric.status === "warning") warningCount++;
        if (metric.status === "healthy") healthyCount++;
      });
    });
    
    // Define thresholds for overall health
    const criticalPercent = (criticalCount / totalCount) * 100;
    const warningPercent = (warningCount / totalCount) * 100;
    
    if (criticalPercent >= 20) return "critical";
    if (criticalPercent >= 5 || warningPercent >= 25) return "warning";
    return "healthy";
  };
  
  // If no project is selected, show a placeholder
  if (!selectedProject) {
    return (
      <ATMFCard>
        <ATMFCardBody className="py-12 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-atmf-muted mb-4" />
          <h3 className="text-lg font-medium text-center">No Project Selected</h3>
          <p className="text-atmf-muted text-center max-w-md mt-2">
            Please select a project from the dropdown to view its health dashboard.
          </p>
        </ATMFCardBody>
      </ATMFCard>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <ATMFCard>
        <ATMFCardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-44 bg-atmf-card-alt" />
            <Skeleton className="h-8 w-32 bg-atmf-card-alt" />
          </div>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-4 rounded-lg bg-atmf-card-alt">
                <Skeleton className="h-6 w-32 mb-4 bg-atmf-main" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-atmf-main" />
                  <Skeleton className="h-4 w-2/3 bg-atmf-main" />
                  <Skeleton className="h-4 w-3/4 bg-atmf-main" />
                </div>
              </div>
            ))}
          </div>
        </ATMFCardBody>
      </ATMFCard>
    );
  }
  
  // Calculate overall health status
  const overallHealth = calculateOverallHealth();
  
  // Get overall health label
  const getOverallHealthLabel = (): string => {
    switch (overallHealth) {
      case "critical": return "Critical Issues";
      case "warning": return "Needs Attention";
      case "healthy": return "Good Health";
      default: return "Unknown";
    }
  };
  
  return (
    <ATMFCard className="overflow-hidden">
      <ATMFCardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-400" />
            Project Health Overview
          </h3>
          <div className="flex items-center px-3 py-1.5 rounded-full bg-atmf-main">
            <span className="text-sm mr-2">Overall Health:</span>
            <HealthIndicator 
              status={overallHealth} 
              label={getOverallHealthLabel()}
              showLabel={true}
            />
          </div>
        </div>
      </ATMFCardHeader>
      <ATMFCardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.map((category, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-lg bg-atmf-card-alt border border-white/5 hover:border-white/10 transition-colors"
            >
              <h4 className="font-medium flex items-center mb-3 text-white">
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </h4>
              <div className="space-y-3">
                {category.metrics.map((metric, metricIdx) => (
                  <div key={metricIdx} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <HealthIndicator status={metric.status} size="sm" className="mr-2" />
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    <div className="text-sm flex items-center">
                      {metric.value !== undefined && (
                        <span 
                          className={
                            metric.status === "critical" ? "text-red-400" : 
                            metric.status === "warning" ? "text-amber-400" : 
                            "text-emerald-400"
                          }
                        >
                          {typeof metric.value === 'number' && metric.value.toFixed ? 
                            metric.value.toFixed(metric.unit === "%" || metric.unit === "/5" ? 1 : 0) : 
                            metric.value}
                          {metric.unit}
                        </span>
                      )}
                      {metric.target !== undefined && (
                        <span className="text-atmf-muted ml-1 text-xs">
                          /{metric.target}{metric.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-atmf-card-alt border border-white/5">
          <h4 className="font-medium flex items-center mb-4">
            <Clock className="h-5 w-5 mr-2 text-blue-400" />
            <span>Last Updated Health Metrics</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {healthData.map((category, idx) => (
              <div key={idx}>
                <h5 className="text-sm font-medium mb-2 flex items-center">
                  {category.icon}
                  <span className="ml-1">{category.name}</span>
                </h5>
                <HealthIndicatorGroup 
                  items={category.metrics.map(m => ({ status: m.status, label: m.name }))}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      </ATMFCardBody>
    </ATMFCard>
  );
}