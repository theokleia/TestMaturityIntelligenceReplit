import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  color: string;
  borderColor: string;
  type: 'main' | 'child' | 'grandchild';
}

interface Connection {
  source: string;
  target: string;
  color: string;
}

interface NodeInfoPanelProps {
  node: Node;
  x: number;
  y: number;
}

interface InteractiveMindmapProps {
  className?: string;
}

export function InteractiveMindmap({ className }: InteractiveMindmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  
  // Define nodes and connections
  const nodes: Node[] = [
    // Main node
    {
      id: 'main',
      x: 400,
      y: 200,
      radius: 60,
      label: 'Automation Intelligence',
      color: 'rgba(46, 117, 255, 0.2)',
      borderColor: '#2E75FF',
      type: 'main'
    },
    // Child nodes
    {
      id: 'testStrategy',
      x: 580,
      y: 120,
      radius: 40,
      label: 'Test Strategy',
      color: 'rgba(138, 86, 255, 0.2)',
      borderColor: '#8A56FF',
      type: 'child'
    },
    {
      id: 'tools',
      x: 580,
      y: 280,
      radius: 40,
      label: 'Tools',
      color: 'rgba(138, 86, 255, 0.2)',
      borderColor: '#8A56FF',
      type: 'child'
    },
    {
      id: 'processes',
      x: 220,
      y: 120,
      radius: 40,
      label: 'Processes',
      color: 'rgba(138, 86, 255, 0.2)',
      borderColor: '#8A56FF',
      type: 'child'
    },
    {
      id: 'metrics',
      x: 220,
      y: 280,
      radius: 40,
      label: 'Metrics',
      color: 'rgba(138, 86, 255, 0.2)',
      borderColor: '#8A56FF',
      type: 'child'
    },
    // Grandchild nodes
    {
      id: 'coverage',
      x: 690,
      y: 100,
      radius: 25,
      label: 'Coverage',
      color: 'rgba(47, 255, 221, 0.1)',
      borderColor: '#2FFFDD',
      type: 'grandchild'
    },
    {
      id: 'selenium',
      x: 690,
      y: 300,
      radius: 25,
      label: 'Selenium',
      color: 'rgba(47, 255, 221, 0.1)',
      borderColor: '#2FFFDD',
      type: 'grandchild'
    },
    {
      id: 'cicd',
      x: 110,
      y: 100,
      radius: 25,
      label: 'CI/CD',
      color: 'rgba(47, 255, 221, 0.1)',
      borderColor: '#2FFFDD',
      type: 'grandchild'
    },
    {
      id: 'velocity',
      x: 110,
      y: 300,
      radius: 25,
      label: 'Velocity',
      color: 'rgba(47, 255, 221, 0.1)',
      borderColor: '#2FFFDD',
      type: 'grandchild'
    }
  ];
  
  const connections: Connection[] = [
    // Main to child connections
    { source: 'main', target: 'testStrategy', color: 'rgba(46, 117, 255, 0.5)' },
    { source: 'main', target: 'tools', color: 'rgba(46, 117, 255, 0.5)' },
    { source: 'main', target: 'processes', color: 'rgba(46, 117, 255, 0.5)' },
    { source: 'main', target: 'metrics', color: 'rgba(46, 117, 255, 0.5)' },
    // Child to grandchild connections
    { source: 'testStrategy', target: 'coverage', color: 'rgba(47, 255, 221, 0.5)' },
    { source: 'tools', target: 'selenium', color: 'rgba(47, 255, 221, 0.5)' },
    { source: 'processes', target: 'cicd', color: 'rgba(47, 255, 221, 0.5)' },
    { source: 'metrics', target: 'velocity', color: 'rgba(47, 255, 221, 0.5)' }
  ];
  
  // Handle node click
  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    
    // Set panel position based on node type and position
    if (node.type === 'main') {
      setPanelPosition({ x: node.x + 100, y: node.y + 100 });
    } else if (node.type === 'child') {
      setPanelPosition({ x: node.x + 50, y: node.y + 50 });
    } else {
      setPanelPosition({ x: node.x + 30, y: node.y + 30 });
    }
  };
  
  // Create curved paths for connections
  const createPath = (source: Node, target: Node): string => {
    // Create a curved bezier path
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    // Calculate control points for a quadratic bezier curve
    const qx = source.x + dx * 0.5;
    const qy = source.y + dy * 0.5;
    
    // Start from edge of source node
    const angle = Math.atan2(dy, dx);
    const sourceX = source.x + Math.cos(angle) * source.radius;
    const sourceY = source.y + Math.sin(angle) * source.radius;
    
    // End at edge of target node
    const targetAngle = Math.atan2(-dy, -dx);
    const targetX = target.x + Math.cos(targetAngle) * target.radius;
    const targetY = target.y + Math.sin(targetAngle) * target.radius;
    
    return `M ${sourceX} ${sourceY} Q ${qx} ${qy} ${targetX} ${targetY}`;
  };

  // Render node info panel
  const NodeInfoPanel = ({ node, x, y }: NodeInfoPanelProps) => {
    return (
      <div 
        className="glassmorphism-light absolute w-72 p-4 rounded-xl border border-primary/20 neon-border"
        style={{ left: `${x}px`, top: `${y}px`, maxWidth: '15rem' }}
      >
        <h4 className="text-sm font-bold mb-2">{node.label}</h4>
        <p className="text-xs text-text-muted mb-3">
          {node.type === 'main' 
            ? 'Central concept defining how testing is approached and implemented.'
            : node.type === 'child'
              ? 'Key component of the testing framework that contributes to overall maturity.'
              : 'Specific practice or tool that supports the parent concept.'}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-[#FFBB3A] mr-1"></div>
            <span className="text-xs">Level 2</span>
          </div>
          <button className="text-xs text-primary">View Details</button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "glassmorphism rounded-2xl p-6 h-96 border border-white/5 relative overflow-hidden",
      className
    )}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox="0 0 800 400" 
        className="absolute inset-0"
      >
        {/* Connection Lines */}
        {connections.map((connection, index) => {
          const source = nodes.find(n => n.id === connection.source)!;
          const target = nodes.find(n => n.id === connection.target)!;
          
          return (
            <path 
              key={`connection-${index}`}
              d={createPath(source, target)}
              fill="none"
              stroke={connection.color}
              strokeWidth={source.type === 'main' ? 2 : 1}
              className="connection-line"
            />
          );
        })}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <g 
            key={node.id}
            className="mindmap-node cursor-pointer"
            onClick={() => handleNodeClick(node)}
            transform={`translate(${node.x}, ${node.y})`}
          >
            <circle 
              cx="0" 
              cy="0" 
              r={node.radius} 
              fill={node.color} 
              stroke={node.borderColor} 
              strokeWidth={node.type === 'main' ? 2 : 1}
              className="transition-transform duration-200 hover:scale-105"
            />
            <text 
              x="0" 
              y="0" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="white" 
              fontSize={node.type === 'main' ? 14 : node.type === 'child' ? 12 : 10}
              fontWeight={node.type === 'main' ? 'bold' : 'normal'}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Info Panel (appears when node is clicked) */}
      {selectedNode && (
        <NodeInfoPanel 
          node={selectedNode} 
          x={panelPosition.x} 
          y={panelPosition.y} 
        />
      )}
    </div>
  );
}
