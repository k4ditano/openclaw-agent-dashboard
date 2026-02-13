/**
 * Monitor de agentes - solo mensajes útiles y recientes
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const AGENTS_DIR = '/home/ubuntu/.openclaw/agents'
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public'

const agents = {
  'main': { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899' },
  'coder': { id: 'coder', name: 'er Codi', emoji: '🤖', color: '#8b5cf6' },
  'netops': { id: 'netops', name: 'er Serve', emoji: '🌐', color: '#06b6d4' },
  'pr-reviewer': { id: 'pr-reviewer', name: 'er PR', emoji: '🔍', color: '#22c55e' }
}

// Filtrar textos técnicos - solo mensajes leggibles
function isUsefulLog(text) {
  // Ignorar outputs técnicos
  if (text.includes('"text":"') || text.includes('timestamp":"') || text.includes('\\n')) return false
  if (text.includes('Successfully wrote') || text.includes('bytes to')) return false
  if (text.startsWith('{') || text.startsWith('[')) return false
  if (text.includes('module.js') || text.includes('.js:')) return false
  if (text.startsWith('$') && text.length < 50) return false
  if (text.includes('│') || text.includes('━━')) return false
  if (text.includes('(no output)')) return false
  if (text.includes('==') || text.startsWith('---')) return false
  if (text.length < 15) return false
  return true
}

function cleanText(text) {
  // Quitar prefijos de Telegram
  return text
    .replace(/\[.*?\]\s*/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/`/g, '')
    .trim()
    .substring(0, 80)
}

function processAgent(dirName, agent) {
  const dir = join(AGENTS_DIR, dirName, 'sessions')
  
  if (!existsSync(dir)) {
    return { ...agent, status: 'offline', task: 'Sin carpeta', progress: 0, logs: [], lastActivity: null }
  }
  
  let files = []
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.jsonl'))
  } catch {
    return { ...agent, status: 'error', task: 'Sin acceso', progress: 0, logs: [], lastActivity: null }
  }
  
  if (files.length === 0) {
    return { ...agent, status: 'offline', task: 'Sin actividad', progress: 0, logs: [], lastActivity: null }
  }
  
  // Leer los 2 archivos más recientes
  const sortedFiles = files.sort((a, b) => statSync(join(dir, b)).mtime - statSync(join(dir, a)).mtime).slice(0, 2)
  
  const allLines = []
  for (const f of sortedFiles) {
    try {
      const content = readFileSync(join(dir, f), 'utf-8')
      allLines.push(...content.trim().split('\n').reverse())
    } catch {}
  }
  
  const now = Date.now()
  const thirtyMinsAgo = now - 30 * 60 * 1000
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
      
      const rawText = Array.isArray(msg.content) 
        ? msg.content[0]?.text 
        : msg.content
      
      if (!rawText || rawText.length < 10) continue
      
      const text = cleanText(rawText)
      if (!isUsefulLog(text)) continue
      
      const time = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
      
      logs.push({ type: msg.role, text, time })
      
      // Solo tomar tarea de los últimos 30 minutos
      if (msg.role === 'user' && entryTime > thirtyMinsAgo) {
        currentTask = text
      }
      
      if (msg.role === 'assistant' && Array.isArray(msg.content)) {
        if (msg.content.some(c => c.type === 'toolCall')) {
          hasToolCalls = true
        }
      }
    } catch {}
  }
  
  // Si no hay tarea reciente, buscar la última
  if (!currentTask && logs.some(l => l.type === 'user')) {
    const lastUser = logs.filter(l => l.type === 'user').pop()
    if (lastUser) currentTask = lastUser.text
  }
  
  const status = hasToolCalls ? 'running' : (logs.length > 0 ? 'active' : 'idle')
  const progress = hasToolCalls ? Math.min(85, 40 + Math.floor(Math.random() * 35)) : (logs.length > 0 ? 100 : 0)
  
  return {
    ...agent,
    status,
    task: currentTask || 'Esperando órdenes...',
    progress,
    started: logs[0]?.time || null,
    logs: logs.slice(0, 8),
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

console.log('✅ Actualizado')
