/**
 * Monitor de comunicaciones entre agentes
 * Lee archivos de sesión directamente del filesystem
 * SIN costo de tokens
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const SESSIONS_DIR = '/home/ubuntu/.openclaw/agents/main/sessions'
const OUTPUT_FILE = '/home/ubuntu/.openclaw/workspace/agents-dashboard/public/communications.json'

// Mapear nombres de agentes
const agentMap = {
  'coder': 'coder',
  'netops': 'netops', 
  'pr-reviewer': 'pr-reviewer',
  'main': 'er-hineda',
  'pollinations': 'coder',
  'github': 'coder',
  'hineda': 'er-hineda'
}

function getAgentFromKey(key) {
  if (key.includes('coder')) return 'coder'
  if (key.includes('netops')) return 'netops'
  if (key.includes('pr-reviewer')) return 'pr-reviewer'
  return 'er-hineda'
}

function extractMessages() {
  const messages = []
  
  try {
    const files = readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'))
    const recentFiles = files.slice(-10)
    
    recentFiles.forEach(file => {
      try {
        const content = readFileSync(join(SESSIONS_DIR, file), 'utf-8')
        const lines = content.trim().split('\n')
        
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line)
            
            // Mensajes del assistant (respuestas del agente)
            if (entry.type === 'message' && entry.message?.role === 'assistant') {
              const content = entry.message.content
              if (Array.isArray(content)) {
                content.forEach(c => {
                  if (c.type === 'text' && c.text && c.text.length > 10) {
                    const fromAgent = getAgentFromKey(file)
                    
                    // Detectar si menciona a otro agente
                    const text = c.text
                    let toAgent = null
                    
                    if (text.match(/er codi|coder|build|compil/gi)) toAgent = 'coder'
                    else if (text.match(/er serve|netops|nginx|server/gi)) toAgent = 'netops'
                    else if (text.match(/er pr|pr-reviewer|review|anali/gi)) toAgent = 'pr-reviewer'
                    
                    if (toAgent) {
                      messages.push({
                        from: fromAgent,
                        to: toAgent,
                        content: text.substring(0, 80),
                        time: new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false })
                      })
                    }
                  }
                })
              }
            }
          } catch (e) {}
        })
      } catch (e) {}
    })
    
    // Deduplicar
    const unique = []
    const seen = new Set()
    messages.reverse().forEach(m => {
      const key = `${m.from}-${m.to}-${m.content.substring(0, 30)}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(m)
      }
    })
    
    return unique.slice(0, 15)
    
  } catch (e) {
    console.error('Error:', e.message)
    return []
  }
}

const msgs = extractMessages()
const output = {
  generatedAt: new Date().toISOString(),
  messages: msgs
}

writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))
console.log(`✅ ${msgs.length} mensajes guardados`)
