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
  liveView?: boolean;
  iframeUrl?: string;
}

interface AITestExecutionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  testCase: TestCase | null;
  testCycle?: any;
  cycleItemId?: number;
  onComplete: (result: any) => void;
}

export function AITestExecutionDialog({
  isOpen,
  onOpenChange,
  testCase,
  testCycle,
  cycleItemId,
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
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [aiInteractions, setAiInteractions] = useState<any[]>([]);
  const [aiThinking, setAIThinking] = useState<string>('');
  const [requiresUserIntervention, setRequiresUserIntervention] = useState(false);
  const [interventionReason, setInterventionReason] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize deployment URL from test cycle and parse test steps
  useEffect(() => {
    if (isOpen && testCase) {
      // Reset state when dialog opens
      setStatus('idle');
      setCurrentStep(0);
      setUserInterventionRequired(false);
      setUserNotes('');
      setBrowserState({ url: '', title: '', isLoading: false, liveView: false, iframeUrl: '' });
      
      // Set deployment URL from test cycle
      if (testCycle?.testDeploymentUrl) {
        setDeploymentUrl(testCycle.testDeploymentUrl);
      } else {
        setDeploymentUrl('');
      }
      
      // Initialize steps from test case
      const initialSteps = parseTestStepsFromTestCase(testCase);
      setSteps(initialSteps);
    }
  }, [isOpen, testCase, testCycle]);

  const parseTestStepsFromTestCase = (testCase: TestCase): ExecutionStep[] => {
    if (!testCase.steps) return [];
    
    let stepsArray: any[] = [];
    
    // Handle different step formats
    if (Array.isArray(testCase.steps)) {
      stepsArray = testCase.steps;
    } else if (typeof testCase.steps === 'string') {
      // Parse string steps (split by newlines)
      stepsArray = testCase.steps.split('\n').filter(step => step.trim()).map(step => ({
        description: step.trim()
      }));
    } else if (typeof testCase.steps === 'object') {
      // Handle object format
      stepsArray = Object.values(testCase.steps).filter(step => step);
    }
    
    return stepsArray.map((step, index) => ({
      stepNumber: index + 1,
      description: typeof step === 'string' ? step : (step.description || step.step || `Step ${index + 1}`),
      status: 'pending' as const,
      timestamp: new Date()
    }));
  };
  
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
      case 'ai_thinking':
        setAIThinking(message.message);
        console.log('🤖 AI Thinking:', message.message);
        break;
        
      case 'execution_started':
        setExecutionId(message.executionId);
        setStatus('running');
        setAIThinking('AI execution started...');
        setSteps(message.steps.map((step: any) => ({
          ...step,
          timestamp: new Date(step.timestamp)
        })));
        break;
        
      case 'step_started':
        setCurrentStep(message.stepNumber);
        setAIThinking(`Starting step ${message.stepNumber}...`);
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
        
        if (message.requiresUserIntervention) {
          setRequiresUserIntervention(true);
          setInterventionReason(message.reason || 'AI unable to proceed automatically');
          setAIThinking(`AI needs help: ${message.reason || 'Cannot complete action'}`);
          setUserInterventionRequired(true);
          setStatus('paused');
        } else {
          setAIThinking('Step completed successfully');
        }
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
        setRequiresUserIntervention(true);
        setInterventionReason(message.reason || 'AI unable to proceed');
        setAIThinking(`AI needs help: ${message.reason}`);
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
          isLoading: message.isLoading,
          liveView: message.liveView || false,
          iframeUrl: message.iframeUrl || ''
        });
        break;
        
      case 'ai_interaction':
        const interaction = {
          id: Date.now(),
          stepNumber: message.stepNumber,
          action: message.action,
          target: message.target,
          coordinates: message.coordinates,
          description: message.description,
          timestamp: new Date()
        };
        setAiInteractions(prev => [...prev, interaction]);
        
        // Show visual AI interaction on the iframe
        if (iframeRef.current) {
          showAIInteractionOnIframe(interaction);
        }
        
        // Execute real browser interaction
        executeRealBrowserAction(interaction);
        
        // Auto-advance to next step after interaction completes
        setTimeout(() => {
          // Clear this interaction after a few seconds
          setAiInteractions(prev => prev.filter(i => i.id !== interaction.id));
        }, 3000);
        break;
        
      case 'execution_completed':
        setStatus('completed');
        // Store execution results for later save
        setExecutionResults(message.results);
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
      deploymentUrl,
      cycleItemId: cycleItemId // Include cycle item ID to fetch test data
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

  const executeRealBrowserAction = (interaction: any) => {
    if (!iframeRef.current) return;
    
    console.log(`🤖 AI executing ${interaction.action} on ${interaction.target} at ${interaction.coordinates?.x}, ${interaction.coordinates?.y}`);
    
    // Enhanced browser automation approach
    const iframe = iframeRef.current;
    
    // Method 1: Direct iframe manipulation (works for same-origin)
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        console.log('✅ Direct iframe access available - performing real interaction');
        
        // Calculate actual pixel coordinates from percentages
        const rect = iframe.getBoundingClientRect();
        const x = (parseFloat(interaction.coordinates?.x || '50%') / 100) * rect.width;
        const y = (parseFloat(interaction.coordinates?.y || '50%') / 100) * rect.height;
        
        // Find element at coordinates
        const element = iframeDoc.elementFromPoint(x, y);
        
        if (element && interaction.action === 'click') {
          // Highlight the element briefly
          const originalStyle = element.style.cssText;
          element.style.cssText += '; border: 3px solid #ff0000 !important; background-color: rgba(255,0,0,0.1) !important; box-shadow: 0 0 10px #ff0000 !important;';
          
          setTimeout(() => {
            element.style.cssText = originalStyle;
            // Perform the actual click
            element.click();
            console.log(`🎯 Successfully clicked element: ${element.tagName} ${element.className}`);
          }, 1000);
        } else if (element) {
          console.log(`🔍 Found element ${element.tagName} at coordinates, but action ${interaction.action} not supported`);
        }
        return;
      }
    } catch (error) {
      console.log('⚠️ Direct iframe access blocked:', error.message);
    }
    
    // Method 2: PostMessage communication with intelligent scripts
    try {
      const actionScript = generateBrowserActionScript(interaction);
      
      iframe.contentWindow?.postMessage({
        type: 'ai_automation',
        action: interaction.action,
        target: interaction.target,
        coordinates: interaction.coordinates,
        value: interaction.value,
        script: actionScript,
        timestamp: Date.now()
      }, '*');
      
      console.log(`📡 Sent postMessage automation script for ${interaction.action}`);
    } catch (postError) {
      console.log('⚠️ PostMessage communication failed:', postError.message);
    }
    
    // Method 3: URL manipulation for navigation actions
    if (interaction.action === 'navigate' || interaction.target.includes('button')) {
      try {
        // For navigation actions, we can manipulate the iframe src
        if (interaction.action === 'navigate') {
          console.log(`🧭 Attempting navigation automation`);
        }
      } catch (navError) {
        console.log('Navigation automation failed:', navError.message);
      }
    }
    
    console.log(`✨ AI interaction ${interaction.action} completed with overlay display`);
  };
  
  const injectAIAutomationCapabilities = () => {
    if (!iframeRef.current) return;
    
    try {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument;
      
      if (iframeDoc && iframeWindow) {
        // Set viewport meta tag for desktop view to prevent mobile layout
        let viewportMeta = iframeDoc.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          viewportMeta = iframeDoc.createElement('meta');
          viewportMeta.name = 'viewport';
          iframeDoc.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=1200, initial-scale=1.0, user-scalable=yes';
        
        // Inject AI automation script into the iframe
        const script = iframeDoc.createElement('script');
        script.textContent = `
          // AI Browser Automation System
          window.aiAutomation = {
            highlightElement: function(element) {
              if (!element) return;
              element.style.transition = 'all 0.3s ease';
              element.style.border = '3px solid #ff0000';
              element.style.backgroundColor = 'rgba(255,0,0,0.1)';
              element.style.boxShadow = '0 0 15px rgba(255,0,0,0.5)';
              element.style.position = 'relative';
              element.style.zIndex = '9999';
            },
            
            removeHighlight: function(element) {
              if (!element) return;
              element.style.border = '';
              element.style.backgroundColor = '';
              element.style.boxShadow = '';
              element.style.zIndex = '';
            },
            
            performClick: function(x, y) {
              const element = document.elementFromPoint(x, y);
              if (element) {
                console.log('🤖 AI clicking element:', element.tagName, element.className, element.textContent?.substring(0, 50));
                this.highlightElement(element);
                
                // Enhanced click with better event handling
                setTimeout(() => {
                  // Try multiple click methods for better compatibility
                  const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                  });
                  element.dispatchEvent(clickEvent);
                  element.click();
                  this.removeHighlight(element);
                  console.log('✅ Click completed on', element.tagName, element.className);
                  
                  // Report back what happened after click
                  setTimeout(() => {
                    const newElements = document.querySelectorAll('a[href*="login"], a[href*="signin"], button:contains("login"), button:contains("sign in")');
                    if (newElements.length > 0) {
                      console.log('🎯 Found login elements after navigation:', newElements.length);
                    }
                  }, 500);
                }, 1000);
                return true;
              }
              return false;
            },
            
            performType: function(text, selector) {
              const inputs = document.querySelectorAll(selector || 'input[type="text"], input[type="email"], input[type="password"], textarea');
              for (let input of inputs) {
                if (input.offsetParent !== null) {
                  console.log('🤖 AI typing into:', input.type, input.placeholder);
                  this.highlightElement(input);
                  setTimeout(() => {
                    input.focus();
                    input.value = text;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    this.removeHighlight(input);
                    console.log('✅ Typing completed');
                  }, 1000);
                  return true;
                }
              }
              return false;
            }
          };
          
          // Listen for AI automation commands and page analysis requests
          window.addEventListener('message', function(event) {
            if (event.data.type === 'analyze_page_elements') {
              console.log('🔍 AI requesting page analysis');
              
              // Perform comprehensive page analysis on the actual rendered DOM
              const allButtons = document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]');
              const allLinks = document.querySelectorAll('a[href]');
              const allInputs = document.querySelectorAll('input, textarea, select');
              const navElements = document.querySelectorAll('nav, .nav, .navbar, .menu, .navigation, [role="navigation"]');
              const hamburgerElements = document.querySelectorAll('[class*="hamburger"], [class*="menu-toggle"], [aria-label*="menu"], [data-testid*="menu"], button:has(svg), .menu-icon');
              const loginElements = document.querySelectorAll('a[href*="login"], a[href*="signin"], button:contains("login"), button:contains("sign"), [data-testid*="login"], [id*="login"], [class*="login"], [class*="signin"]');
              
              const analysisResult = {
                buttonElements: allButtons.length,
                linkElements: allLinks.length,
                inputElements: allInputs.length,
                navElements: navElements.length,
                hamburgerElements: hamburgerElements.length,
                loginElements: loginElements.length,
                clickableElements: allButtons.length + allLinks.length + hamburgerElements.length,
                pageWidth: document.body.scrollWidth,
                pageHeight: document.body.scrollHeight,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
              };
              
              console.log('📊 Real-time page analysis:', analysisResult);
              
              // Send analysis back to parent window
              parent.postMessage({
                type: 'page_analysis_result',
                analysis: analysisResult,
                stepNumber: event.data.stepNumber
              }, '*');
              
              // Detail each element type found
              if (hamburgerElements.length > 0) {
                console.log('🍔 Hamburger menu elements found:');
                hamburgerElements.forEach((el, i) => {
                  console.log('  ', i + 1, ':', el.tagName, el.className, el.getAttribute('aria-label'));
                });
              }
              
              return;
            }
            
            if (event.data.type === 'find_element') {
              console.log('🎯 AI searching for element:', event.data.selector);
              
              const elements = document.querySelectorAll(event.data.selector);
              if (elements.length > 0) {
                const firstElement = elements[0];
                const rect = firstElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                console.log('✅ Found', event.data.elementType, 'at coordinates:', centerX, centerY);
                console.log('   Element details:', firstElement.tagName, firstElement.className);
                
                // Send exact coordinates back to parent
                parent.postMessage({
                  type: 'element_found',
                  elementType: event.data.elementType,
                  coordinates: {
                    x: Math.round((centerX / window.innerWidth) * 100) + '%',
                    y: Math.round((centerY / window.innerHeight) * 100) + '%'
                  },
                  element: {
                    tagName: firstElement.tagName,
                    className: firstElement.className,
                    text: firstElement.textContent?.substring(0, 50)
                  }
                }, '*');
              } else {
                console.log('❌ Element not found:', event.data.selector);
              }
              
              return;
            }
            
            if (event.data.type === 'ai_automation') {
              const { action, coordinates, target } = event.data;
              console.log('🎯 Received AI automation command:', action, target);
              
              switch (action) {
                case 'click':
                  let targetX, targetY;
                  
                  // Smart element targeting - find actual elements instead of using fallback coordinates
                  if (target.toLowerCase().includes('hamburger') || target.toLowerCase().includes('menu')) {
                    // Look for hamburger menu elements with comprehensive selectors
                    const selectors = [
                      '[class*="hamburger"]',
                      '[class*="menu-toggle"]', 
                      '[aria-label*="menu"]',
                      '[data-testid*="menu"]',
                      'button[aria-expanded]',
                      '.menu-icon',
                      'nav button',
                      '.nav button',
                      'button svg',
                      'button:has(svg)',
                      '[role="button"][aria-label*="Menu"]',
                      'button[class*="Menu"]',
                      // Look for buttons in the top-right area that might be hamburger menus
                      'header button',
                      'nav .btn',
                      '.navbar button'
                    ];
                    
                    let hamburgerElement = null;
                    for (const selector of selectors) {
                      const elements = document.querySelectorAll(selector);
                      if (elements.length > 0) {
                        // Find the element closest to top-right corner (typical hamburger location)
                        let bestElement = elements[0];
                        let bestScore = 0;
                        
                        elements.forEach(el => {
                          const rect = el.getBoundingClientRect();
                          // Score based on proximity to top-right corner
                          const rightProximity = (window.innerWidth - rect.right) / window.innerWidth;
                          const topProximity = rect.top / window.innerHeight;
                          const score = (1 - rightProximity) + (1 - topProximity);
                          
                          if (score > bestScore) {
                            bestScore = score;
                            bestElement = el;
                          }
                        });
                        
                        hamburgerElement = bestElement;
                        console.log('🍔 Found hamburger candidate with selector:', selector, hamburgerElement);
                        break;
                      }
                    }
                    
                    if (hamburgerElement) {
                      const rect = hamburgerElement.getBoundingClientRect();
                      targetX = rect.left + rect.width / 2;
                      targetY = rect.top + rect.height / 2;
                      console.log('🍔 Targeting hamburger menu at precise coordinates:', targetX, targetY);
                      console.log('   Element details:', hamburgerElement.tagName, hamburgerElement.className);
                    }
                  }
                  
                  // Fallback to provided coordinates if no element found
                  if (!targetX || !targetY) {
                    targetX = window.innerWidth * (parseFloat(coordinates?.x || '50%') / 100);
                    targetY = window.innerHeight * (parseFloat(coordinates?.y || '50%') / 100);
                  }
                  
                  console.log('🎯 AI clicking at coordinates:', targetX, targetY, 'for target:', target);
                  
                  // Enhanced element detection and interaction
                  const elementAtPoint = document.elementFromPoint(targetX, targetY);
                  console.log('📍 Element found at coordinates:', elementAtPoint?.tagName, elementAtPoint?.className, elementAtPoint?.textContent?.substring(0, 100));
                  
                  window.aiAutomation.performClick(targetX, targetY);
                  break;
                case 'type':
                  window.aiAutomation.performType(event.data.value || 'test@example.com');
                  break;
              }
            }
          });
          
          console.log('🚀 AI automation system initialized');
          
          // Force desktop layout by setting viewport width
          if (document.body) {
            document.body.style.minWidth = '1200px';
            document.body.style.width = 'auto';
          }
          
          // Log page analysis for debugging
          const allButtons = document.querySelectorAll('button, [role="button"], .btn');
          const allLinks = document.querySelectorAll('a[href]');
          const allInputs = document.querySelectorAll('input, textarea, select');
          const navElements = document.querySelectorAll('nav, .nav, .navbar, .menu, .navigation');
          
          console.log('📊 Page analysis:');
          console.log('  🔘 Buttons:', allButtons.length);
          console.log('  🔗 Links:', allLinks.length);  
          console.log('  📝 Inputs:', allInputs.length);
          console.log('  🧭 Navigation:', navElements.length);
          
          // Look for login/signin elements specifically
          const loginElements = document.querySelectorAll('a[href*="login"], a[href*="signin"], button:contains("login"), button:contains("sign"), [data-testid*="login"], [id*="login"], [class*="login"], [class*="signin"]');
          console.log('  🔐 Login elements:', loginElements.length);
          
          if (loginElements.length > 0) {
            loginElements.forEach((el, i) => {
              console.log('    Login element', i + 1, ':', el.tagName, el.className, el.textContent?.substring(0, 50));
            });
          }
        `;
        iframeDoc.head.appendChild(script);
        console.log('✅ AI automation capabilities injected into iframe with desktop viewport');
      }
    } catch (error) {
      console.log('⚠️ Could not inject AI automation:', error.message);
    }
  };
  
  const showAIInteractionOnIframe = (interaction: any) => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      
      const script = generateBrowserActionScript(interaction);
      iframe.contentWindow.eval(script);
    } catch (error) {
      console.log('Could not inject AI interaction into iframe:', error.message);
    }
  };

  const generateBrowserActionScript = (interaction: any) => {
    const coords = interaction.coordinates || { x: '50%', y: '50%' };
    const xPercent = parseFloat(coords.x.replace('%', '')) / 100;
    const yPercent = parseFloat(coords.y.replace('%', '')) / 100;
    
    switch (interaction.action) {
      case 'click':
        return `
          (function() {
            // Create AI cursor animation
            const cursor = document.createElement('div');
            cursor.style.cssText = \`
              position: fixed;
              z-index: 999999;
              width: 20px;
              height: 20px;
              background: radial-gradient(circle, #ff4444 0%, #ff0000 70%);
              border-radius: 50%;
              pointer-events: none;
              box-shadow: 0 0 10px rgba(255,0,0,0.8);
              transition: all 0.3s ease;
            \`;
            document.body.appendChild(cursor);
            
            const x = window.innerWidth * ${xPercent};
            const y = window.innerHeight * ${yPercent};
            cursor.style.left = (x - 10) + 'px';
            cursor.style.top = (y - 10) + 'px';
            
            // Find and highlight the target element
            const element = document.elementFromPoint(x, y);
            if (element) {
              element.style.outline = '3px solid #ff4444';
              element.style.backgroundColor = 'rgba(255,68,68,0.1)';
              element.style.transition = 'all 0.3s ease';
              
              setTimeout(() => {
                element.click();
                element.style.outline = '';
                element.style.backgroundColor = '';
                cursor.remove();
              }, 1500);
            } else {
              setTimeout(() => cursor.remove(), 2000);
            }
          })();
        `;
        
      case 'type':
        return `
          (function() {
            const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input:not([type])');
            const targetInput = inputs[${interaction.target.includes('Password') ? '1' : '0'}] || inputs[0];
            
            if (targetInput && targetInput.offsetParent !== null) {
              // Highlight the input field
              targetInput.style.outline = '3px solid #4444ff';
              targetInput.style.backgroundColor = 'rgba(68,68,255,0.1)';
              targetInput.style.transition = 'all 0.3s ease';
              
              // Focus and type
              targetInput.focus();
              setTimeout(() => {
                targetInput.value = '${interaction.value || 'test@example.com'}';
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                setTimeout(() => {
                  targetInput.style.outline = '';
                  targetInput.style.backgroundColor = '';
                }, 1000);
              }, 500);
            }
          })();
        `;
        
      default:
        return `
          (function() {
            const notification = document.createElement('div');
            notification.style.cssText = \`
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 999999;
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 10px 15px;
              border-radius: 5px;
              font-family: Arial, sans-serif;
              font-size: 12px;
            \`;
            notification.textContent = 'AI: ${interaction.description || interaction.action}';
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 3000);
          })();
        `;
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
                    <Badge variant={
                      status === 'running' ? 'default' : 
                      status === 'completed' ? 'default' : 
                      'secondary'
                    } className={
                      status === 'completed' ? 'bg-green-500' : ''
                    }>
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
                    
                    {status === 'completed' ? (
                      <Button variant="default" size="sm" onClick={() => onComplete({
                        status: 'completed',
                        executionId,
                        steps,
                        results: executionResults
                      })}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save & Close
                      </Button>
                    ) : (
                      <Button variant="destructive" size="sm" onClick={stopExecution}>
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    )}
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
                        
                        {/* Show AI thinking for current step */}
                        {step.stepNumber === currentStep && aiThinking && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Bot className="h-3 w-3 animate-pulse" />
                              <strong>AI is thinking:</strong>
                            </div>
                            <p>{aiThinking}</p>
                          </div>
                        )}
                        
                        {/* Show user intervention needed */}
                        {step.stepNumber === currentStep && requiresUserIntervention && (
                          <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-2 rounded mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <AlertCircle className="h-3 w-3" />
                              <strong>AI needs help:</strong>
                            </div>
                            <p>{interventionReason}</p>
                          </div>
                        )}
                        
                        {step.aiOutput && (
                          <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            <strong>AI Analysis:</strong> {step.aiOutput}
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
            {/* AI Thinking Display */}
            {aiThinking && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="text-sm font-medium text-blue-800">AI is thinking...</span>
                  </div>
                  <p className="text-sm text-blue-700">{aiThinking}</p>
                </CardContent>
              </Card>
            )}
            
            {/* User intervention alert */}
            {requiresUserIntervention && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">AI needs your help</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">{interventionReason}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                    onClick={() => {
                      setRequiresUserIntervention(false);
                      setInterventionReason('');
                      setAIThinking('User is taking manual control...');
                    }}
                  >
                    <User className="h-3 w-3 mr-1" />
                    Take Manual Control
                  </Button>
                </CardContent>
              </Card>
            )}
            
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
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100 min-h-[600px] relative">
                  {browserState.liveView && browserState.iframeUrl ? (
                    <div className="w-full h-[600px] relative">
                      <iframe
                        ref={iframeRef}
                        src={browserState.iframeUrl}
                        className="w-full h-full border-0"
                        title="Live Browser View"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                        onLoad={() => {
                          // Inject AI automation capabilities when iframe loads
                          injectAIAutomation();
                          injectAIAutomationCapabilities();
                        }}
                      />
                      
                      {/* AI Interaction Overlays */}
                      {aiInteractions.map((interaction) => (
                        <div
                          key={interaction.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: interaction.coordinates?.x || '50%',
                            top: interaction.coordinates?.y || '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="bg-red-500 rounded-full w-6 h-6 animate-ping opacity-75"></div>
                          <div className="absolute top-0 left-0 bg-red-500 rounded-full w-6 h-6"></div>
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {interaction.action}: {interaction.target}
                          </div>
                        </div>
                      ))}
                      
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        🔴 LIVE
                      </div>
                      
                      {status === 'running' && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          AI is interacting...
                        </div>
                      )}
                    </div>
                  ) : browserState.screenshot ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                      <img
                        src={browserState.screenshot}
                        alt="Browser screenshot"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 flex items-center justify-center min-h-[600px]">
                      <div>
                        <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Browser view will appear here during execution</p>
                      </div>
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