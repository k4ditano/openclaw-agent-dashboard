/**
 * Monitor de comunicaciones entre agentes
 * Lee archivos de sesión directamente del filesystem
 * SIN costo de tokens
 * SOLO sesión ACTUAL de hoy
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

const SESSIONS_DIR = '/home/ubuntu/.openclaw/agents/main/sessions'
const CODER_SESSIONS_DIR = '/home/ubuntu/.openclaw/agents/coder/sessions'
const OUTPUT_FILE = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public/communications.json'

function getAgentFromKey(key) {
  if (key.includes('coder')) return 'coder'
  if (key.includes('netops')) return 'netops'
  if (key.includes('pr-reviewer')) return 'pr-reviewer'
  return 'er-hineda'
}

function processDir(dir) {
  const messages = []
  const today = new Date().toDateString()
  
  try {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({ name: f, mtime: statSync(join(dir, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime)
    
    const recentFiles = files.slice(0, 2).map(f => f.name)
    
    recentFiles.forEach(file => {
      try {
        const content = readFileSync(join(dir, file), 'utf-8')
        const lines = content.trim().split('\n')
        
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line)
            const entryDate = new Date(entry.timestamp).toDateString()
            
            if (entryDate !== today) return
            if (entry.type !== 'message') return
            
            const msgContent = entry.message?.content
            if (!Array.isArray(msgContent)) return
            
            msgContent.forEach(c => {
              if (c.type !== 'text' || !c.text || c.text.length < 10) return
              
              const fromAgent = getAgentFromKey(file)
              const text = c.text
              
              let toAgent = null
              if (text.match(/er codi|coder|build|compil|script|commit/gi)) toAgent = 'coder'
              else if (text.match(/er serve|netops|nginx|server|deploy/gi)) toAgent = 'netops'
              else if (text.match(/er pr|pr-reviewer|review|anali|scan/gi)) toAgent = 'pr-reviewer'
              
              if (toAgent) {
                messages.push({
                  from: fromAgent,
                  to: toAgent,
                  content: text.substring(0, 80),
                  time: new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
                })
              }
            })
          } catch (e) {}
        })
      } catch (e) {}
    })
  } catch (e) {
    console.error('Error processing', dir, e.message)
  }
  
  return messages
}

function extractMessages() {
  const allMessages = [
    ...processDir(SESSIONS_DIR),
    ...processDir(CODER_SESSIONS_DIR)
  ]
  
  // Deduplicar
  const unique = []
  const seen = new Set()
  allMessages.forEach(m => {
    const key = `${m.from}-${m.to}-${m.content.substring(0, 30)}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(m)
    }
  })
  
  return unique.slice(0, 10)
}

const msgs = extractMessages()
const output = {
  generatedAt: new Date().toISOString(),
  messages: msgs
}

writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))
console.log(`✅ ${msgs.length} mensajes de hoy`)
