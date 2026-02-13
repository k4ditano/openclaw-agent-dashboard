/**
 * TOOLS.MJS - Acceso a sesiones del Gateway
 * 
 * Funciones de solo lectura para acceder a datos de sesiones.
 * Lee directamente desde los archivos JSONL del sistema.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

const AGENTS_BASE = '/home/ubuntu/.openclaw/agents'

const AGENTS = {
  'main': { name: 'er-hineda', id: 'main' },
  'planner': { name: 'er-plan', id: 'planner' },
  'coder': { name: 'er-coder', id: 'coder' },
  'netops': { name: 'er-serve', id: 'netops' },
  'pr-reviewer': { name: 'er-pr', id: 'pr-reviewer' }
}

/**
 * Lee un archivo JSONL y devuelve las líneas como objetos
 */
function readJsonl(filepath) {
  if (!existsSync(filepath)) return []
  try {
    const content = readFileSync(filepath, 'utf-8')
    return content.trim().split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Obtiene las carpetas de sesiones de un agente
 */
function getSessionFiles(agentId) {
  const agentDir = join(AGENTS_BASE, agentId, 'sessions')
  if (!existsSync(agentDir)) return []
  
  try {
    return readdirSync(agentDir)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted.'))
      .map(f => ({
        name: f,
        path: join(agentDir, f),
        mtime: statSync(join(agentDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime)
  } catch {
    return []
  }
}

/**
 * Lista sesiones de todos los agentes
 */
export async function sessions_list({ limit = 20, messageLimit = 0 }) {
  const sessions = []
  
  for (const [agentId, info] of Object.entries(AGENTS)) {
    const files = getSessionFiles(agentId)
    
    for (const file of files.slice(0, limit / Object.keys(AGENTS).length)) {
      const entries = readJsonl(file.path)
      
      // Buscar primer y último mensaje
      let firstMsg = null
      let lastMsg = null
      let totalTokens = 0
      
      for (const entry of entries) {
        if (entry.type === 'message' && entry.message) {
          const msg = entry.message
          if (!firstMsg && msg.role === 'user') {
            firstMsg = msg.content
          }
          if (msg.role === 'assistant') {
            lastMsg = msg.content
          }
        }
        if (entry.tokens) {
          totalTokens += entry.tokens
        }
      }
      
      sessions.push({
        key: `agent:${agentId}:${file.name.replace('.jsonl', '')}`,
        kind: 'subagent',
        channel: 'internal',
        label: null,
        displayName: info.name,
        updatedAt: new Date(file.mtime).toISOString(),
        sessionId: file.name.replace('.jsonl', ''),
        model: 'minimax/MiniMax-M2.5',
        totalTokens,
        contextTokens: 0,
        systemSent: true,
        abortedLastRun: false,
        lastChannel: 'internal'
      })
    }
  }
  
  return {
    sessions: sessions.slice(0, limit),
    count: sessions.length
  }
}

/**
 * Obtiene el estado de una sesión específica
 */
export async function session_status({ sessionKey }) {
  const parts = sessionKey.split(':')
  if (parts.length < 2) {
    throw new Error('Invalid session key format')
  }
  
  const agentId = parts[1]
  const sessionId = parts[2]
  const sessionFile = join(AGENTS_BASE, agentId, 'sessions', `${sessionId}.jsonl`)
  
  if (!existsSync(sessionFile)) {
    return { status: 'not_found', sessionKey }
  }
  
  const entries = readJsonl(sessionFile)
  const lastEntry = entries[entries.length - 1]
  
  return {
    status: lastEntry ? 'active' : 'idle',
    sessionKey,
    lastActivity: lastEntry?.timestamp || null,
    messageCount: entries.filter(e => e.type === 'message').length
  }
}

/**
 * Obtiene el historial de mensajes de una sesión
 */
export async function sessions_history({ sessionKey, limit = 50 }) {
  const parts = sessionKey.split(':')
  if (parts.length < 2) {
    throw new Error('Invalid session key format')
  }
  
  const agentId = parts[1]
  const sessionId = parts[2]
  const sessionFile = join(AGENTS_BASE, agentId, 'sessions', `${sessionId}.jsonl`)
  
  if (!existsSync(sessionFile)) {
    return { messages: [], sessionKey }
  }
  
  const entries = readJsonl(sessionFile)
  const messages = entries
    .filter(e => e.type === 'message')
    .slice(-limit)
    .map(e => ({
      role: e.message?.role,
      content: e.message?.content,
      timestamp: e.timestamp
    }))
  
  return { messages, sessionKey }
}

/**
 * Obtiene las comunicaciones entre agentes (sesiones padre-hijo)
 */
export async function get_inter_agent_communications({ limit = 20 }) {
  const communications = []
  
  // Buscar en sesiones del agente main las sub-sesiones creadas
  const mainSessions = getSessionFiles('main')
  
  for (const file of mainSessions.slice(0, 20)) {
    const entries = readJsonl(file.path)
    
    // Buscar mensajes que hablen de subagentes
    for (const entry of entries) {
      if (entry.type === 'message' && entry.message) {
        const msg = entry.message
        const content = typeof msg.content === 'string' ? msg.content : msg.content?.[0]?.text || ''
        
        // Detectar creación de subagente
        if (content.includes('subagent:') && msg.role === 'assistant') {
          const subagentMatch = content.match(/subagent:([a-f0-9-]+)/)
          if (subagentMatch) {
            communications.push({
              from: 'er-hineda',
              to: 'subagent',
              subagentId: subagentMatch[1],
              content: content.substring(0, 200),
              timestamp: entry.timestamp,
              type: 'spawn'
            })
          }
        }
      }
    }
  }
  
  return communications.slice(-limit)
}
