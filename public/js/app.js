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
  selectedAgent: null,
  agentData: {
    conversations: [],
    reasoning: [],
    tools: []
  },
  socket: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5
};

// ============================================
// Sample Conversation Data
// ============================================

const sampleConversations = {
  'Dream ✨': [
    { role: 'user', text: '¿Qué estamos trabajando hoy?', timestamp: Date.now() - 3600000 },
    { role: 'agent', text: '¡Hola! Hoy vamos a mejorar el dashboard de agentes. Voy a analizar los requisitos y luego implementar las mejoras.', timestamp: Date.now() - 3500000 },
    { role: 'user', text: 'Perfecto, me gustaría ver el historial en tiempo real de cada agente.', timestamp: Date.now() - 3400000 },
    { role: 'agent', text: 'Entendido. Voy a implementar un modal interactivo que muestre:\n\n1. 📝 Historial de chat\n2. 🧠 Proceso de razonamiento\n3. 🔧 Herramientas ejecutadas\n4. 📊 Estadísticas del agente\n\nEmpiezo con el diseño...', timestamp: Date.now() - 3200000 },
    { role: 'agent', text: 'He creado la estructura del modal en el HTML. Ahora voy a añadir los estilos CSS para que tenga un aspecto profesional.', timestamp: Date.now() - 2800000 },
    { role: 'user', text: '¿Cuánto crees que tardará?', timestamp: Date.now() - 2500000 },
    { role: 'agent', text: 'Con el nuevo SDK de GitHub Copilot, debería estar listo en unos 30-45 minutos. La implementación del WebSocket será rápida.', timestamp: Date.now() - 2400000 }
  ],
  'El Programador 💻': [
    { role: 'user', text: 'Necesito que actualices el cliente de Copilot para usar la nueva versión del SDK.', timestamp: Date.now() - 7200000 },
    { role: 'agent', text: 'Entendido. Voy a verificar la versión actual del SDK y planificar la actualización.', timestamp: Date.now() - 7100000 },
    { role: 'agent', text: 'He actualizado el package.json de @github/copilot-sdk a la versión 0.1.23. Ahora voy a revisar los breaking changes.', timestamp: Date.now() - 6800000 },
    { role: 'user', text: '¿Hay cambios importantes?', timestamp: Date.now() - 6500000 },
    { role: 'agent', text: 'Sí, hay nuevos tipos para CopilotModelInfo y cambios en la configuración de streaming. Voy a actualizar el cliente.ts paso a paso.', timestamp: Date.now() - 6300000 },
    { role: 'agent', text: 'He corregido los errores de tipo en agentService.ts. El código ya compila correctamente.', timestamp: Date.now() - 5400000 },
    { role: "user", text: "Perfecto, crea un PR para que pueda revisarlo.", timestamp: Date.now() - 5000000 },
    { role: 'agent', text: 'Creando branch feature/sdk-v0.1.23-upgrade... ✓\nCreando commit con los cambios... ✓\nCreando PR #5... ✓\nPR creado: https://github.com/k4ditano/notnative-electron/pull/5', timestamp: Date.now() - 4500000 }
  ]
};

const sampleReasoning = {
  'Dream ✨': [
    {
      title: 'Análisis de requisitos del dashboard',
      content: 'El usuario quiere ver el historial en tiempo real de cada agente. Necesito diseñar una interfaz que muestre: conversaciones, razonamiento, herramientas y estadísticas de forma clara.',
      complexity: 'medium',
      effort: 'medium',
      timestamp: Date.now() - 3300000
    },
    {
      title: 'Selección de arquitectura UI',
      content: 'Para mostrar múltiples tipos de información (chat, tools, reasoning), un modal con pestañas es la mejor opción. Permite al usuario cambiar entre vistas sin perder contexto.',
      complexity: 'low',
      effort: 'low',
      timestamp: Date.now() - 3000000
    },
    {
      title: 'Optimización de actualizaciones en tiempo real',
      content: 'Debería suscribirme a eventos WebSocket específicos del agente cuando se abra el modal, y desuscribirme cuando se cierre para evitar tráfico innecesario.',
      complexity: 'medium',
      effort: 'medium',
      timestamp: Date.now() - 2700000
    }
  ],
  'El Programador 💻': [
    {
      title: 'Revisión de cambios en SDK v0.1.23',
      content: 'Voy a leer el CHANGELOG del SDK para identificar breaking changes. Los principales cambios parecen estar en los tipos de modelo y la configuración de streaming.',
      complexity: 'high',
      effort: 'high',
      timestamp: Date.now() - 7000000
    },
    {
      title: 'Plan de actualización incremental',
      content: 'En lugar de hacer un refactor grande, voy a actualizar el código paso a paso: primero tipos, luego configuración, finalmente pruebas.',
      complexity: 'medium',
      effort: 'medium',
      timestamp: Date.now() - 6600000
    },
    {
      title: 'Verificación de compatibilidad',
      content: 'Necesito asegurarme de que los cambios no rompan la funcionalidad existente. Voy a ejecutar typecheck y lint antes de crear el PR.',
      complexity: 'low',
      effort: 'low',
      timestamp: Date.now() - 5500000
    }
  ]
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
function reversed(arr) { return [...arr].reverse(); }
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
    <div class="agent-card" data-agent-id="${agent.id}" onclick="openAgentModal('${agent.id}')" style="cursor: pointer;">
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
  
  container.innerHTML = reversed([...tools]).map(tool => `
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

// ============================================
// Agent Detail Modal Functions
// ============================================

async function openAgentModal(agentId) {
  const agent = state.agents.find(a => a.id === agentId);
  if (!agent) return;
  
  state.selectedAgent = agent;
  
  // Reset to chat tab
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="chat"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-chat').classList.add('active');
  
  // Update modal header
  document.getElementById('modalAvatar').textContent = agent.emoji;
  document.getElementById('modalTitle').textContent = agent.name;
  document.getElementById('modalSubtitle').textContent = `${agent.model} • ${agent.status}`;
  
  // Show loading state
  document.getElementById('chatMessages').innerHTML = '<div class="loading">Cargando...</div>';
  document.getElementById('reasoningList').innerHTML = '<div class="loading">Cargando...</div>';
  document.getElementById('agentTools').innerHTML = '<div class="loading">Cargando...</div>';
  
  try {
    // Fetch real data from API
    const [chatRes, toolsRes, reasoningRes] = await Promise.all([
      fetch(`/api/agents/${agentId}/chat`),
      fetch(`/api/agents/${agentId}/tools`),
      fetch(`/api/agents/${agentId}/reasoning`)
    ]);
    
    const chatData = await chatRes.json();
    const toolsData = await toolsRes.json();
    const reasoningData = await reasoningRes.json();
    
    state.agentData = {
      conversations: chatData.success ? chatData.data : [],
      tools: toolsData.success ? toolsData.data : [],
      reasoning: reasoningData.success ? reasoningData.data : []
    };
  } catch (error) {
    console.error('Error fetching agent data:', error);
    state.agentData = { conversations: [], reasoning: [], tools: [] };
  }
  
  // Render content
  renderAgentChat();
  renderAgentReasoning();
  renderAgentTools();
  renderAgentInfo();
  
  // Show modal
  document.getElementById('agentModal').classList.add('active');
  
  // Subscribe to agent updates
  if (state.socket) {
    state.socket.emit('subscribe:agent', agentId);
  }
}

function closeAgentModal() {
  document.getElementById('agentModal').classList.remove('active');
  
  // Unsubscribe from agent updates
  if (state.socket && state.selectedAgent) {
    state.socket.emit('unsubscribe:agent', state.selectedAgent.id);
  }
  
  state.selectedAgent = null;
}

function switchTab(button, tabName) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  button.classList.add('active');
  
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

function renderAgentChat() {
  const container = document.getElementById('chatMessages');
  const conversations = state.agentData.conversations;
  
  if (!conversations || conversations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <div class="empty-state-text">Sin mensajes aún</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reversed([...conversations]).map(msg => `
    <div class="chat-message ${msg.role}">
      <div class="chat-avatar">${msg.role === 'user' ? '👤' : state.selectedAgent?.emoji || '🤖'}</div>
      <div class="chat-bubble">
        <div class="chat-role ${msg.role}">${msg.role === 'user' ? 'Usuario' : state.selectedAgent?.name || 'Agente'}</div>
        <div class="chat-text">${escapeHtml(msg.content)}</div>
        <div class="chat-time">${formatTime(msg.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function renderAgentReasoning() {
  const container = document.getElementById('reasoningList');
  const reasoning = state.agentData.reasoning;
  
  if (!reasoning || reasoning.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🧠</div>
        <div class="empty-state-text">Sin procesos de razonamiento</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reversed([...reasoning]).map(item => `
    <div class="reasoning-item">
      <div class="reasoning-header">
        <div class="reasoning-icon">💡</div>
        <div class="reasoning-title">${escapeHtml(item.content?.slice(0, 100) || 'Razonamiento')}${item.content?.length > 100 ? '...' : ''}</div>
      </div>
      <div class="reasoning-content">${escapeHtml(item.content)}</div>
      <div class="reasoning-meta">
        <span>⏱️ ${timeAgo(item.timestamp)}</span>
      </div>
    </div>
  `).join('');
}

function renderAgentTools() {
  const container = document.getElementById('agentTools');
  const tools = state.agentData.tools;
  
  if (!tools || tools.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔧</div>
        <div class="empty-state-text">Sin herramientas ejecutadas</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reversed([...tools]).map(tool => `
    <div class="tool-card">
      <div class="tool-header">
        <div class="tool-icon">🔧</div>
        <div class="tool-name">${escapeHtml(tool.tool)}</div>
        <div class="tool-status ${tool.status}">${tool.status}</div>
      </div>
      <div class="tool-meta">
        <span>${formatTime(tool.timestamp)}</span>
      </div>
    </div>
  `).join('');
}

function renderAgentInfo() {
  const agent = state.selectedAgent;
  if (!agent) return;
  
  const container = document.getElementById('agentInfo');
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-value">${agent.stats?.messagesSent || 0}</div>
          <div class="stat-label">Mensajes Enviados</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔧</div>
        <div class="stat-content">
          <div class="stat-value">${agent.stats?.toolsUsed || 0}</div>
          <div class="stat-label">Herramientas Usadas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💭</div>
        <div class="stat-content">
          <div class="stat-value">${agent.stats?.conversations || 0}</div>
          <div class="stat-label">Conversaciones</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">${timeAgo(agent.startedAt)}</div>
          <div class="stat-label">Inicio Sesión</div>
        </div>
      </div>
    </div>
  `;
}

// Expose modal functions globally
window.openAgentModal = openAgentModal;
window.closeAgentModal = closeAgentModal;
window.switchTab = switchTab;
