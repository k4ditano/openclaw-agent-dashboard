/**
 * OpenClaw Agent Dashboard - Frontend Application
 */

// ============================================
// State Management
// ============================================

const state = {
  agents: [],
  activities: [],
  tools: [],
  stats: {
    totalAgents: 0,
    activeConversations: 0,
    toolsExecuted: 0,
    uptime: 0
  },
  socket: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5
};

// ============================================
// Utility Functions
// ============================================

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Hace un momento';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
  return `Hace ${Math.floor(seconds / 86400)}d`;
}

function getActivityIcon(type) {
  switch (type) {
    case 'message': return '💬';
    case 'tool': return '🔧';
    case 'reasoning': return '🧠';
    case 'status': return '📊';
    default: return '📝';
  }
}

// ============================================
// Rendering Functions
// ============================================

function renderAgents(agents) {
  const container = document.getElementById('agentsList');
  
  if (!agents || agents.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <p>🤖 No hay agentes activos</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = agents.map(agent => `
    <div class="agent-card" data-agent-id="${agent.id}">
      <div class="agent-header">
        <div class="agent-avatar">${agent.emoji}</div>
        <div class="agent-info">
          <div class="agent-name">${agent.name}</div>
          <div class="agent-model">${agent.model}</div>
        </div>
        <div class="agent-status ${agent.status}">
          <span>●</span>
          ${agent.status === 'active' ? 'Activo' : 'Inactivo'}
        </div>
      </div>
      <div class="agent-stats">
        <div class="agent-stat">
          <div class="agent-stat-value">${agent.stats?.messagesSent || 0}</div>
          <div class="agent-stat-label">Mensajes</div>
        </div>
        <div class="agent-stat">
          <div class="agent-stat-value">${agent.stats?.toolsUsed || 0}</div>
          <div class="agent-stat-label">Herramientas</div>
        </div>
        <div class="agent-stat">
          <div class="agent-stat-value">${agent.stats?.conversations || 0}</div>
          <div class="agent-stat-label">Conversaciones</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderActivities(activities) {
  const container = document.getElementById('activityFeed');
  
  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <p>📊 Sin actividad reciente</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = activities.map(activity => `
    <div class="activity-item" data-activity-id="${activity.id}">
      <div class="activity-avatar">${activity.agent?.emoji || '🤖'}</div>
      <div class="activity-content">
        <div class="activity-header">
          <span class="activity-agent">${activity.agent?.name || 'Unknown'}</span>
          <span class="activity-type ${activity.type}">${activity.type}</span>
        </div>
        <div class="activity-text">${escapeHtml(activity.content)}</div>
        <div class="activity-time">${timeAgo(activity.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function renderTools(tools) {
  const container = document.getElementById('toolsList');
  
  if (!tools || tools.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <p>🔧 Sin herramientas ejecutadas</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = tools.map(tool => `
    <div class="tool-card" data-tool-id="${tool.id}">
      <div class="tool-header">
        <div class="tool-icon">🔧</div>
        <div class="tool-name">${escapeHtml(tool.tool)}</div>
        <div class="tool-status ${tool.status}">${tool.status}</div>
      </div>
      <div class="tool-meta">
        <span>${tool.agent?.name || 'Unknown'}</span>
        <span>${tool.duration}ms</span>
        <span>${formatTime(tool.timestamp)}</span>
      </div>
    </div>
  `).join('');
}

function renderStats(stats) {
  document.getElementById('totalAgents').textContent = stats.totalAgents || 0;
  document.getElementById('activeConversations').textContent = stats.activeConversations || 0;
  document.getElementById('toolsExecuted').textContent = stats.toolsExecuted || 0;
  document.getElementById('uptime').textContent = formatUptime(stats.uptime || 0);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// API Functions
// ============================================

async function fetchAgents() {
  try {
    const response = await fetch('/api/agents');
    const data = await response.json();
    if (data.success) {
      state.agents = data.data;
      renderAgents(data.data);
      renderStats(data.stats);
    }
  } catch (error) {
    console.error('Error fetching agents:', error);
  }
}

async function fetchActivities() {
  try {
    const response = await fetch('/api/activities?limit=50');
    const data = await response.json();
    if (data.success) {
      state.activities = data.data;
      renderActivities(data.data);
    }
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
}

async function fetchTools() {
  try {
    const response = await fetch('/api/tools?limit=20');
    const data = await response.json();
    if (data.success) {
      state.tools = data.data;
      renderTools(data.data);
    }
  } catch (error) {
    console.error('Error fetching tools:', error);
  }
}

async function refreshAll() {
  await Promise.all([
    fetchAgents(),
    fetchActivities(),
    fetchTools()
  ]);
}

// ============================================
// Socket.IO Integration
// ============================================

function initSocket() {
  state.socket = io();
  
  const socket = state.socket;
  const statusEl = document.getElementById('connectionStatus');
  
  socket.on('connect', () => {
    console.log('[Dashboard] Connected to server');
    statusEl.textContent = '🟢 Conectado';
    statusEl.style.color = 'var(--accent-green)';
    state.reconnectAttempts = 0;
  });
  
  socket.on('disconnect', () => {
    console.log('[Dashboard] Disconnected from server');
    statusEl.textContent = '🔴 Desconectado';
    statusEl.style.color = 'var(--accent-red)';
  });
  
  socket.on('agents', (agents) => {
    state.agents = agents;
    renderAgents(agents);
  });
  
  socket.on('stats', (stats) => {
    state.stats = stats;
    renderStats(stats);
  });
  
  socket.on('activity', (activity) => {
    // Add to top of activities
    state.activities.unshift(activity);
    if (state.activities.length > 100) {
      state.activities.pop();
    }
    renderActivities(state.activities.slice(0, 50));
  });
  
  socket.on('tool:started', (tool) => {
    state.tools.unshift(tool);
    renderTools(state.tools.slice(0, 20));
  });
  
  socket.on('tool:completed', (tool) => {
    // Update existing tool or add new
    const index = state.tools.findIndex(t => t.id === tool.id);
    if (index >= 0) {
      state.tools[index] = tool;
    } else {
      state.tools.unshift(tool);
    }
    if (state.tools.length > 20) {
      state.tools.pop();
    }
    renderTools(state.tools.slice(0, 20));
  });
  
  socket.on('agent:updated', (agent) => {
    const index = state.agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      state.agents[index] = agent;
    }
    renderAgents(state.agents);
  });
  
  socket.on('error', (error) => {
    console.error('[Dashboard] Socket error:', error);
  });
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Dashboard] Initializing...');
  
  // Initialize Socket.IO
  initSocket();
  
  // Initial data fetch
  refreshAll();
  
  // Periodic refresh (backup for WebSocket)
  setInterval(refreshAll, 30000);
});

// Expose refreshAll globally
window.refreshAll = refreshAll;
