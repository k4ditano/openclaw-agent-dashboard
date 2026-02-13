/**
 * Monitor multi-agente en tiempo real
 * 
 * Mejorado para:
 * - Filtrar ruido (toolResult, exec output, etc.)
 * - Detectar comunicaciones entre agentes via sessions_spawn
 * - Correlacionar agentes emissores y receptores
 * - Mostrar solo mensajes significativos
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const AGENTS_DIR = '/home/ubuntu/.openclaw/agents'
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public'

// 5 agentes - cada uno con su carpeta
const agents = [
  { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899', folder: 'main', desc: 'Orquestador principal' },
  { id: 'er-plan', name: 'er Plan', emoji: '📐', color: '#f59e0b', folder: 'planner', desc: 'Arquitecto y diseñador' },
  { id: 'er-coder', name: 'er Coder', emoji: '🤖', color: '#8b5cf6', folder: 'coder', desc: 'Especialista en código' },
  { id: 'er-serve', name: 'er Serve', emoji: '🌐', color: '#06b6d4', folder: 'netops', desc: 'Especialista en redes' },
  { id: 'er-pr', name: 'er PR', emoji: '🔍', color: '#22c55e', folder: 'pr-reviewer', desc: 'Revisor de PRs' }
]

// Mapa de folder a agentId
const folderToAgentId = {
  'main': 'er-hineda',
  'planner': 'er-plan',
  'coder': 'er-coder',
  'netops': 'er-serve',
  'pr-reviewer': 'er-pr'
}

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
  /^\s*\d+:\w/m,           // Líneas de código con número
  /^\s*[\{\[]"/m,          // JSON
  /^\s*(total|drwx|-rw)/,  // ls output
  /^\s*\d+\s+\d+/,         // Números
  /^On branch/,            // Git status
  /^Changes not staged/,   // Git
  /^Untracked files/,      // Git
  /^nothing to commit/,    // Git
]

/**
 * Verifica si un texto es ruido que debe filtrarse
 */
function isNoise(text) {
  const lower = text.toLowerCase()
  
  // Filtrar por palabras clave
  for (const keyword of NOISE_KEYWORDS) {
    if (text.includes(keyword)) return true
  }
  
  // Filtrar patrones de output de herramientas
  for (const pattern of TOOL_OUTPUT_PATTERNS) {
    if (pattern.test(text)) return true
  }
  
  // Filtrar JSON/objetos grandes
  if ((text.includes('{') && text.includes(':')) && text.length > 80) {
    // Parece JSON, filtrar
    const braceCount = (text.match(/\{/g) || []).length
    if (braceCount >= 2) return true
  }
  
  // Filtrar líneas muy cortas que son solo símbolos
  if (text.length < 15 && /^[\W\d]+$/.test(text)) return true
  
  return false
}

/**
 * Verifica si es un mensaje significativo (usuario o asistente real)
 */
function isSignificantMessage(msg) {
  // Usuario siempre es significativo
  if (msg.role === 'user') return true
  
  // Assistant: verificar que no sea solo toolResult
  if (msg.role === 'assistant') {
    const content = msg.content
    if (Array.isArray(content)) {
      // Buscar si hay texto real (no solo toolCall/toolResult)
      const hasRealText = content.some(c => 
        c.type === 'text' && c.text && c.text.length > 20 && !isNoise(c.text)
      )
      return hasRealText
    }
    // Texto directo del asistente
    if (typeof content === 'string' && content.length > 20) {
      return !isNoise(content)
    }
  }
  
  return false
}

/**
 * Extrae texto limpio de un mensaje
 */
function extractCleanText(msg) {
  let text = ''
  
  if (Array.isArray(msg.content)) {
    // Buscar texto, no tool calls
    const textContent = msg.content.find(c => c.type === 'text')
    if (textContent?.text) {
      text = textContent.text
    }
  } else if (typeof msg.content === 'string') {
    text = msg.content
  }
  
  // Limpiar el texto
  text = text
    .replace(/\[.*?\]\s*/g, '')  // Remover [references]
    .replace(/`{1,3}/g, '')       // Remover backticks
    .replace(/\n+/g, ' ')         // Una línea
    .trim()
  
  return text.substring(0, 150) // Máximo 150 chars
}

/**
 * Detecta si un mensaje es una comunicación entre agentes
 */
function detectInterAgentCommunication(msg, agentFolder) {
  const text = extractCleanText(msg).toLowerCase()
  
  // Detectar menciones a otros agentes
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

/**
 * Detecta sesiones spawn (comunicaciones entre agentes) en una carpeta de sesiones
 * Devuelve mapa de spawns: { agentFolder: { spawnedBy: 'folder', task: '...', label: '...', time: '...' } }
 */
function detectSessionSpawns(agentFolder) {
  const dir = join(AGENTS_DIR, agentFolder, 'sessions')
  const spawns = {}
  
  if (!existsSync(dir)) return spawns
  
  try {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
      .sort((a, b) => statSync(join(dir, b)).mtime - statSync(join(dir, a)).mtime)
      .slice(0, 5) // Solo las últimas 5 sesiones para rendimiento
    
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
          
          // Buscar toolCall de sessions_spawn
          for (const contentItem of msg.content) {
            if (contentItem.type === 'toolCall' && contentItem.name === 'sessions_spawn') {
              const args = contentItem.arguments || {}
              const targetAgentId = args.agentId
              const task = args.task || ''
              const label = args.label || ''
              
              if (targetAgentId && folderToAgentId[targetAgentId]) {
                const targetAgent = folderToAgentId[targetAgentId]
                const time = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
                
                // Guardar el spawn más reciente para cada agente objetivo
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
  } catch (e) {
    // Silently handle errors
  }
  
  return spawns
}

// Recolectar TODOS los spawns de todas las sesiones de todos los agentes
const allSpawns = {}
for (const agent of agents) {
  const agentSpawns = detectSessionSpawns(agent.folder)
  Object.assign(allSpawns, agentSpawns)
}

console.log(`🔗 Detectados ${Object.keys(allSpawns).length} spawns entre agentes`)

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

/**
 * Cuenta tokens aproximados en un mensaje
 * Estimación simple: ~4 caracteres por token
 */
function countTokens(text) {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

/**
 * Determina si un agente tuvo sesiones previamente (aunque estén borradas)
 */
function hadPreviousSessions(agentFolder) {
  const dir = join(AGENTS_DIR, agentFolder, 'sessions')
  if (!existsSync(dir)) return false
  
  try {
    const files = readdirSync(dir)
    // Buscar archivos .jsonl o .jsonl.deleted (sesiones previas)
    const hasAnySession = files.some(f => f.includes('.jsonl'))
    return hasAnySession
  } catch {
    return false
  }
}

function processAgent(agentInfo) {
  const dir = join(AGENTS_DIR, agentInfo.folder, 'sessions')
  
  // Métricas de tokens
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
  
  // Verificar si tuvo sesiones previamente (archivos .deleted)
  const hadSessions = hadPreviousSessions(agentInfo.folder)
  
  if (!sessionFile) {
    // Si tuvo sesiones antes pero ahora no hay → idle (no offline)
    // Solo offline si nunca tuvo sesiones
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
    
    const today = new Date().toDateString()
    const now = Date.now()
    const tenMinsAgo = now - 10 * 60 * 1000
    
    const logs = []
    const communications = []
    let currentTask = null
    let hasToolCalls = false
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        const entryDate = new Date(entry.timestamp).toDateString()
        const entryTime = new Date(entry.timestamp).getTime()
        
        if (entryDate !== today) continue
        if (entry.type !== 'message') continue
        
        const msg = entry.message
        if (!msg?.role) continue
        
        // Detectar tool calls (para estado running)
        if (msg.role === 'assistant' && Array.isArray(msg.content)) {
          if (msg.content.some(c => c.type === 'toolCall')) {
            hasToolCalls = true
          }
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
        
        const time = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
        
        // Añadir a logs
        logs.push({ 
          type: msg.role, 
          text, 
          time,
          raw: msg.role === 'user' // Usuario mensajes son "crudos"
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
    
    const status = hasToolCalls ? 'running' : (logs.length > 0 ? 'active' : (hadSessions ? 'idle' : 'idle'))
    const progress = hasToolCalls ? Math.min(80, 40 + Math.floor(Math.random() * 30)) : (logs.length > 0 ? 100 : 0)
    
    return {
      ...agentInfo,
      status,
      task: currentTask || 'Esperando órdenes...',
      progress,
      started: logs[0]?.time || null,
      logs: logs.slice(0, 10),
      communications: communications.slice(0, 5),
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      }
    }
    
  } catch (e) {
    return { ...agentInfo, status: 'error', task: 'Error', progress: 0, logs: [], communications: [], tokens: { input: 0, output: 0, total: 0 } }
  }
}

// Procesar todos los agentes
const data = {}
const allCommunications = []
let totalInputTokens = 0
let totalOutputTokens = 0

for (const agent of agents) {
  const result = processAgent(agent)
  data[agent.id] = result
  allCommunications.push(...(result.communications || []))
  
  // Acumular tokens
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
  offlineAgents: Object.values(data).filter(a => a.status === 'offline').length
}

writeFileSync(join(OUTPUT_DIR, 'agent-status.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  agents: data,
  communications: commView,
  metrics: globalMetrics
}, null, 2))

console.log(`✅ ${agents.length} agentes | ${commView.length} comunicaciones | ${Object.values(data).reduce((acc, a) => acc + (a.logs?.length || 0), 0)} logs limpios | ${globalMetrics.tokens.total} tokens`)
