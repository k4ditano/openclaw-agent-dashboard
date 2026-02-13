/**
 * Monitor multi-agente en tiempo real
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const AGENTS_DIR = '/home/ubuntu/.openclaw/agents'
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public'

// Mapeo de agentes a carpetas
const agents = [
  { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899', folder: 'coder', desc: 'Sesión principal' },
  { id: 'er-coder', name: 'er Codi', emoji: '🤖', color: '#8b5cf6', folder: 'coder', desc: 'Constructor de código' },
  { id: 'er-serve', name: 'er Serve', emoji: '🌐', color: '#06b6d4', folder: 'netops', desc: 'Servidor y red' },
  { id: 'er-pr', name: 'er PR', emoji: '🔍', color: '#22c55e', folder: 'pr-reviewer', desc: 'Revisor de código' }
]

function isUsefulLog(text) {
  if (text.includes('Command still running') || text.includes('signal SIGTERM')) return false
  if (text.includes('Exec completed') || text.includes('Exec failed')) return false
  if (text.includes('vite v') || text.includes('vite ready')) return false
  if (text.includes('transforming') || text.includes('built in')) return false
  if (text.includes('npm run') || text.includes('Use process')) return false
  if (text.includes('sessionId')) return false
  if (text.includes('Error:') || text.includes('Exception')) return false
  if (text.includes('$$') || text.includes('>>') || text.includes('## ')) return false
  if (text.length < 10) return false
  return true
}

function cleanText(text) {
  return text.replace(/\[.*?\]\s*/g, '').replace(/`/g, '').trim().substring(0, 100)
}

function processAgent(agentInfo) {
  const dir = join(AGENTS_DIR, agentInfo.folder, 'sessions')
  
  if (!existsSync(dir)) {
    return { ...agentInfo, status: 'offline', task: 'Sin carpeta', progress: 0, logs: [] }
  }
  
  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
    if (files.length === 0) {
      return { ...agentInfo, status: 'offline', task: 'Sin actividad', progress: 0, logs: [] }
    }
    
    const sorted = files.sort((a, b) => statSync(join(dir, b)).mtime - statSync(join(dir, a)).mtime)
    const sessionFile = sorted[0]
    const content = readFileSync(join(dir, sessionFile), 'utf-8')
    const lines = content.trim().split('\n').reverse()
    
    const today = new Date().toDateString()
    const now = Date.now()
    const tenMinsAgo = now - 10 * 60 * 1000
    
    const logs = []
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
      ...agentInfo,
      status,
      task: currentTask || 'Esperando órdenes...',
      progress,
      started: logs[0]?.time || null,
      logs: logs.slice(0, 15)
    }
    
  } catch (e) {
    return { ...agentInfo, status: 'error', task: 'Error: ' + e.message, progress: 0, logs: [] }
  }
}

const data = {}
for (const agent of agents) {
  data[agent.id] = processAgent(agent)
}

writeFileSync(join(OUTPUT_DIR, 'agent-status.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  agents: data
}, null, 2))

console.log('✅ Multi-agente actualizado')
