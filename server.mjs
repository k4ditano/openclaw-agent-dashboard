/**
 * AGENT METRICS API - Solo métricas de solo lectura
 * 
 * Endpoints seguros:
 * - POST /api/auth/login - Login JWT
 * - GET /api/auth/verify - Verificar token
 * - GET /api/metrics/sessions - Lista sesiones (sin contenido)
 * - GET /api/metrics/agents - Estado de agentes
 * - GET /api/metrics/gateway - Estado del gateway
 * - GET /api/events - Server-Sent Events para tiempo real
 * 
 * ⚠️ NADA que permita ejecutar o controlar agentes
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import { sessions_list, session_status, sessions_history } from './tools.mjs'

const app = express()
app.use(express.json())

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'er-hineda-dashboard-secret-key-change-in-production'
const JWT_EXPIRY = '24h' // Token expira en 24 horas

// Credenciales (en producción usar variables de entorno)
const CREDENTIALS = {
  username: 'ErHinedaAgents',
  password: 'qubgos-9cehpe-caggEz' // Cambiar en producción
}

// Middleware para verificar JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' })
    }
    req.user = user
    next()
  })
}

// =============================================================================
// AUTH ROUTES
// =============================================================================

// POST /api/auth/login - Generar JWT
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  }

  if (username !== CREDENTIALS.username || password !== CREDENTIALS.password) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  // Generar token JWT
  const token = jwt.sign(
    { username, loginAt: new Date().toISOString() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )

  res.json({
    token,
    expiresIn: JWT_EXPIRY,
    user: { username }
  })
})

// GET /api/auth/verify - Verificar token válido
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  })
})

// GET /api/auth/refresh - Renovar token
app.post('/api/auth/refresh', authenticateToken, (req, res) => {
  const newToken = jwt.sign(
    { username: req.user.username, loginAt: req.user.loginAt },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )

  res.json({
    token: newToken,
    expiresIn: JWT_EXPIRY
  })
})

// Cache para no saturar el gateway
let metricsCache = {
  sessions: null,
  agents: null,
  gateway: null,
  agentStatus: null,
  lastUpdate: 0
}

const CACHE_TTL = 10000 // 10 segundos

// Importar funciones del monitor-comms.mjs para generar estado de agentes en tiempo real
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const AGENTS_DIR = process.env.AGENTS_DIR || '/home/ubuntu/.openclaw/agents'

// Mapa de configuración de agentes (puede extenderse con config.json en cada carpeta)
const AGENT_CONFIG = {
  'main': { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899', desc: 'Orquestador principal' },
  'planner': { id: 'er-plan', name: 'er Plan', emoji: '📐', color: '#f59e0b', desc: 'Arquitecto y diseñador' },
  'coder': { id: 'er-coder', name: 'er Coder', emoji: '🤖', color: '#8b5cf6', desc: 'Especialista en código' },
  'netops': { id: 'er-serve', name: 'er Serve', emoji: '🌐', color: '#06b6d4', desc: 'Especialista en redes' },
  'pr-reviewer': { id: 'er-pr', name: 'er PR', emoji: '🔍', color: '#22c55e', desc: 'Revisor de PRs' }
}

// Colores por defecto para agentes desconocidos
const DEFAULT_COLORS = ['#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444', '#14b8a6', '#f97316']
const DEFAULT_EMOJIS = ['🧠', '⚡', '🔧', '🌐', '📝', '🎯', '💡', '🚀']

// Función para detectar el estado del agente según actividad
function detectAgentStatus(folder) {
  const sessionsDir = join(AGENTS_DIR, folder, 'sessions')
  
  // Si no existe la carpeta del agente, está offline
  if (!existsSync(join(AGENTS_DIR, folder))) {
    return 'offline'
  }
  
  if (!existsSync(sessionsDir)) {
    return 'idle'
  }
  
  try {
    const files = readdirSync(sessionsDir)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
    
    if (files.length === 0) {
      return 'idle'
    }
    
    // Buscar sesiones recientes (últimos 5 minutos)
    const now = Date.now()
    const FIVE_MINUTES = 5 * 60 * 1000
    
    for (const file of files) {
      const filePath = join(sessionsDir, file)
      const stats = statSync(filePath)
      const fileAge = now - stats.mtime.getTime()
      
      if (fileAge < FIVE_MINUTES) {
        // Verificar si hay actividad reciente en el archivo
        const content = readFileSync(filePath, 'utf-8')
        const lines = content.trim().split('\n').filter(l => l.trim())
        
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1]
          try {
            const entry = JSON.parse(lastLine)
            const entryAge = now - new Date(entry.timestamp).getTime()
            
            if (entryAge < FIVE_MINUTES) {
              return 'running'
            }
          } catch (e) {
            // Ignorar errores de parseo
          }
        }
      }
    }
    
    // Hay sesiones pero ninguna reciente
    return 'active'
  } catch (error) {
    console.error(`Error detecting status for ${folder}:`, error.message)
    return 'idle'
  }
}

// Función para cargar configuración de agente desde archivo (si existe)
function loadAgentConfig(folder) {
  const configPaths = [
    join(AGENTS_DIR, folder, 'agent', 'config.json'),
    join(AGENTS_DIR, folder, 'config.json'),
    join(AGENTS_DIR, folder, 'agent', 'settings.json')
  ]
  
  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8')
        return JSON.parse(content)
      } catch (e) {
        // Ignorar errores de lectura/parseo
      }
    }
  }
  return null
}

// Función principal: detecta todos los agentes automáticamente
function detectAgents() {
  const agents = []
  
  if (!existsSync(AGENTS_DIR)) {
    console.warn(`AGENTS_DIR no existe: ${AGENTS_DIR}`)
    return agents
  }
  
  try {
    const folders = readdirSync(AGENTS_DIR).filter(f => {
      const path = join(AGENTS_DIR, f)
      return statSync(path).isDirectory()
    })
    
    folders.forEach((folder, index) => {
      // Cargar config si existe
      const customConfig = loadAgentConfig(folder)
      
      // Usar config predefinida o generar dinámicamente
      const baseConfig = AGENT_CONFIG[folder] || {}
      
      const agent = {
        id: customConfig?.id || baseConfig.id || `er-${folder}`,
        name: customConfig?.name || baseConfig.name || `er ${folder.charAt(0).toUpperCase() + folder.slice(1)}`,
        emoji: customConfig?.emoji || baseConfig.emoji || DEFAULT_EMOJIS[index % DEFAULT_EMOJIS.length],
        color: customConfig?.color || baseConfig.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        folder: folder,
        desc: customConfig?.description || customConfig?.desc || baseConfig.desc || `Agente ${folder}`,
        image: '/agent-avatars.jpg',
        // Estado se actualiza dinámicamente
        status: detectAgentStatus(folder)
      }
      
      agents.push(agent)
    })
    
    console.log(`✅ Detectados ${agents.length} agentes automáticamente:`, agents.map(a => a.name).join(', '))
  } catch (error) {
    console.error('Error detectando agentes:', error.message)
  }
  
  return agents
}

// Generar lista de agentes dinámicamente al iniciar
let agentsList = detectAgents()

// Palabras clave que indican ruido de herramientas
const NOISE_KEYWORDS = [
  'Command still running', 'signal SIGTERM', 'Exec completed', 'Exec failed',
  'vite v', 'vite ready', 'transforming', 'built in', 'npm run', 'Use process',
  'sessionId', 'Error:', 'Exception', '$$', '>>', '## ',
  'ENOENT', 'no such file', 'permission denied',
  'node_modules', '.jsonl', 'undefined', 'null',
  '"status":', '"tool":', '"error":',
  'import ', 'export ', 'const ', 'function ',
  '<<<<<<<', '=======', '>>>>>>>',
  'total ', 'drwx', '-rw', '-rwx',
  '(no output)', 'passphrase', 'credentials',
  'npm ERR', 'npm WARN', 'yarn ', 'pnpm ',
  'GET /', 'POST /', '200 OK', '404 ', '500 ',
  'Starting dev server', 'Compiled', 'Hash:',
  'assets by', 'Entrypoint', 'landing.',
  'waiting for', 'file changed', 'reload'
]

// Patrones que indican contenido de herramienta (muy ruidoso)
const TOOL_OUTPUT_PATTERNS = [
  /^\s*\d+:\w/m,
  /^\s*[\{\[]"/m,
  /^\s*(total|drwx|-rw)/,
  /^\s*\d+\s+\d+/,
  /^On branch/,
  /^Changes not staged/,
  /^Untracked files/,
  /^nothing to commit/,
]

// Función para verificar si es ruido
function isNoise(text) {
  const lower = text.toLowerCase()
  for (const keyword of NOISE_KEYWORDS) {
    if (text.includes(keyword)) return true
  }
  for (const pattern of TOOL_OUTPUT_PATTERNS) {
    if (pattern.test(text)) return true
  }
  if ((text.includes('{') && text.includes(':')) && text.length > 80) {
    const braceCount = (text.match(/\{/g) || []).length
    if (braceCount >= 2) return true
  }
  if (text.length < 15 && /^[\W\d]+$/.test(text)) return true
  return false
}

// Función para verificar mensaje significativo
function isSignificantMessage(msg) {
  if (msg.role === 'user') return true
  if (msg.role === 'assistant') {
    const content = msg.content
    if (Array.isArray(content)) {
      const hasRealText = content.some(c => 
        c.type === 'text' && c.text && c.text.length > 20 && !isNoise(c.text)
      )
      return hasRealText
    }
    if (typeof content === 'string' && content.length > 20) {
      return !isNoise(content)
    }
  }
  // Include toolResult messages - they contain tool output that should be counted
  if (msg.role === 'toolResult') return true
  return false
}

// Extraer texto limpio
function extractCleanText(msg) {
  let text = ''
  if (Array.isArray(msg.content)) {
    const textContent = msg.content.find(c => c.type === 'text')
    if (textContent?.text) {
      text = textContent.text
    }
  } else if (typeof msg.content === 'string') {
    text = msg.content
  }
  text = text
    .replace(/\[.*?\]\s*/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return text.substring(0, 150)
}

// Detectar comunicaciones entre agentes
function detectInterAgentCommunication(msg, agentFolder) {
  const text = extractCleanText(msg).toLowerCase()
  const agentMentions = {
    'coder': ['coder', 'código', 'programar', 'implementar'],
    'netops': ['netops', 'servidor', 'red', 'deploy', 'nginx'],
    'pr-reviewer': ['pr', 'review', 'revisar', 'pull request'],
    'main': ['main', 'principal', 'orquestador']
  }
  for (const [agent, keywords] of Object.entries(agentMentions)) {
    if (agent !== agentFolder) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          return { targetAgent: agent, keyword: kw }
        }
      }
    }
  }
  return null
}

// Mapa de folder a agentId (generado dinámicamente desde agentsList)
const folderToAgentId = agentsList.reduce((acc, agent) => {
  acc[agent.folder] = agent.id
  return acc
}, {})

// Detectar sesiones spawn
function detectSessionSpawns(agentFolder) {
  const dir = join(AGENTS_DIR, agentFolder, 'sessions')
  const spawns = {}
  if (!existsSync(dir)) return spawns
  try {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
      .sort((a, b) => statSync(join(dir, b)).mtime - statSync(join(dir, a)).mtime)
      .slice(0, 5)
    const today = new Date().toDateString()
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8')
      const lines = content.trim().split('\n').reverse()
      for (const line of lines) {
        try {
          const entry = JSON.parse(line)
          const entryDate = new Date(entry.timestamp).toDateString()
          if (entryDate !== today) continue
          if (entry.type !== 'message') continue
          const msg = entry.message
          if (!msg?.role || msg.role !== 'assistant') continue
          if (!Array.isArray(msg.content)) continue
          for (const contentItem of msg.content) {
            if (contentItem.type === 'toolCall' && contentItem.name === 'sessions_spawn') {
              const args = contentItem.arguments || {}
              const targetAgentId = args.agentId
              const task = args.task || ''
              const label = args.label || ''
              if (targetAgentId && folderToAgentId[targetAgentId]) {
                const targetAgent = folderToAgentId[targetAgentId]
                const time = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
                if (!spawns[targetAgentId] || time > spawns[targetAgentId].time) {
                  spawns[targetAgentId] = {
                    spawnedBy: agentFolder,
                    spawnedByAgentId: folderToAgentId[agentFolder],
                    targetAgentId,
                    task: task.substring(0, 200),
                    label,
                    time,
                    timestamp: entry.timestamp
                  }
                }
              }
            }
          }
        } catch {}
      }
    }
  } catch (e) {}
  return spawns
}

function getLatestSession(dir) {
  if (!existsSync(dir)) return null
  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
    if (files.length === 0) return null
    return files.sort((a, b) => statSync(join(dir, b)).mtime - statSync(join(dir, a)).mtime)[0]
  } catch {
    return null
  }
}

function countTokens(text) {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

function hadPreviousSessions(agentFolder) {
  const dir = join(AGENTS_DIR, agentFolder, 'sessions')
  if (!existsSync(dir)) return false
  try {
    const files = readdirSync(dir)
    const hasAnySession = files.some(f => f.includes('.jsonl'))
    return hasAnySession
  } catch {
    return false
  }
}

// Función principal para procesar un agente
function processAgent(agentInfo) {
  const dir = join(AGENTS_DIR, agentInfo.folder, 'sessions')
  let inputTokens = 0
  let outputTokens = 0
  
  if (!existsSync(dir)) {
    return { 
      ...agentInfo, 
      status: 'offline', 
      task: 'Sin carpeta', 
      progress: 0, 
      logs: [], 
      communications: [],
      tokens: { input: 0, output: 0, total: 0 }
    }
  }
  
  const sessionFile = getLatestSession(dir)
  const hadSessions = hadPreviousSessions(agentInfo.folder)
  
  if (!sessionFile) {
    return { 
      ...agentInfo, 
      status: hadSessions ? 'idle' : 'offline', 
      task: hadSessions ? 'Esperando órdenes...' : 'Sin actividad previa', 
      progress: 0, 
      logs: [], 
      communications: [],
      tokens: { input: 0, output: 0, total: 0 }
    }
  }
  
  try {
    const content = readFileSync(join(dir, sessionFile), 'utf-8')
    const lines = content.trim().split('\n').reverse()

    // Get session start time from first line (session entry)
    const sessionStartLine = lines[lines.length - 1]
    let sessionStartTime = null
    let uptime = 0
    try {
      const sessionEntry = JSON.parse(sessionStartLine)
      if (sessionEntry.type === 'session') {
        sessionStartTime = new Date(sessionEntry.timestamp).getTime()
        uptime = ((Date.now() - sessionStartTime) / 1000 / 60 / 60) // hours
      }
    } catch (e) {}

    const today = new Date().toDateString()
    const now = Date.now()
    const tenMinsAgo = now - 10 * 60 * 1000
    const thirtyMinsAgo = now - 30 * 60 * 1000 // Para detectar idle

    const logs = []
    const communications = []
    let currentTask = null
    let hasToolCalls = false
    let lastMessageTime = 0
    let hasErrors = false

    // Función unificada para detectar errores en mensajes
    function detectError(msg) {
      // Check for isError flag - this is the most reliable indicator
      if (msg.isError === true) return true
      
      // Check details.status for error
      if (msg.details?.status === 'error') return true
      
      // Check if details.error exists
      if (msg.details?.error) return true
      
      // Check if content contains explicit error indicators
      // Look for patterns like "Error:", "Failed:", "Exception:" at the START of content
      if (Array.isArray(msg.content)) {
        const contentText = msg.content.map(c => c.text || '').join(' ')
        const trimmedContent = contentText.trim()
        // Only flag as error if content STARTS with explicit error pattern
        const explicitErrorPattern = /^(error|failed|exception):\s*/i
        if (explicitErrorPattern.test(trimmedContent)) return true
        // Also check for JSON error format: {"status": "error", ...}
        if (trimmedContent.includes('"status"') && trimmedContent.includes('"error"')) {
          try {
            const parsed = JSON.parse(trimmedContent)
            if (parsed.status === 'error' || parsed.error) return true
          } catch (e) {
            // Not JSON, ignore
          }
        }
      }
      
      // Check for string content with explicit error pattern at START
      if (msg.content && typeof msg.content === 'string') {
        const trimmedContent = msg.content.trim()
        const explicitErrorPattern = /^(error|failed|exception):\s*/i
        if (explicitErrorPattern.test(trimmedContent)) return true
      }
      
      return false
    }

    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        const entryDate = new Date(entry.timestamp).toDateString()
        const entryTime = new Date(entry.timestamp).getTime()

        // Process ALL messages (not just today) for accurate token counting
        if (entry.type !== 'message') continue
        
        const msg = entry.message
        if (!msg?.role) continue
        
        // Detectar tool calls (para estado running)
        if (msg.role === 'assistant' && Array.isArray(msg.content)) {
          if (msg.content.some(c => c.type === 'toolCall')) {
            hasToolCalls = true
          }
        }
        
        // Detectar errores en tool results usando la función unificada
        if (msg.role === 'toolResult') {
          if (detectError(msg)) {
            hasErrors = true
          }
        }
        
        // Detectar errores explícitos en el entry
        if (entry.error) {
          hasErrors = true
        }
        
        // Verificar errores en el mensaje usando la función unificada
        if (detectError(msg)) {
          hasErrors = true
        }
        
        // Actualizar último mensaje
        if (entryTime > lastMessageTime) {
          lastMessageTime = entryTime
        }
        
        // Solo procesar mensajes significativos
        if (!isSignificantMessage(msg)) continue
        
        const text = extractCleanText(msg)
        if (!text || text.length < 10) continue
        if (isNoise(text)) continue
        
        // Contar tokens
        const msgTokens = countTokens(text)
        if (msg.role === 'user') {
          inputTokens += msgTokens
        } else {
          outputTokens += msgTokens
        }
        
        // Contar tokens de toolCalls (herramientas)
        const toolCallTokens = extractToolCallTokens(msg)
        inputTokens += toolCallTokens.input
        outputTokens += toolCallTokens.output
        
        const time = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
        
        // Añadir a logs
        logs.push({ 
          type: msg.role, 
          text, 
          time,
          raw: msg.role === 'user'
        })
        
        // Detectar comunicaciones
        const comm = detectInterAgentCommunication(msg, agentInfo.folder)
        if (comm) {
          communications.push({
            from: agentInfo.id,
            to: comm.targetAgent,
            content: text.substring(0, 100),
            time,
            type: msg.role
          })
        }
        
        // Guardar última tarea de usuario
        if (msg.role === 'user' && entryTime > tenMinsAgo) {
          currentTask = text
        }
        
      } catch {}
    }
    
    if (!currentTask && logs.some(l => l.type === 'user')) {
      const lastUser = logs.filter(l => l.type === 'user').pop()
      if (lastUser) currentTask = lastUser.text
    }
    
    // Mejor detección de estados
    let status
    if (hasErrors) {
      status = 'error'
    } else if (hasToolCalls) {
      status = 'running'
    } else if (lastMessageTime > 0 && (now - lastMessageTime) > thirtyMinsAgo) {
      // Sin mensajes en los últimos 30 minutos → idle
      status = 'idle'
    } else if (logs.length > 0) {
      status = 'active'
    } else if (hadSessions) {
      status = 'idle'
    } else {
      status = 'idle'
    }
    
    const progress = hasToolCalls ? Math.min(80, 40 + Math.floor(Math.random() * 30)) : 
                     (status === 'active' ? 100 : (status === 'error' ? 0 : 0))
    
    return {
      ...agentInfo,
      status,
      task: currentTask || (status === 'error' ? 'Error detectado' : 'Esperando órdenes...'),
      progress,
      started: sessionStartTime ? new Date(sessionStartTime).toISOString() : (logs[0]?.time || null),
      uptime: uptime,
      sessionStartTime: sessionStartTime,
      lastError: hasErrors ? new Date().toISOString() : null,
      logs: logs.slice(0, 100),
      communications: communications.slice(0, 50),
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      },
      lastActivity: lastMessageTime > 0 ? new Date(lastMessageTime).toISOString() : null
    }
    
  } catch (e) {
    return { ...agentInfo, status: 'error', task: 'Error: ' + e.message, progress: 0, logs: [], communications: [], tokens: { input: 0, output: 0, total: 0 } }
  }
}

// Recolectar todos los spawns
const allSpawns = {}
for (const agent of agentsList) {
  const agentSpawns = detectSessionSpawns(agent.folder)
  Object.assign(allSpawns, agentSpawns)
}

// GET /api/metrics/sessions - Solo lista de sesiones (sin mensajes)
app.get('/api/metrics/sessions', authenticateToken, async (req, res) => {
  try {
    const now = Date.now()
    if (metricsCache.sessions && (now - metricsCache.lastUpdate) < CACHE_TTL) {
      return res.json(metricsCache.sessions)
    }
    
    const result = await sessions_list({ limit: 20, messageLimit: 0 })
    
    // Solo métricas - sin contenido de mensajes
    const safeSessions = result.sessions.map(s => ({
      key: s.key,
      kind: s.kind,
      channel: s.channel,
      label: s.label || null,
      displayName: s.displayName,
      updatedAt: s.updatedAt,
      sessionId: s.sessionId,
      model: s.model,
      totalTokens: s.totalTokens || 0,
      contextTokens: s.contextTokens || 0,
      systemSent: s.systemSent,
      abortedLastRun: s.abortedLastRun,
      lastChannel: s.lastChannel
    }))
    
    const response = {
      count: result.count,
      sessions: safeSessions,
      fetchedAt: new Date().toISOString()
    }
    
    metricsCache.sessions = response
    metricsCache.lastUpdate = now
    
    res.json(response)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// GET /api/metrics/agents - Estado agregado de agentes
app.get('/api/metrics/agents', authenticateToken, async (req, res) => {
  try {
    const result = await sessions_list({ limit: 50, messageLimit: 0 })
    
    // Agrupar por tipo de agente
    const agents = {
      'er-hineda': { sessions: 0, tokens: 0, lastActive: null },
      'coder': { sessions: 0, tokens: 0, lastActive: null },
      'netops': { sessions: 0, tokens: 0, lastActive: null },
      'pr-reviewer': { sessions: 0, tokens: 0, lastActive: null },
      'other': { sessions: 0, tokens: 0, lastActive: null }
    }
    
    result.sessions.forEach(s => {
      let agentType = 'other'
      if (s.key.includes('coder')) agentType = 'coder'
      else if (s.key.includes('netops')) agentType = 'netops'
      else if (s.key.includes('pr-reviewer')) agentType = 'pr-reviewer'
      else if (s.key.includes('main') || s.key.includes('telegram')) agentType = 'er-hineda'
      
      agents[agentType].sessions++
      agents[agentType].tokens += s.totalTokens || 0
      if (!agents[agentType].lastActive || s.updatedAt > agents[agentType].lastActive) {
        agents[agentType].lastActive = s.updatedAt
      }
    })
    
    res.json({
      agents,
      totalSessions: result.count,
      fetchedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    res.status(500).json({ error: 'Failed to fetch agent metrics' })
  }
})

// GET /api/metrics/gateway - Estado del gateway
app.get('/api/metrics/gateway', authenticateToken, async (req, res) => {
  try {
    const result = await sessions_list({ limit: 1, messageLimit: 0 })
    
    const response = {
      status: 'online',
      uptime: process.uptime(),
      activeSessions: result.count,
      secure: true,
      readonly: true,
      fetchedAt: new Date().toISOString()
    }
    
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: 'Gateway unavailable' })
  }
})

// GET /api/metrics/agent-status - Estado completo de agentes (igual que monitor-comms.mjs pero en tiempo real)
app.get('/api/metrics/agent-status', authenticateToken, async (req, res) => {
  try {
    const now = Date.now()
    if (metricsCache.agentStatus && (now - metricsCache.lastUpdate) < CACHE_TTL) {
      return res.json(metricsCache.agentStatus)
    }
    
    // Procesar todos los agentes
    const data = {}
    const allCommunications = []
    let totalInputTokens = 0
    let totalOutputTokens = 0
    
    for (const agent of agentsList) {
      const result = processAgent(agent)
      data[agent.id] = result
      allCommunications.push(...(result.communications || []))
      
      if (result.tokens) {
        totalInputTokens += result.tokens.input
        totalOutputTokens += result.tokens.output
      }
    }
    
    // Crear vista de comunicaciones entre agentes
    const commView = allCommunications
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 15)
    
    // Métricas globales
    const globalMetrics = {
      tokens: {
        input: totalInputTokens,
        output: totalOutputTokens,
        total: totalInputTokens + totalOutputTokens
      },
      activeAgents: Object.values(data).filter(a => a.status === 'running' || a.status === 'active').length,
      idleAgents: Object.values(data).filter(a => a.status === 'idle').length,
      offlineAgents: Object.values(data).filter(a => a.status === 'offline').length,
      errorAgents: Object.values(data).filter(a => a.status === 'error').length
    }
    
    const response = {
      generatedAt: new Date().toISOString(),
      agents: data,
      communications: commView,
      metrics: globalMetrics
    }
    
    metricsCache.agentStatus = response
    metricsCache.lastUpdate = now
    
    res.json(response)
  } catch (error) {
    console.error('Error fetching agent status:', error)
    res.status(500).json({ error: 'Failed to fetch agent status' })
  }
})

// Función para extraer tokens de toolCalls
function extractToolCallTokens(msg) {
  let inputTokens = 0
  let outputTokens = 0
  
  if (!Array.isArray(msg.content)) return { input: 0, output: 0 }
  
  // Handle toolResult messages (role === 'toolResult')
  // These messages have content with actual output from tool execution
  if (msg.role === 'toolResult') {
    for (const item of msg.content) {
      if (item.type === 'text' && item.text) {
        outputTokens += countTokens(item.text)
      } else if (item.type === 'image' && item.image) {
        // Count image URLs as output tokens too
        outputTokens += countTokens(JSON.stringify(item.image))
      }
    }
    return { input: inputTokens, output: outputTokens }
  }
  
  // Handle toolCall and toolResult items within assistant messages
  for (const item of msg.content) {
    // toolCall: contar tokens en los argumentos (input)
    if (item.type === 'toolCall' && item.arguments) {
      const argsStr = typeof item.arguments === 'string' ? item.arguments : JSON.stringify(item.arguments)
      inputTokens += countTokens(argsStr)
    }
    
    // toolResult: contar tokens en el contenido (output) - for embedded results
    if (item.type === 'toolResult' && item.content) {
      const contentStr = typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
      outputTokens += countTokens(contentStr)
    }
  }
  
  return { input: inputTokens, output: outputTokens }
}

// Función para calcular actividad por hora (datos reales)
function calculateHourlyActivity() {
  const now = new Date()
  const hourlyData = {}
  const hourlyTokens = {}
  
  // Inicializar últimas 12 horas
  for (let i = 11; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 3600000)
    const hourKey = hour.getHours().toString().padStart(2, '0') + ':00'
    hourlyData[hourKey] = { activity: 0, inputTokens: 0, outputTokens: 0 }
    hourlyTokens[hourKey] = { input: 0, output: 0 }
  }
  
  // Leer todas las sesiones de todos los agentes
  for (const agent of agentsList) {
    const dir = join(AGENTS_DIR, agent.folder, 'sessions')
    if (!existsSync(dir)) continue
    
    try {
      const files = readdirSync(dir)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
      
      for (const file of files) {
        const content = readFileSync(join(dir, file), 'utf-8')
        const lines = content.trim().split('\n')
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line)
            const entryTime = new Date(entry.timestamp)
            
            // Solo procesar entradas del día
            if (entryTime.toDateString() !== now.toDateString()) continue
            if (entry.type !== 'message') continue
            
            const msg = entry.message
            if (!msg?.role) continue
            
            const hourKey = entryTime.getHours().toString().padStart(2, '0') + ':00'
            if (!hourlyData[hourKey]) continue
            
            // Contar tokens de toolCalls (tanto input como output)
            const toolCallTokens = extractToolCallTokens(msg)
            if (toolCallTokens.input > 0 || toolCallTokens.output > 0) {
              hourlyData[hourKey].inputTokens += toolCallTokens.input
              hourlyData[hourKey].outputTokens += toolCallTokens.output
              
              // Contar cada toolCall como una actividad
              if (Array.isArray(msg.content)) {
                const toolCallCount = msg.content.filter(c => c.type === 'toolCall').length
                hourlyData[hourKey].activity += toolCallCount
              }
            }
            
            // Contar actividad (mensaje significativo)
            // Note: toolResult messages are already counted in extractToolCallTokens above
            // so we don't double-count them here
            if (isSignificantMessage(msg) && msg.role !== 'toolResult') {
              hourlyData[hourKey].activity++
              
              // Contar tokens
              const text = extractCleanText(msg)
              const msgTokens = countTokens(text)
              if (msg.role === 'user') {
                hourlyData[hourKey].inputTokens += msgTokens
              } else {
                hourlyData[hourKey].outputTokens += msgTokens
              }
            }
          } catch {}
        }
      }
    } catch {}
  }
  
  // Convertir a array para el frontend
  const hourlyActivity = Object.entries(hourlyData).map(([hour, data]) => ({
    hour,
    activity: data.activity,
    input: data.inputTokens,
    output: data.outputTokens
  })).sort((a, b) => a.hour.localeCompare(b.hour))
  
  return hourlyActivity
}

// Cache para actividad por hora
let hourlyActivityCache = {
  data: null,
  lastUpdate: 0
}

// =============================================================================
// FUNCIÓN PARA CALCULAR ACTIVIDAD DIARIA (últimos 7 días)
// =============================================================================
function calculateDailyActivity() {
  const now = new Date()
  const dailyData = {}
  
  // Inicializar últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailyData[dateStr] = { activity: 0, sessions: 0, tokens: 0, input: 0, output: 0 }
  }
  
  // Leer todas las sesiones de todos los agentes
  for (const agent of agentsList) {
    const dir = join(AGENTS_DIR, agent.folder, 'sessions')
    if (!existsSync(dir)) continue
    
    try {
      const files = readdirSync(dir)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
      
      for (const file of files) {
        try {
          const content = readFileSync(join(dir, file), 'utf-8')
          const lines = content.trim().split('\n')
          
          // Contar sesiones (cada archivo es una sesión)
          let hasContent = false
          
          for (const line of lines) {
            try {
              const entry = JSON.parse(line)
              const entryTime = new Date(entry.timestamp)
              const dateStr = entryTime.toISOString().split('T')[0]
              
              // Solo procesar entradas de los últimos 7 días
              if (!dailyData[dateStr]) continue
              if (entry.type !== 'message') continue
              
              const msg = entry.message
              if (!msg?.role) continue
              
              hasContent = true
              
              // Contar tokens de toolCalls
              const toolCallTokens = extractToolCallTokens(msg)
              if (toolCallTokens.input > 0 || toolCallTokens.output > 0) {
                dailyData[dateStr].input += toolCallTokens.input
                dailyData[dateStr].output += toolCallTokens.output
                
                if (Array.isArray(msg.content)) {
                  const toolCallCount = msg.content.filter(c => c.type === 'toolCall').length
                  dailyData[dateStr].activity += toolCallCount
                }
              }
              
              // Contar actividad de mensajes
              // Note: toolResult messages are already counted in extractToolCallTokens above
              // so we don't double-count them here
              if (isSignificantMessage(msg) && msg.role !== 'toolResult') {
                dailyData[dateStr].activity++
                
                const text = extractCleanText(msg)
                const msgTokens = countTokens(text)
                if (msg.role === 'user') {
                  dailyData[dateStr].input += msgTokens
                } else {
                  dailyData[dateStr].output += msgTokens
                }
              }
            } catch {}
          }
          
          // Contar sesión si tiene contenido
          if (hasContent) {
            const firstLine = lines[0]
            if (firstLine) {
              try {
                const entry = JSON.parse(firstLine)
                const entryTime = new Date(entry.timestamp)
                const dateStr = entryTime.toISOString().split('T')[0]
                if (dailyData[dateStr]) {
                  dailyData[dateStr].sessions++
                }
              } catch {}
            }
          }
        } catch {}
      }
    } catch {}
  }
  
  // Convertir a array
  const dailyActivity = Object.entries(dailyData).map(([date, data]) => ({
    date,
    activity: data.activity,
    sessions: data.sessions,
    tokens: data.input + data.output,
    input: data.input,
    output: data.output
  })).sort((a, b) => a.date.localeCompare(b.date))
  
  return dailyActivity
}

// Cache para actividad diaria
let dailyActivityCache = {
  data: null,
  lastUpdate: 0
}

// GET /api/metrics/activity - Actividad por hora (hoy) y diaria (7 días)
app.get('/api/metrics/activity', authenticateToken, async (req, res) => {
  try {
    const now = Date.now()
    
    // Usar cache si está disponible (TTL de 30 segundos para no recalcular demasiado)
    if (hourlyActivityCache.data && (now - hourlyActivityCache.lastUpdate) < 30000) {
      return res.json(hourlyActivityCache.data)
    }
    
    const hourlyActivity = calculateHourlyActivity()
    const dailyActivity = calculateDailyActivity()
    
    // Calcular totales de hoy (hourly)
    const totals = hourlyActivity.reduce((acc, hour) => ({
      activity: acc.activity + hour.activity,
      input: acc.input + hour.input,
      output: acc.output + hour.output
    }), { activity: 0, input: 0, output: 0 })
    
    const response = {
      hourly: hourlyActivity,
      daily: dailyActivity,
      totals,
      generatedAt: new Date().toISOString()
    }
    
    hourlyActivityCache = {
      data: response,
      lastUpdate: now
    }
    
    res.json(response)
  } catch (error) {
    console.error('Error calculating hourly activity:', error)
    res.status(500).json({ error: 'Failed to calculate hourly activity' })
  }
})

// =============================================================================
// SERVER-SENT EVENTS (SSE) - Tiempo real sin polling
// =============================================================================

// Interval de actualización SSE (en milisegundos)
const SSE_UPDATE_INTERVAL = 5000 // 5 segundos

// GET /api/events - Server-Sent Events para tiempo real
app.get('/api/events', (req, res) => {
  // Aceptar token tanto en header como en query param (EventSource no soporta headers)
  const authHeader = req.headers['authorization']
  const queryToken = req.query.token
  
  let token = null
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (queryToken) {
    token = queryToken
  }

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  // Verificar token
  let user
  try {
    user = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }

  // Configurar headers para SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  // Enviar evento inicial de conexión
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)

  console.log(`📡 Cliente SSE conectado: ${user.username}`)

  // Interval para enviar actualizaciones
  const interval = setInterval(async () => {
    try {
      // Obtener datos actualizados
      const now = Date.now()
      
      // Procesar todos los agentes
      const data = {}
      const allCommunications = []
      let totalInputTokens = 0
      let totalOutputTokens = 0
      
      for (const agent of agentsList) {
        const result = processAgent(agent)
        data[agent.id] = result
        allCommunications.push(...(result.communications || []))
        
        if (result.tokens) {
          totalInputTokens += result.tokens.input
          totalOutputTokens += result.tokens.output
        }
      }
      
      const commView = allCommunications
        .sort((a, b) => b.time.localeCompare(a.time))
        .slice(0, 10)
      
      const globalMetrics = {
        tokens: {
          input: totalInputTokens,
          output: totalOutputTokens,
          total: totalInputTokens + totalOutputTokens
        },
        activeAgents: Object.values(data).filter(a => a.status === 'running' || a.status === 'active').length,
        idleAgents: Object.values(data).filter(a => a.status === 'idle').length,
        offlineAgents: Object.values(data).filter(a => a.status === 'offline').length,
        errorAgents: Object.values(data).filter(a => a.status === 'error').length
      }

      const eventData = {
        type: 'update',
        timestamp: new Date().toISOString(),
        agents: data,
        communications: commView,
        metrics: globalMetrics
      }

      res.write(`data: ${JSON.stringify(eventData)}\n\n`)
    } catch (error) {
      console.error('Error en SSE:', error.message)
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
    }
  }, SSE_UPDATE_INTERVAL)

  // Cleanup cuando el cliente se desconecta
  req.on('close', () => {
    clearInterval(interval)
    console.log(`📡 Cliente SSE desconectado: ${user.username}`)
  })
})

// Levels API - Sistema de niveles
app.get('/api/levels', authenticateToken, (req, res) => {
  // Datos de niveles hardcodeados por ahora
  // En el futuro, estos vendrán de una base de datos
  const levels = {
    user: {
      level: 1,
      currentXP: 0,
      xpForNextLevel: 100,
      totalXP: 0,
      coins: 50,
      rank: 'Novato'
    },
    // Configuración de niveles
    config: {
      maxLevel: 10,
      xpPerLevel: [0, 100, 250, 500, 850, 1300, 1900, 2700, 3800, 5500, 8000],
      rewards: {
        1: { coins: 50 },
        2: { coins: 75 },
        3: { coins: 100 },
        4: { coins: 150 },
        5: { coins: 200 },
        6: { coins: 300 },
        7: { coins: 400 },
        8: { coins: 500 },
        9: { coins: 750 },
        10: { coins: 1000 }
      },
      rankNames: {
        1: 'Novato',
        2: 'Aprendiz',
        3: 'Explorador',
        4: 'Investigador',
        5: 'Especialista',
        6: 'Experto',
        7: 'Maestro',
        8: 'Veterano',
        9: 'Élite',
        10: 'Legendario'
      },
      levelColors: {
        1: '#10b981',
        2: '#34d399',
        3: '#14b8a6',
        4: '#06b6d4',
        5: '#3b82f6',
        6: '#6366f1',
        7: '#8b5cf6',
        8: '#a855f7',
        9: '#f59e0b',
        10: '#eab308'
      }
    }
  }
  
  res.json(levels)
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', readonly: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`📊 Agent Metrics API running on port ${PORT}`)
  console.log('🔒 Modo solo lectura - sin capacidades de ejecución')
})
