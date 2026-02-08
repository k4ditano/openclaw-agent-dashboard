/**
 * OpenClaw Agent Dashboard - Main Server
 * 
 * Real-time monitoring of AI agents using actual OpenClaw session data
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { WebSocketServer } from 'ws';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const OPENCLAW_DATA_DIR = process.env.OPENCLAW_DATA_DIR || '/home/ubuntu/.openclaw/agents';
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// ============================================
// OpenClaw Session Reader
// ============================================

function parseSessionLine(line) {
  try {
    return JSON.parse(line.trim());
  } catch {
    return null;
  }
}

function getLatestSessionFiles(agentDir) {
  if (!existsSync(agentDir)) return [];
  
  const files = readdirSync(agentDir)
    .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
    .map(f => ({
      path: join(agentDir, f),
      mtime: statSync(join(agentDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 5); // Latest 5 sessions
  
  return files;
}

function readSessionEvents(sessionPath) {
  if (!existsSync(sessionPath)) return [];
  
  const content = readFileSync(sessionPath, 'utf-8');
  return content.split('\n')
    .filter(line => line.trim())
    .map(parseSessionLine)
    .filter(Boolean);
}

function extractMessages(events) {
  const messages = [];
  const tools = [];
  
  for (const e of events) {
    if (e.type !== 'message') continue;
    if (!e.message?.content) continue;
    
    const content = e.message.content;
    const timestamp = e.timestamp;
    
    // User messages
    if (e.message.role === 'user') {
      const text = extractTextContent(content);
      if (text) {
        messages.push({
          id: e.id,
          role: 'user',
          content: text,
          timestamp,
          parentId: e.parentId
        });
      }
    }
    
    // Assistant messages with embedded tool calls
    if (e.message.role === 'assistant') {
      let assistantText = '';
      
      for (const block of content) {
        if (block.type === 'text') {
          assistantText += block.text || '';
        } else if (block.type === 'toolCall') {
          tools.push({
            id: block.id,
            tool: block.name || 'unknown',
            arguments: block.arguments || {},
            status: 'running',
            timestamp,
            parentId: e.id
          });
        } else if (block.type === 'toolResult') {
          tools.push({
            id: block.toolCallId,
            tool: block.toolName || 'unknown',
            result: extractTextContent(block.content),
            status: block.isError ? 'error' : 'success',
            timestamp,
            parentId: e.id
          });
        }
      }
      
      if (assistantText.trim()) {
        messages.push({
          id: e.id,
          role: 'agent',
          content: assistantText.trim(),
          timestamp,
          parentId: e.parentId
        });
      }
    }
  }
  
  return { messages, tools };
}

function extractTextContent(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(c => c.text || c.content || '').join('');
  }
  return JSON.stringify(content);
}

function extractToolExecutions(events) {
  // Tools are now extracted within extractMessages
  return [];
}

function extractReasoning(events) {
  const reasoning = [];
  
  for (const e of events) {
    if (e.type !== 'message') continue;
    if (e.message?.role !== 'assistant') continue;
    
    const content = e.message.content || [];
    
    for (const block of content) {
      if (block.type === 'thinking') {
        reasoning.push({
          id: e.id + '-thinking',
          content: block.thinking || '',
          timestamp: e.timestamp,
          parentId: e.id
        });
      }
    }
  }
  
  return reasoning;
}

function loadOpenClawAgents() {
  const agents = new Map();
  const agentConfigs = [
    { dir: 'main', name: 'Dream ✨', emoji: '✨', type: 'main' },
    { dir: 'programador', name: 'El Programador 💻', emoji: '💻', type: 'specialist' }
  ];
  
  for (const config of agentConfigs) {
    const agentDir = join(OPENCLAW_DATA_DIR, config.dir, 'sessions');
    const latestSessions = getLatestSessionFiles(agentDir);
    
    // Load all events from latest sessions
    const allEvents = [];
    for (const session of latestSessions) {
      allEvents.push(...readSessionEvents(session.path));
    }
    
    // Sort events by timestamp
    allEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const { messages, tools: extractedTools } = extractMessages(allEvents);
    const tools = [...extractedTools, ...extractToolExecutions(allEvents)];
    const reasoning = extractReasoning(allEvents);
    
    // Count stats
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;
    
    agents.set(config.dir, {
      id: config.dir,
      name: config.name,
      emoji: config.emoji,
      type: config.type,
      status: 'active',
      model: 'MiniMax-M2.1',
      startedAt: allEvents[0]?.timestamp || Date.now(),
      lastActivity: allEvents[allEvents.length - 1]?.timestamp || Date.now(),
      stats: {
        messagesSent: userMessages,
        toolsUsed: tools.length,
        conversations: latestSessions.length
      },
      messages,
      tools,
      reasoning,
      sessionCount: latestSessions.length
    });
  }
  
  return agents;
}

// Load real OpenClaw data
let openClawAgents = loadOpenClawAgents();

// Periodic refresh (every 10 seconds)
setInterval(() => {
  openClawAgents = loadOpenClawAgents();
}, 10000);

// ============================================
// In-Memory Store
// ============================================

const agentStats = {
  totalAgents: openClawAgents.size,
  activeConversations: 0,
  toolsExecuted: 0,
  uptime: Date.now()
};

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
app.use(express.static(join(PROJECT_ROOT, 'public')));

// ============================================
// REST API Endpoints
// ============================================

// Get all agents with real data
app.get('/api/agents', (req, res) => {
  const agentList = Array.from(openClawAgents.values()).map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    status: a.status,
    model: a.model,
    emoji: a.emoji,
    startedAt: a.startedAt,
    lastActivity: a.lastActivity,
    stats: a.stats
  }));
  
  const toolsCount = Array.from(openClawAgents.values())
    .reduce((sum, a) => sum + a.tools.length, 0);
  
  res.json({
    success: true,
    data: agentList,
    stats: {
      totalAgents: openClawAgents.size,
      activeConversations: 1,
      toolsExecuted: toolsCount,
      uptime: Date.now() - agentStats.uptime
    }
  });
});

// Get single agent with full data
app.get('/api/agents/:id', (req, res) => {
  const agent = openClawAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: agent });
});

// Get agent chat messages
app.get('/api/agents/:id/chat', (req, res) => {
  const agent = openClawAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: agent.messages });
});

// Get agent tool executions
app.get('/api/agents/:id/tools', (req, res) => {
  const agent = openClawAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: agent.tools });
});

// Get agent reasoning
app.get('/api/agents/:id/reasoning', (req, res) => {
  const agent = openClawAgents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: agent.reasoning });
});

// Get activities (combined from all agents)
app.get('/api/activities', (req, res) => {
  const activities = [];
  
  for (const agent of openClawAgents.values()) {
    // Add messages as activities
    for (const msg of agent.messages.slice(-20)) {
      activities.push({
        id: msg.id,
        timestamp: msg.timestamp,
        agentId: agent.id,
        type: 'message',
        content: msg.content.slice(0, 200),
        agent: { id: agent.id, name: agent.name, emoji: agent.emoji }
      });
    }
    
    // Add reasoning as activities
    for (const reasoning of agent.reasoning.slice(-10)) {
      activities.push({
        id: reasoning.id,
        timestamp: reasoning.timestamp,
        agentId: agent.id,
        type: 'reasoning',
        content: reasoning.content.slice(0, 200),
        agent: { id: agent.id, name: agent.name, emoji: agent.emoji }
      });
    }
  }
  
  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json({
    success: true,
    data: activities.slice(0, 50)
  });
});

// Get tools (combined from all agents)
app.get('/api/tools', (req, res) => {
  const tools = [];
  
  for (const agent of openClawAgents.values()) {
    for (const tool of agent.tools) {
      tools.push({
        ...tool,
        agent: { id: agent.id, name: agent.name, emoji: agent.emoji }
      });
    }
  }
  
  // Sort by timestamp (newest first)
  tools.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json({
    success: true,
    data: tools.slice(0, 20)
  });
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  let totalMessages = 0;
  let totalTools = 0;
  let latestActivity = 0;
  
  for (const agent of openClawAgents.values()) {
    totalMessages += agent.messages.length;
    totalTools += agent.tools.length;
    if (agent.lastActivity > latestActivity) {
      latestActivity = agent.lastActivity;
    }
  }
  
  res.json({
    success: true,
    data: {
      totalAgents: openClawAgents.size,
      activeConversations: openClawAgents.size,
      toolsExecuted: totalTools,
      uptime: Date.now() - agentStats.uptime,
      totalMessages,
      agents: Array.from(openClawAgents.values()).map(a => ({
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
  socket.emit('agents', Array.from(openClawAgents.values()).map(a => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    type: a.type,
    status: a.status,
    model: a.model,
    stats: a.stats,
    startedAt: a.startedAt,
    lastActivity: a.lastActivity
  })));
  
  socket.emit('stats', {
    totalAgents: openClawAgents.size,
    activeConversations: 1,
    toolsExecuted: Array.from(openClawAgents.values()).reduce((sum, a) => sum + a.tools.length, 0),
    uptime: Date.now() - agentStats.uptime
  });

  socket.on('subscribe:agent', (agentId) => {
    socket.join(`agent:${agentId}`);
  });

  socket.on('unsubscribe:agent', (agentId) => {
    socket.leave(`agent:${agentId}`);
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
      
      if (data.type === 'register_agent') {
        // Registration handled
      }
    } catch (err) {
      console.error('[WS] Error:', err);
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
║   📡 Reading real data from: ${OPENCLAW_DATA_DIR}       ║
║   📡 Dashboard:   http://localhost:${PORT}                  ║
║   🔌 WebSocket:   ws://localhost:${WS_PORT}                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Periodic stats broadcast
setInterval(() => {
  const toolsCount = Array.from(openClawAgents.values())
    .reduce((sum, a) => sum + a.tools.length, 0);
  
  io.emit('stats', {
    totalAgents: openClawAgents.size,
    activeConversations: openClawAgents.size,
    toolsExecuted: toolsCount,
    uptime: Date.now() - agentStats.uptime
  });
}, 5000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Dashboard] Shutting down...');
  httpServer.close(() => {
    console.log('[Dashboard] Server closed');
    process.exit(0);
  });
});
