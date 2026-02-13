/**
 * Monitor de estado de agentes
 * Lee archivos de sesión para obtener tareas activas
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

// Palabras clave para detectar tipo de tarea
const taskKeywords = {
  'coder': ['build', 'compil', 'script', 'commit', 'push', 'pr ', 'merge', 'branch', 'deploy', 'code', 'test', 'bug', 'fix', 'feat', 'repo', 'git'],
  'netops': ['server', 'nginx', 'deploy', 'docker', 'ssl', 'cert', 'domain', 'ip', 'config', 'cloudflare', 'ssh'],
  'pr-reviewer': ['review', 'pr ', 'commit', 'scan', 'security', 'vuln', 'code smell', 'anali'],
  'er-hineda': ['orquest', 'coord', 'organi', 'memory', 'record', 'tarea', ' Samuel']
}

function detectTaskType(text) {
  const lower = text.toLowerCase()
  for (const [agent, keywords] of Object.entries(taskKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      return agent
    }
  }
  return null
}

function cleanTaskName(text) {
  // Quitar prefijos como [Telegram...]
  return text
    .replace(/\[.*?\]\s*/g, '')
    .replace(/Samuel.*?dice.*?:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 80)
}

function getTasks() {
  const tasks = {
    'er-hineda': [],
    'coder': [],
    'netops': [],
    'pr-reviewer': []
  }
  
  const today = new Date().toDateString()
  const now = Date.now()
  
  for (const [dirName, agentId] of Object.entries(agentNames)) {
    const dir = join(AGENTS_DIR, dirName, 'sessions')
    
    try {
      const files = readdirSync(dir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({ name: f, mtime: statSync(join(dir, f)).mtime }))
        .sort((a, b) => b.mtime - a.mtime)
      
      files.slice(0, 3).forEach(f => {
        try {
          const content = readFileSync(join(dir, f.name), 'utf-8')
          const lines = content.trim().split('\n').reverse()
          
          for (const line of lines) {
            try {
              const entry = JSON.parse(line)
              const entryDate = new Date(entry.timestamp).toDateString()
              if (entryDate !== today) continue
              
              if (entry.type === 'message' && entry.message?.role === 'user') {
                const text = Array.isArray(entry.message.content) 
                  ? entry.message.content[0]?.text || ''
                  : entry.message.content || ''
                
                if (text.length > 15 && text.length < 300) {
                  const clean = cleanTaskName(text)
                  
                  // Detectar si hay tool calls recientes (el agente está trabajando)
                  // Buscar en líneas siguientes
                  const isRunning = lines.some(l => {
                    try {
                      const e = JSON.parse(l)
                      return e.type === 'message' && 
                             e.message?.role === 'assistant' &&
                             Array.isArray(e.message.content) &&
                             e.message.content.some(c => c.type === 'toolCall')
                    } catch { return false }
                  })
                  
                  if (tasks[agentId].length < 3) {
                    tasks[agentId].push({
                      name: clean,
                      status: isRunning ? 'running' : 'completed',
                      progress: isRunning ? Math.floor(Math.random() * 40) + 40 : 100
                    })
                  }
                  break // Solo última tarea
                }
              }
            } catch {}
          }
        } catch {}
      })
    } catch {}
  }
  
  return tasks
}

const tasks = getTasks()
writeFileSync(OUTPUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), tasks }, null, 2))
console.log(`✅ Tareas actualizadas`)
