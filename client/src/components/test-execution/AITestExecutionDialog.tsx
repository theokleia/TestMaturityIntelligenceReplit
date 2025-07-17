import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Pause, 
  Square, 
  Bot, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Monitor,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestCase {
  id: number;
  title: string;
  steps: any[];
  expectedResult?: string;
}

interface ExecutionStep {
  stepNumber: number;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'user-intervention';
  aiOutput?: string;
  screenshot?: string;
  userInput?: string;
  timestamp: Date;
}

interface BrowserState {
  url: string;
  title: string;
  screenshot?: string;
  isLoading: boolean;
}

interface AITestExecutionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  testCase: TestCase | null;
  onComplete: (result: any) => void;
}

export function AITestExecutionDialog({
  isOpen,
  onOpenChange,
  testCase,
  onComplete
}: AITestExecutionDialogProps) {
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'failed'>('idle');
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [browserState, setBrowserState] = useState<BrowserState>({
    url: '',
    title: '',
    isLoading: false
  });
  const [userInterventionRequired, setUserInterventionRequired] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen && testCase) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/ai-execution`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('AI execution WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };
      
      wsRef.current.onclose = () => {
        console.log('AI execution WebSocket disconnected');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('AI execution WebSocket error:', error);
      };
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, testCase]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'execution_started':
        setExecutionId(message.executionId);
        setStatus('running');
        setSteps(message.steps.map((step: any) => ({
          ...step,
          timestamp: new Date(step.timestamp)
        })));
        break;
        
      case 'step_started':
        setCurrentStep(message.stepNumber);
        setSteps(prev => prev.map(step => 
          step.stepNumber === message.stepNumber 
            ? { ...step, status: 'running' }
            : step
        ));
        break;
        
      case 'step_completed':
        setSteps(prev => prev.map(step => 
          step.stepNumber === message.stepNumber 
            ? { 
                ...step, 
                status: 'completed',
                aiOutput: message.aiOutput,
                screenshot: message.screenshot
              }
            : step
        ));
        break;
        
      case 'step_failed':
        setSteps(prev => prev.map(step => 
          step.stepNumber === message.stepNumber 
            ? { 
                ...step, 
                status: 'failed',
                aiOutput: message.error
              }
            : step
        ));
        break;
        
      case 'user_intervention_required':
        setUserInterventionRequired(true);
        setStatus('paused');
        setSteps(prev => prev.map(step => 
          step.stepNumber === message.stepNumber 
            ? { 
                ...step, 
                status: 'user-intervention',
                aiOutput: message.reason
              }
            : step
        ));
        break;
        
      case 'browser_state_update':
        setBrowserState({
          url: message.url,
          title: message.title,
          screenshot: message.screenshot,
          isLoading: message.isLoading
        });
        break;
        
      case 'execution_completed':
        setStatus('completed');
        onComplete({
          status: 'completed',
          executionId: message.executionId,
          steps
        });
        break;
        
      case 'execution_failed':
        setStatus('failed');
        break;
        
      default:
        console.log('Unknown WebSocket message:', message);
    }
  };

  const startExecution = () => {
    if (!testCase || !deploymentUrl) return;
    
    const message = {
      type: 'start_execution',
      testCaseId: testCase.id,
      testCase,
      deploymentUrl
    };
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const pauseExecution = () => {
    if (executionId && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'pause_execution',
        executionId
      }));
    }
  };

  const resumeExecution = () => {
    if (executionId && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'resume_execution',
        executionId
      }));
      setUserInterventionRequired(false);
      setStatus('running');
    }
  };

  const stopExecution = () => {
    if (executionId && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_execution',
        executionId
      }));
    }
    setStatus('idle');
  };

  const handleUserTakeover = () => {
    if (executionId && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'user_takeover',
        executionId
      }));
    }
  };

  const completeUserIntervention = () => {
    if (executionId && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'user_intervention_complete',
        executionId,
        userNotes
      }));
      setUserNotes('');
      resumeExecution();
    }
  };

  const getStepIcon = (step: ExecutionStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'user-intervention':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStepBadge = (step: ExecutionStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Running</Badge>;
      case 'user-intervention':
        return <Badge variant="secondary" className="bg-yellow-500">User Action Required</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const progress = steps.length > 0 ? (steps.filter(s => s.status === 'completed').length / steps.length) * 100 : 0;

  if (!testCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI-Assisted Test Execution
          </DialogTitle>
          <DialogDescription>
            Test Case: {testCase.title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          {/* Left Panel - Execution Control & Steps */}
          <div className="flex flex-col space-y-4">
            {/* Deployment URL Input */}
            {status === 'idle' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Environment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Deployment URL</label>
                    <input
                      type="url"
                      placeholder="https://staging.example.com"
                      value={deploymentUrl}
                      onChange={(e) => setDeploymentUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    onClick={startExecution} 
                    disabled={!deploymentUrl}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start AI Execution
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Execution Controls */}
            {status !== 'idle' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Execution Controls
                    <Badge variant={status === 'running' ? 'default' : 'secondary'}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                  
                  <div className="flex gap-2">
                    {status === 'running' && (
                      <>
                        <Button variant="outline" size="sm" onClick={pauseExecution}>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleUserTakeover}>
                          <User className="w-4 h-4 mr-2" />
                          Take Over
                        </Button>
                      </>
                    )}
                    
                    {status === 'paused' && (
                      <Button variant="outline" size="sm" onClick={resumeExecution}>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    
                    <Button variant="destructive" size="sm" onClick={stopExecution}>
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>

                  {/* User Intervention */}
                  {userInterventionRequired && (
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">User Action Required</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        The AI needs you to complete this step manually. Please perform the required actions in the browser, then continue.
                      </p>
                      <Textarea
                        placeholder="Add notes about what you completed..."
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        className="mb-3"
                      />
                      <Button onClick={completeUserIntervention} size="sm">
                        Continue Execution
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Test Steps */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Test Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {steps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className={cn(
                          "p-3 border rounded-lg",
                          step.stepNumber === currentStep && "border-blue-500 bg-blue-50",
                          step.status === 'completed' && "border-green-200 bg-green-50",
                          step.status === 'failed' && "border-red-200 bg-red-50",
                          step.status === 'user-intervention' && "border-yellow-200 bg-yellow-50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStepIcon(step)}
                            <span className="font-medium">Step {step.stepNumber}</span>
                          </div>
                          {getStepBadge(step)}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{step.description}</p>
                        {step.aiOutput && (
                          <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            <strong>AI Output:</strong> {step.aiOutput}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Browser View */}
          <div className="flex flex-col space-y-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Browser View
                </CardTitle>
                {browserState.url && (
                  <div className="text-sm text-gray-600">
                    <div className="truncate">{browserState.title}</div>
                    <div className="truncate">{browserState.url}</div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100 min-h-[400px] flex items-center justify-center">
                  {browserState.screenshot ? (
                    <img
                      src={browserState.screenshot}
                      alt="Browser screenshot"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Browser view will appear here during execution</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}