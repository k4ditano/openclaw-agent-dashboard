/**
 * OpenClaw Agent Dashboard - Main Server
 * 
 * Real-time monitoring of AI agents, conversations, and tool executions
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// ============================================
// In-Memory Agent Store (simulating OpenClaw)
// In production, this would connect to OpenClaw's session store
// ============================================

const agents = new Map();
const conversations = new Map();
const activities = [];
const toolExecutions = [];

const agentStats = {
  totalAgents: 0,
  activeConversations: 0,
  toolsExecuted: 0,
  uptime: Date.now()
};

// ============================================
// Initialize Sample Agents
// ============================================

function initializeSampleAgents() {
  // Agent 1: Dream (Main assistant)
  const dreamId = uuidv4();
  agents.set(dreamId, {
    id: dreamId,
    name: 'Dream ✨',
    type: 'main',
    status: 'active',
    model: 'MiniMax-M2.1',
    emoji: '✨',
    startedAt: Date.now() - 3600000, // 1 hour ago
    lastActivity: Date.now(),
    stats: {
      messagesSent: 156,
      toolsUsed: 42,
      conversations: 23
    }
  });

  // Agent 2: El Programador (Coding specialist)
  const progId = uuidv4();
  agents.set(progId, {
    id: progId,
    name: 'El Programador 💻',
    type: 'specialist',
    status: 'idle',
    model: 'Pony Alpha',
    emoji: '💻',
    startedAt: Date.now() - 7200000, // 2 hours ago
    lastActivity: Date.now() - 300000,
    stats: {
      messagesSent: 89,
      toolsUsed: 156,
      conversations: 12
    }
  });

  // Add sample activities
  activities.push(
    {
      id: uuidv4(),
      timestamp: Date.now() - 60000,
      agentId: dreamId,
      type: 'message',
      content: 'Analizando el código del repositorio...',
      metadata: { tokens: 1200 }
    },
    {
      id: uuidv4(),
      timestamp: Date.now() - 120000,
      agentId: progId,
      type: 'tool',
      content: 'Ejecutando: npm test',
      metadata: { tool: 'npm', duration: '2.3s', result: 'success' }
    },
    {
      id: uuidv4(),
      timestamp: Date.now() - 180000,
      agentId: dreamId,
      type: 'reasoning',
      content: 'Analizando la complejidad del prompt para ajustar reasoning effort...',
      metadata: { complexity: 'medium', effort: 'high' }
    }
  );

  // Add sample tool executions
  toolExecutions.push(
    {
      id: uuidv4(),
      timestamp: Date.now() - 45000,
      agentId: progId,
      tool: 'read_file',
      args: { path: '/home/ubuntu/.openclaw/workspace/proyectos/notnative-electron/src/main/ai/copilot/client.ts' },
      duration: 234,
      status: 'success'
    },
    {
      id: uuidv4(),
      timestamp: Date.now() - 90000,
      agentId: dreamId,
      tool: 'exec_command',
      args: { command: 'git status' },
      duration: 156,
      status: 'success'
    },
    {
      id: uuidv4(),
      timestamp: Date.now() - 150000,
      agentId: progId,
      tool: 'edit_file',
      args: { file: 'src/main/ai/copilot/client.ts', oldText: '...', newText: '...' },
      duration: 567,
      status: 'success'
    }
  );

  agentStats.totalAgents = 2;
  agentStats.activeConversations = 1;
  agentStats.toolsExecuted = 3;
}

initializeSampleAgents();

// ============================================
// Express Server
// ============================================

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: WS_PORT });

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ============================================
// REST API Endpoints
// ============================================

// Get all agents
app.get('/api/agents', (req, res) => {
  const agentList = Array.from(agents.values());
  res.json({
    success: true,
    data: agentList,
    stats: agentStats
  });
});

// Get single agent
app.get('/api/agents/:id', (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: agent });
});

// Get agent conversations
app.get('/api/agents/:id/conversations', (req, res) => {
  const agentConversations = Array.from(conversations.values())
    .filter(c => c.agentId === req.params.id)
    .sort((a, b) => b.lastMessage - a.lastMessage);
  res.json({ success: true, data: agentConversations });
});

// Get recent activities
app.get('/api/activities', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const recentActivities = activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(activity => ({
      ...activity,
      agent: agents.get(activity.agentId)
    }));
  res.json({ success: true, data: recentActivities });
});

// Get tool executions
app.get('/api/tools', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const recentTools = toolExecutions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(exec => ({
      ...exec,
      agent: agents.get(exec.agentId)
    }));
  res.json({ success: true, data: recentTools });
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      ...agentStats,
      uptime: Date.now() - agentStats.uptime,
      agents: Array.from(agents.values()).map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        lastActivity: a.lastActivity
      }))
    }
  });
});

// ============================================
// Socket.IO Events
// ============================================

io.on('connection', (socket) => {
  console.log(`[Dashboard] Client connected: ${socket.id}`);

  // Send initial data
  socket.emit('agents', Array.from(agents.values()));
  socket.emit('stats', agentStats);

  // Handle agent subscription
  socket.on('subscribe:agent', (agentId) => {
    socket.join(`agent:${agentId}`);
    console.log(`[Dashboard] ${socket.id} subscribed to agent: ${agentId}`);
  });

  socket.on('unsubscribe:agent', (agentId) => {
    socket.leave(`agent:${agentId}`);
  });

  // Handle chat message
  socket.on('message', (data) => {
    const { agentId, content } = data;
    
    // Add to activities
    const activity = {
      id: uuidv4(),
      timestamp: Date.now(),
      agentId,
      type: 'message',
      content,
      metadata: {}
    };
    activities.unshift(activity);
    if (activities.length > 1000) activities.pop();

    // Broadcast to all clients
    io.emit('activity', {
      ...activity,
      agent: agents.get(agentId)
    });
  });

  // Handle tool execution
  socket.on('tool:start', (data) => {
    const { agentId, tool, args } = data;
    
    const exec = {
      id: uuidv4(),
      timestamp: Date.now(),
      agentId,
      tool,
      args,
      duration: 0,
      status: 'running'
    };
    toolExecutions.unshift(exec);
    
    io.emit('tool:started', {
      ...exec,
      agent: agents.get(agentId)
    });
  });

  socket.on('tool:complete', (data) => {
    const { id, result, duration } = data;
    
    const exec = toolExecutions.find(e => e.id === id);
    if (exec) {
      exec.status = result ? 'success' : 'error';
      exec.duration = duration;
      exec.result = result;
      
      io.emit('tool:completed', {
        ...exec,
        agent: agents.get(exec.agentId)
      });
    }
  });

  // Handle agent status update
  socket.on('agent:status', (data) => {
    const { agentId, status } = data;
    const agent = agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = Date.now();
      io.emit('agent:updated', agent);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Dashboard] Client disconnected: ${socket.id}`);
  });
});

// ============================================
// WebSocket Server (for external connections)
// ============================================

wss.on('connection', (ws) => {
  console.log(`[WS] External client connected`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle different message types
      if (data.type === 'register_agent') {
        // External agent registration
        const agentId = uuidv4();
        agents.set(agentId, {
          id: agentId,
          name: data.name,
          type: data.type || 'external',
          status: 'active',
          model: data.model || 'unknown',
          emoji: data.emoji || '🤖',
          startedAt: Date.now(),
          lastActivity: Date.now(),
          stats: { messagesSent: 0, toolsUsed: 0, conversations: 0 }
        });
        agentStats.totalAgents++;
        
        ws.send(JSON.stringify({
          type: 'registered',
          agentId
        }));
        
        io.emit('agents', Array.from(agents.values()));
      }
      
      else if (data.type === 'activity') {
        const activity = {
          id: uuidv4(),
          timestamp: Date.now(),
          agentId: data.agentId,
          type: data.activityType,
          content: data.content,
          metadata: data.metadata || {}
        };
        activities.unshift(activity);
        
        const agent = agents.get(data.agentId);
        if (agent) {
          agent.lastActivity = Date.now();
        }
        
        ws.send(JSON.stringify({ type: 'activity_received' }));
        io.emit('activity', { ...activity, agent });
      }
      
      else if (data.type === 'tool_execution') {
        const exec = {
          id: uuidv4(),
          timestamp: Date.now(),
          agentId: data.agentId,
          tool: data.tool,
          args: data.args,
          duration: data.duration || 0,
          status: 'success'
        };
        toolExecutions.unshift(exec);
        agentStats.toolsExecuted++;
        
        io.emit('tool:completed', {
          ...exec,
          agent: agents.get(data.agentId)
        });
      }
      
      else if (data.type === 'status_update') {
        const agent = agents.get(data.agentId);
        if (agent) {
          agent.status = data.status;
          agent.lastActivity = Date.now();
          io.emit('agent:updated', agent);
        }
      }
      
    } catch (err) {
      console.error('[WS] Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[WS] External client disconnected');
  });
});

// ============================================
// Start Server
// ============================================

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 OpenClaw Agent Dashboard                             ║
║                                                           ║
║   📡 Dashboard:   http://localhost:${PORT}                 ║
║   🔌 WebSocket:   ws://localhost:${WS_PORT}                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Periodic stats broadcast
setInterval(() => {
  agentStats.activeConversations = conversations.size;
  agentStats.uptime = Date.now() - agentStats.uptime;
  io.emit('stats', agentStats);
}, 5000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Dashboard] Shutting down...');
  httpServer.close(() => {
    console.log('[Dashboard] Server closed');
    process.exit(0);
  });
});
