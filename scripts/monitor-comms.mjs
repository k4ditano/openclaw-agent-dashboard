/**
 * Monitor completo de agentes
 * Genera: tareas, logs, estado, comunicaciones
 * Estilo terminal/logs
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

const AGENTS_DIR = '/home/ubuntu/.openclaw/agents'
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public'

const agents = {
  'main': { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899' },
  'coder': { id: 'coder', name: 'er Codi', emoji: '🤖', color: '#8b5cf6' },
  'netops': { id: 'netops', name: 'er Serve', emoji: '🌐', color: '#06b6d4' },
  'pr-reviewer': { id: 'pr-reviewer', name: 'er PR', emoji: '🔍', color: '#22c55e' }
}

function getAgentData() {
  const today = new Date().toDateString()
  const result = {}
  
  for (const [dirName, agent] of Object.entries(agents)) {
    const dir = join(AGENTS_DIR, dirName, 'sessions')
    const taskData = { name: '', status: 'idle', progress: 0, started: null }
    const logs = []
    let lastActivity = null
    
    try {
      const files = readdirSync(dir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({ name: f, mtime: statSync(join(dir, f)).mtime }))
        .sort((a, b) => b.mtime - a.mtime)
      
      if (files.length === 0) {
        result[agent.id] = {
          ...agent,
          status: 'offline',
          task: 'Sin sesiones',
          progress: 0,
          logs: ['Agente sin actividad'],
          lastActivity: null
        }
        continue
      }
      
      // Procesar archivos recientes
      const lines = []
      files.slice(0, 3).forEach(f => {
        try {
          const content = readFileSync(join(dir, f.name), 'utf-8')
          lines.push(...content.trim().split('\n').reverse())
        } catch {}
      })
      
      let hasToolCalls = false
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line)
          const entryDate = new Date(entry.timestamp).toDateString()
          
          if (entryDate !== today) continue
          lastActivity = entry.timestamp
          
          if (entry.type === 'message') {
            const msg = entry.message
            
            // Logs de la conversación
            if (msg?.role === 'user') {
              const text = Array.isArray(msg.content) ? msg.content[0]?.text : msg.content
              if (text && text.length > 15) {
                logs.push({ type: 'user', text: text.substring(0, 80), time: new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false }) })
              }
            } else if (msg?.role === 'assistant') {
              const text = Array.isArray(msg.content) ? msg.content[0]?.text : msg.content
              if (text && text.length > 10) {
                logs.push({ type: 'agent', text: text.substring(0, 100), time: new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false }) })
              }
              
              // Detectar si está trabajando
              if (Array.isArray(msg.content) && msg.content.some(c => c.type === 'toolCall')) {
                hasToolCalls = true
              }
            }
          }
        } catch {}
      }
      
      // Última tarea del usuario
      const userLog = logs.find(l => l.type === 'user')
      
      if (userLog) {
        taskData.name = userLog.text
        taskData.started = userLog.time
        taskData.status = hasToolCalls ? 'running' : 'completed'
        taskData.progress = hasToolCalls ? Math.min(95, 30 + Math.floor(Math.random() * 50)) : 100
      }
      
      result[agent.id] = {
        ...agent,
        status: hasToolCalls ? 'running' : (logs.length > 0 ? 'active' : 'idle'),
        task: taskData.name || 'Esperando órdenes...',
        progress: taskData.progress,
        started: taskData.started,
        logs: logs.slice(-8), // Últimos 8 logs
        lastActivity
      }
      
    } catch (e) {
      result[agent.id] = { ...agent, status: 'error', task: 'Error leyendo sesión', logs: [e.message], lastActivity: null }
    }
  }
  
  return result
}

// Generar
const data = getAgentData()

writeFileSync(join(OUTPUT_DIR, 'agent-status.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  agents: data
}, null, 2))

console.log('✅ Estado de agentes actualizado')
