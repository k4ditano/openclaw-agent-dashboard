/**
 * Monitor de estado de agentes
 * Lee archivos de sesión para obtener tareas activas
 * SIN costo de tokens
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

const AGENTS_DIR = '/home/ubuntu/.openclaw/agents'
const OUTPUT_FILE = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public/tasks.json'

const agentNames = {
  'main': 'er-hineda',
  'coder': 'coder',
  'netops': 'netops',
  'pr-reviewer': 'pr-reviewer'
}

function getTasks() {
  const tasks = {
    'er-hineda': [],
    'coder': [],
    'netops': [],
    'pr-reviewer': []
  }
  
  const today = new Date().toDateString()
  
  // Procesar cada carpeta de agente
  for (const [dirName, agentId] of Object.entries(agentNames)) {
    const dir = join(AGENTS_DIR, dirName, 'sessions')
    
    try {
      const files = readdirSync(dir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({ name: f, mtime: statSync(join(dir, f)).mtime }))
        .sort((a, b) => b.mtime - a.mtime)
      
      // Leer los 2 archivos más recientes
      files.slice(0, 2).forEach(f => {
        try {
          const content = readFileSync(join(dir, f.name), 'utf-8')
          const lines = content.trim().split('\n').reverse()
          
          // Buscar tareas en los últimos mensajes
          let lastUserMsg = null
          
          for (const line of lines) {
            try {
              const entry = JSON.parse(line)
              const entryDate = new Date(entry.timestamp).toDateString()
              if (entryDate !== today) continue
              
              if (entry.type === 'message') {
                const msg = entry.message
                
                if (msg?.role === 'user') {
                  // Mensaje del usuario - posible tarea
                  const text = Array.isArray(msg.content) 
                    ? msg.content[0]?.text 
                    : msg.content
                  if (text && text.length > 10 && text.length < 200) {
                    lastUserMsg = text.substring(0, 100)
                  }
                } else if (msg?.role === 'assistant') {
                  // Respuesta del agente - indicar que está trabajando
                  if (lastUserMsg && tasks[agentId].length < 3) {
                    // Buscar si hay tool calls (el agente está trabajando)
                    const hasTool = Array.isArray(msg.content) && 
                      msg.content.some(c => c.type === 'toolCall')
                    
                    tasks[agentId].push({
                      name: lastUserMsg,
                      status: hasTool ? 'running' : 'completed',
                      progress: hasTool ? Math.floor(Math.random() * 60) + 20 : 100
                    })
                    lastUserMsg = null
                  }
                }
              }
            } catch (e) {}
          }
        } catch (e) {}
      })
    } catch (e) {}
  }
  
  return tasks
}

const tasks = getTasks()
const output = {
  generatedAt: new Date().toISOString(),
  tasks
}

writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))

// Contar tareas
const total = Object.values(tasks).flat().length
console.log(`✅ ${total} tareas`)
