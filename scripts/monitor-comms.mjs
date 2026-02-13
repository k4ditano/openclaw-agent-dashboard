/**
 * Monitor de agentes - solo mensajes útiles cada 15 segundos
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const AGENTS_DIR = '/home/ubuntu/.openclaw/agents'
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public'

const agents = {
  'main': { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899', dir: 'coder' },
  'coder': { id: 'coder', name: 'er Codi', emoji: '🤖', color: '#8b5cf6', dir: 'none' },
  'netops': { id: 'netops', name: 'er Serve', emoji: '🌐', color: '#06b6d4', dir: 'netops' },
  'pr-reviewer': { id: 'pr-reviewer', name: 'er PR', emoji: '🔍', color: '#22c55e', dir: 'pr-reviewer' }
}

// Solo mensajes útiles
function isUsefulLog(text) {
  // Ignorar mensajes del sistema
  if (text.includes('Command still running') || text.includes('signal SIGTERM')) return false
  if (text.includes('Exec completed') || text.includes('Exec failed')) return false
  if (text.includes('vite v') || text.includes('vite ready')) return false
  if (text.includes('transforming') || text.includes('built in')) return false
  if (text.includes('npm run')) return false
  if (text.includes('Use process') || text.includes('sessionId')) return false
  if (text.includes('Error:') || text.includes('Exception')) return false
  if (text.includes('$$') || text.includes('>>') || text.includes('## ')) return false
  if (text.length < 10) return false
  return true
}

function cleanText(text) {
  return text.replace(/\[.*?\]\s*/g, '').replace(/`/g, '').trim().substring(0, 100)
}

function processAgent(dirName, agent) {
  // Si dir es 'none', mostrar offline
  if (agent.dir === 'none') {
    return { ...agent, status: 'offline', task: 'Sin sesiones propias', progress: 0, logs: [] }
  }
  
  // Usar carpeta del agente o la definida
  const sessionDir = agent.dir || dirName
  const dir = join(AGENTS_DIR, sessionDir, 'sessions')
  
  if (!existsSync(dir)) {
    return { ...agent, status: 'offline', task: 'Sin carpeta', progress: 0, logs: [] }
  }
  
  let files = []
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.jsonl'))
  } catch {
    return { ...agent, status: 'error', task: 'Sin acceso', progress: 0, logs: [] }
  }
  
  if (files.length === 0) {
    return { ...agent, status: 'offline', task: 'Sin actividad', progress: 0, logs: [] }
  }
  
  const sortedFiles = files.sort((a, b) => statSync(join(dir, b)).mtime - statSync(join(dir, a)).mtime).slice(0, 2)
  
  const allLines = []
  for (const f of sortedFiles) {
    try {
      const content = readFileSync(join(dir, f), 'utf-8')
      allLines.push(...content.trim().split('\n').reverse())
    } catch {}
  }
  
  const now = Date.now()
  const tenMinsAgo = now - 10 * 60 * 1000
  const today = new Date().toDateString()
  
  const logs = []
  let currentTask = null
  let hasToolCalls = false
  let lastActivity = null
  
  for (const line of allLines) {
    try {
      const entry = JSON.parse(line)
      const entryDate = new Date(entry.timestamp).toDateString()
      const entryTime = new Date(entry.timestamp).getTime()
      
      if (entryDate !== today) continue
      
      lastActivity = entry.timestamp
      
      if (entry.type !== 'message') continue
      
      const msg = entry.message
      if (!msg?.role) continue
      
      const rawText = Array.isArray(msg.content) ? msg.content[0]?.text : msg.content
      if (!rawText || rawText.length < 10) continue
      
      const text = cleanText(rawText)
      if (!isUsefulLog(text)) continue
      
      const time = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
      
      logs.push({ type: msg.role, text, time })
      
      if (msg.role === 'user' && entryTime > tenMinsAgo) {
        currentTask = text
      }
      
      if (msg.role === 'assistant' && Array.isArray(msg.content)) {
        if (msg.content.some(c => c.type === 'toolCall')) {
          hasToolCalls = true
        }
      }
    } catch {}
  }
  
  if (!currentTask && logs.some(l => l.type === 'user')) {
    const lastUser = logs.filter(l => l.type === 'user').pop()
    if (lastUser) currentTask = lastUser.text
  }
  
  const status = hasToolCalls ? 'running' : (logs.length > 0 ? 'active' : 'idle')
  const progress = hasToolCalls ? Math.min(80, 40 + Math.floor(Math.random() * 30)) : (logs.length > 0 ? 100 : 0)
  
  return {
    ...agent,
    status,
    task: currentTask || 'Esperando órdenes...',
    progress,
    started: logs[0]?.time || null,
    logs: logs.slice(0, 15),
    lastActivity
  }
}

const data = {}
for (const [dirName, agent] of Object.entries(agents)) {
  data[agent.id] = processAgent(dirName, agent)
}

writeFileSync(join(OUTPUT_DIR, 'agent-status.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  agents: data
}, null, 2))

console.log('✅ Logs actualizados')
