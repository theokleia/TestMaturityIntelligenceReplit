import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { aiExecutionService } from './ai-execution-service';
import { v4 as uuidv4 } from 'uuid';

export function setupWebSocketServer(server: Server): void {
  // Create WebSocket server for AI execution
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws/ai-execution'
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('AI execution WebSocket client connected');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);

        switch (message.type) {
          case 'start_execution':
            await handleStartExecution(ws, message);
            break;
          
          case 'pause_execution':
            await aiExecutionService.pauseExecution(message.executionId);
            break;
          
          case 'resume_execution':
            await aiExecutionService.resumeExecution(message.executionId);
            break;
          
          case 'stop_execution':
            await aiExecutionService.stopExecution(message.executionId);
            break;
          
          case 'user_takeover':
            await aiExecutionService.handleUserTakeover(message.executionId);
            break;
          
          case 'user_intervention_complete':
            await aiExecutionService.handleUserInterventionComplete(
              message.executionId, 
              message.userNotes
            );
            break;
          
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    ws.on('close', () => {
      console.log('AI execution WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('AI execution WebSocket error:', error);
    });
  });

  console.log('AI execution WebSocket server initialized on /ws/ai-execution');
}

async function handleStartExecution(ws: WebSocket, message: any): Promise<void> {
  try {
    const executionId = uuidv4();
    const { testCaseId, testCase, deploymentUrl, cycleItemId } = message;

    console.log(`Starting AI execution for test case ${testCaseId}: ${testCase.title}`);

    // Fetch test cycle data if cycleItemId is provided to get test credentials
    let testCycleData = null;
    if (cycleItemId) {
      try {
        const { storage } = await import('./storage');
        const cycleItem = await storage.getTestCycleItem(cycleItemId);
        if (cycleItem) {
          const testCycle = await storage.getTestCycle(cycleItem.cycleId);
          testCycleData = testCycle;
        }
      } catch (error) {
        console.error('Error fetching test cycle data:', error);
      }
    }

    // Start the AI execution with cycle data
    await aiExecutionService.startExecution(
      executionId,
      testCase,
      deploymentUrl || 'https://staging.example.com', // Use provided URL or fallback
      ws,
      testCycleData
    );

  } catch (error) {
    console.error('Error starting AI execution:', error);
    ws.send(JSON.stringify({
      type: 'execution_failed',
      error: error.message
    }));
  }
}