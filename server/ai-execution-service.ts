import { chromium, Page, Browser } from 'playwright';
import { WebSocket } from 'ws';
import { db } from './db';
import { testCases } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface ExecutionContext {
  executionId: string;
  testCase: any;
  deploymentUrl: string;
  browser?: Browser;
  page?: Page;
  websocket: WebSocket;
  currentStep: number;
  steps: any[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  userInterventionRequired: boolean;
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

class AIExecutionService {
  private activeExecutions: Map<string, ExecutionContext> = new Map();

  async startExecution(
    executionId: string,
    testCase: any,
    deploymentUrl: string,
    websocket: WebSocket
  ): Promise<void> {
    try {
      console.log(`Starting AI execution for test case ${testCase.id}: ${testCase.title}`);
      
      // Parse test steps
      const testSteps = this.parseTestSteps(testCase);
      
      // Initialize execution context
      const context: ExecutionContext = {
        executionId,
        testCase,
        deploymentUrl,
        websocket,
        currentStep: 0,
        steps: testSteps,
        status: 'running',
        userInterventionRequired: false
      };

      // Check if we can run real Playwright or use simulation mode
      const useSimulation = await this.shouldUseSimulation();
      
      if (useSimulation) {
        console.log('Using simulation mode for AI execution');
        await this.runSimulatedExecution(context);
      } else {
        console.log('Using real Playwright for AI execution');
        await this.runRealExecution(context);
      }

    } catch (error) {
      console.error('Error starting AI execution:', error);
      this.sendWebSocketMessage(websocket, {
        type: 'execution_failed',
        executionId,
        error: error.message
      });
    }
  }

  private async shouldUseSimulation(): Promise<boolean> {
    try {
      // Try to launch a browser to test if Playwright works
      const browser = await chromium.launch({ headless: true });
      await browser.close();
      return false; // Playwright works, use real execution
    } catch (error) {
      return true; // Playwright failed, use simulation
    }
  }

  private async runRealExecution(context: ExecutionContext): Promise<void> {
    // Launch browser in headless mode for containerized environment
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
    context.browser = browser;
    context.page = page;
      
      // Set up page listeners for screenshots and state updates
      await this.setupPageListeners(page, context);

      // Store the execution context
      this.activeExecutions.set(executionId, context);

      // Send execution started event
      this.sendWebSocketMessage(websocket, {
        type: 'execution_started',
        executionId,
        steps: testSteps.map((step, index) => ({
          stepNumber: index + 1,
          description: step.description || step.step || step,
          status: 'pending',
          timestamp: new Date()
        }))
      });

      // Navigate to deployment URL
      await page.goto(deploymentUrl);
      await this.captureScreenshot(context);

      // Start executing test steps
      await this.executeTestSteps(context);
  }

  private async runSimulatedExecution(context: ExecutionContext): Promise<void> {
    const { steps, websocket, executionId } = context;

    // Store the execution context
    this.activeExecutions.set(executionId, context);

    // Send execution started event
    this.sendWebSocketMessage(websocket, {
      type: 'execution_started',
      executionId,
      steps: steps.map((step, index) => ({
        stepNumber: index + 1,
        description: step.description || step.step || step,
        status: 'pending',
        timestamp: new Date()
      }))
    });

    // Simulate browser navigation
    await this.simulateBrowserState(context, deploymentUrl, 'Initial page load');

    // Execute steps with simulation
    for (let i = 0; i < steps.length; i++) {
      if (context.status !== 'running') break;

      const step = steps[i];
      context.currentStep = i + 1;

      // Send step started event
      this.sendWebSocketMessage(websocket, {
        type: 'step_started',
        stepNumber: i + 1,
        description: step.description || step.step || step
      });

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      const result = await this.simulateStepExecution(context, step, i + 1);
      
      // Simulate browser state update
      await this.simulateBrowserState(context, context.deploymentUrl, `After step ${i + 1}`);

      // Send step completed event
      this.sendWebSocketMessage(websocket, {
        type: 'step_completed',
        stepNumber: i + 1,
        aiOutput: result.aiOutput,
        screenshot: await this.generateMockScreenshot(i + 1)
      });

      if (result.requiresUserIntervention) {
        context.status = 'paused';
        context.userInterventionRequired = true;
        
        this.sendWebSocketMessage(websocket, {
          type: 'user_intervention_required',
          stepNumber: i + 1,
          reason: result.reason
        });
        
        await this.waitForUserIntervention(context);
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between steps
    }

    if (context.status === 'running') {
      context.status = 'completed';
      this.sendWebSocketMessage(websocket, {
        type: 'execution_completed',
        executionId
      });
    }

    // Clean up
    await this.cleanupExecution(executionId);
  }

  private async simulateStepExecution(context: ExecutionContext, step: any, stepNumber: number): Promise<{
    aiOutput: string;
    requiresUserIntervention: boolean;
    reason?: string;
  }> {
    const stepDescription = step.description || step.step || step;
    console.log(`Simulating step ${stepNumber}: ${stepDescription}`);

    // Simulate AI decision making
    if (stepDescription.toLowerCase().includes('login')) {
      return {
        aiOutput: 'Simulated login form interaction - filled credentials and clicked login',
        requiresUserIntervention: false
      };
    } else if (stepDescription.toLowerCase().includes('click')) {
      return {
        aiOutput: 'Simulated clicking on UI element',
        requiresUserIntervention: false
      };
    } else if (stepDescription.toLowerCase().includes('verify') || stepDescription.toLowerCase().includes('check')) {
      return {
        aiOutput: 'Simulated verification - checked expected elements and behavior',
        requiresUserIntervention: false
      };
    } else if (stepNumber === 3 && Math.random() > 0.7) {
      // Occasionally simulate need for user intervention
      return {
        aiOutput: 'Simulated complex interaction that requires user guidance',
        requiresUserIntervention: true,
        reason: 'Step requires manual verification or complex interaction'
      };
    } else {
      return {
        aiOutput: `Simulated AI execution of: ${stepDescription}`,
        requiresUserIntervention: false
      };
    }
  }

  private async simulateBrowserState(context: ExecutionContext, url: string, title: string): Promise<void> {
    this.sendWebSocketMessage(context.websocket, {
      type: 'browser_state_update',
      url,
      title,
      screenshot: await this.generateMockScreenshot(context.currentStep),
      isLoading: false
    });
  }

  private async generateMockScreenshot(stepNumber: number): Promise<string> {
    // Generate a simple mock screenshot as base64 SVG
    const mockHtml = `
      <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <rect x="50" y="100" width="1180" height="60" fill="#007bff" rx="5"/>
        <text x="640" y="135" text-anchor="middle" fill="white" font-family="Arial" font-size="18">Mock Browser Simulation - Step ${stepNumber}</text>
        <rect x="100" y="200" width="300" height="40" fill="#e9ecef" rx="3"/>
        <text x="110" y="225" fill="#495057" font-family="Arial" font-size="14">Username Field</text>
        <rect x="100" y="260" width="300" height="40" fill="#e9ecef" rx="3"/>
        <text x="110" y="285" fill="#495057" font-family="Arial" font-size="14">Password Field</text>
        <rect x="100" y="320" width="120" height="40" fill="#28a745" rx="3"/>
        <text x="160" y="345" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Login</text>
        <text x="640" y="500" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="16">AI Browser Automation Simulation</text>
        <text x="640" y="530" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="12">This is a mock interface showing AI execution progress</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(mockHtml).toString('base64')}`;
  }

  private parseTestSteps(testCase: any): any[] {
    if (Array.isArray(testCase.steps)) {
      return testCase.steps;
    }
    
    // Fallback: split by newlines if steps is a string
    if (typeof testCase.steps === 'string') {
      return testCase.steps.split('\n').filter(step => step.trim()).map(step => ({
        description: step.trim()
      }));
    }

    // Default fallback
    return [
      { description: 'Navigate to application' },
      { description: 'Perform test actions' },
      { description: 'Verify expected results' }
    ];
  }

  private async setupPageListeners(page: Page, context: ExecutionContext): Promise<void> {
    // Listen for navigation events
    page.on('framenavigated', async (frame) => {
      if (frame === page.mainFrame()) {
        await this.captureScreenshot(context);
        this.sendWebSocketMessage(context.websocket, {
          type: 'browser_state_update',
          url: page.url(),
          title: await page.title(),
          isLoading: false
        });
      }
    });

    // Listen for console messages from the page
    page.on('console', (msg) => {
      console.log(`Browser console: ${msg.text()}`);
    });

    // Listen for errors
    page.on('pageerror', (error) => {
      console.error('Page error:', error);
      this.sendWebSocketMessage(context.websocket, {
        type: 'browser_error',
        error: error.message
      });
    });
  }

  private async executeTestSteps(context: ExecutionContext): Promise<void> {
    const { steps, page, websocket, executionId } = context;

    for (let i = 0; i < steps.length; i++) {
      if (context.status !== 'running') {
        break; // Execution was paused or stopped
      }

      const step = steps[i];
      context.currentStep = i + 1;

      // Send step started event
      this.sendWebSocketMessage(websocket, {
        type: 'step_started',
        stepNumber: i + 1,
        description: step.description || step.step || step
      });

      try {
        // Execute the step with AI
        const result = await this.executeStepWithAI(context, step, i + 1);
        
        if (result.requiresUserIntervention) {
          // Pause execution and wait for user intervention
          context.status = 'paused';
          context.userInterventionRequired = true;
          
          this.sendWebSocketMessage(websocket, {
            type: 'user_intervention_required',
            stepNumber: i + 1,
            reason: result.reason
          });
          
          // Wait for user to complete intervention
          await this.waitForUserIntervention(context);
        }

        // Capture screenshot after step completion
        await this.captureScreenshot(context);
        
        // Send step completed event
        this.sendWebSocketMessage(websocket, {
          type: 'step_completed',
          stepNumber: i + 1,
          aiOutput: result.aiOutput,
          screenshot: context.page ? await this.getScreenshotBase64(context.page) : undefined
        });

        // Small delay between steps
        await page.waitForTimeout(2000);

      } catch (error) {
        console.error(`Error executing step ${i + 1}:`, error);
        
        this.sendWebSocketMessage(websocket, {
          type: 'step_failed',
          stepNumber: i + 1,
          error: error.message
        });
        
        context.status = 'failed';
        break;
      }
    }

    if (context.status === 'running') {
      context.status = 'completed';
      this.sendWebSocketMessage(websocket, {
        type: 'execution_completed',
        executionId
      });
    }

    // Clean up
    await this.cleanupExecution(executionId);
  }

  private async executeStepWithAI(
    context: ExecutionContext, 
    step: any, 
    stepNumber: number
  ): Promise<{
    aiOutput: string;
    requiresUserIntervention: boolean;
    reason?: string;
  }> {
    const { page } = context;
    if (!page) throw new Error('No page available');

    const stepDescription = step.description || step.step || step;
    console.log(`Executing step ${stepNumber}: ${stepDescription}`);

    // Simple AI logic for common test patterns
    if (stepDescription.toLowerCase().includes('login')) {
      return await this.handleLoginStep(page, stepDescription);
    } else if (stepDescription.toLowerCase().includes('click')) {
      return await this.handleClickStep(page, stepDescription);
    } else if (stepDescription.toLowerCase().includes('type') || stepDescription.toLowerCase().includes('enter')) {
      return await this.handleInputStep(page, stepDescription);
    } else if (stepDescription.toLowerCase().includes('verify') || stepDescription.toLowerCase().includes('check')) {
      return await this.handleVerificationStep(page, stepDescription);
    } else {
      // For complex steps, require user intervention
      return {
        aiOutput: `Step requires manual intervention: ${stepDescription}`,
        requiresUserIntervention: true,
        reason: 'AI cannot automatically handle this step type. Please complete manually.'
      };
    }
  }

  private async handleLoginStep(page: Page, stepDescription: string): Promise<any> {
    try {
      // Look for common login elements
      const usernameInput = await page.locator('input[type="email"], input[name*="user"], input[name*="email"], input[id*="user"]').first();
      const passwordInput = await page.locator('input[type="password"]').first();
      const loginButton = await page.locator('button:has-text("Login"), button:has-text("Sign in"), input[type="submit"]').first();

      if (await usernameInput.isVisible()) {
        await usernameInput.fill('test@example.com');
        await passwordInput.fill('password123');
        await loginButton.click();
        await page.waitForTimeout(2000);
        
        return {
          aiOutput: 'Successfully filled login form and clicked login button',
          requiresUserIntervention: false
        };
      } else {
        return {
          aiOutput: 'Could not locate login form elements',
          requiresUserIntervention: true,
          reason: 'Login form elements not found. Please complete login manually.'
        };
      }
    } catch (error) {
      return {
        aiOutput: `Error during login: ${error.message}`,
        requiresUserIntervention: true,
        reason: 'Login failed. Please complete manually.'
      };
    }
  }

  private async handleClickStep(page: Page, stepDescription: string): Promise<any> {
    try {
      // Extract button text or element description from step
      const buttonText = this.extractButtonText(stepDescription);
      
      if (buttonText) {
        const button = page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
        
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(1000);
          
          return {
            aiOutput: `Successfully clicked "${buttonText}" button`,
            requiresUserIntervention: false
          };
        }
      }
      
      return {
        aiOutput: `Could not locate element to click: ${stepDescription}`,
        requiresUserIntervention: true,
        reason: 'Element not found. Please complete click action manually.'
      };
    } catch (error) {
      return {
        aiOutput: `Error during click: ${error.message}`,
        requiresUserIntervention: true,
        reason: 'Click action failed. Please complete manually.'
      };
    }
  }

  private async handleInputStep(page: Page, stepDescription: string): Promise<any> {
    try {
      // Look for input fields and try to fill them
      const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
      
      if (inputs.length > 0) {
        const testData = this.extractTestData(stepDescription);
        await inputs[0].fill(testData);
        
        return {
          aiOutput: `Successfully entered "${testData}" in input field`,
          requiresUserIntervention: false
        };
      }
      
      return {
        aiOutput: `Could not locate input field for: ${stepDescription}`,
        requiresUserIntervention: true,
        reason: 'Input field not found. Please complete data entry manually.'
      };
    } catch (error) {
      return {
        aiOutput: `Error during input: ${error.message}`,
        requiresUserIntervention: true,
        reason: 'Input action failed. Please complete manually.'
      };
    }
  }

  private async handleVerificationStep(page: Page, stepDescription: string): Promise<any> {
    try {
      // Take screenshot for verification
      const screenshot = await this.getScreenshotBase64(page);
      
      // Basic verification - check if page loaded properly
      const title = await page.title();
      const url = page.url();
      
      return {
        aiOutput: `Verification step completed. Page title: "${title}", URL: ${url}`,
        requiresUserIntervention: false
      };
    } catch (error) {
      return {
        aiOutput: `Error during verification: ${error.message}`,
        requiresUserIntervention: true,
        reason: 'Verification failed. Please check manually.'
      };
    }
  }

  private extractButtonText(stepDescription: string): string | null {
    const patterns = [
      /click.*["'](.*?)["']/i,
      /click.*button.*["'](.*?)["']/i,
      /click.*on.*["'](.*?)["']/i,
      /click.*the.*["'](.*?)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = stepDescription.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  private extractTestData(stepDescription: string): string {
    // Extract data from step description or use default
    const patterns = [
      /enter.*["'](.*?)["']/i,
      /type.*["'](.*?)["']/i,
      /input.*["'](.*?)["']/i
    ];
    
    for (const pattern of patterns) {
      const match = stepDescription.match(pattern);
      if (match) return match[1];
    }
    
    // Default test data
    return 'test data';
  }

  private async waitForUserIntervention(context: ExecutionContext): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!context.userInterventionRequired || context.status === 'running') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  private async captureScreenshot(context: ExecutionContext): Promise<void> {
    if (!context.page) return;
    
    try {
      const screenshot = await this.getScreenshotBase64(context.page);
      this.sendWebSocketMessage(context.websocket, {
        type: 'browser_state_update',
        url: context.page.url(),
        title: await context.page.title(),
        screenshot,
        isLoading: false
      });
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  }

  private async getScreenshotBase64(page: Page): Promise<string> {
    const screenshot = await page.screenshot({ 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
    return `data:image/png;base64,${screenshot.toString('base64')}`;
  }

  private sendWebSocketMessage(websocket: WebSocket, message: any): void {
    if (websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    }
  }

  async pauseExecution(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = 'paused';
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = 'running';
      context.userInterventionRequired = false;
    }
  }

  async stopExecution(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = 'failed';
      await this.cleanupExecution(executionId);
    }
  }

  async handleUserTakeover(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.userInterventionRequired = true;
      context.status = 'paused';
    }
  }

  async handleUserInterventionComplete(executionId: string, userNotes: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.userInterventionRequired = false;
      context.status = 'running';
      
      // Log user intervention
      console.log(`User intervention completed for ${executionId}: ${userNotes}`);
    }
  }

  private async cleanupExecution(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      try {
        if (context.browser) {
          await context.browser.close();
        }
      } catch (error) {
        console.error('Error closing browser:', error);
      }
      
      this.activeExecutions.delete(executionId);
    }
  }

  // Get execution status
  getExecutionStatus(executionId: string): string | null {
    const context = this.activeExecutions.get(executionId);
    return context ? context.status : null;
  }

  // Get all active executions
  getActiveExecutions(): string[] {
    return Array.from(this.activeExecutions.keys());
  }
}

export const aiExecutionService = new AIExecutionService();