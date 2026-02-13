/**
 * AGENT METRICS API - Solo métricas de solo lectura
 * 
 * Endpoints seguros:
 * - GET /api/metrics/sessions - Lista sesiones (sin contenido)
 * - GET /api/metrics/agents - Estado de agentes
 * - GET /api/metrics/gateway - Estado del gateway
 * 
 * ⚠️ NADA que permita ejecutar o controlar agentes
 */

import express from 'express'
import { sessions_list, session_status, sessions_history } from './tools.mjs'

const app = express()
app.use(express.json())

// Cache para no saturar el gateway
let metricsCache = {
  sessions: null,
  agents: null,
  gateway: null,
  lastUpdate: 0
}

const CACHE_TTL = 10000 // 10 segundos

// GET /api/metrics/sessions - Solo lista de sesiones (sin mensajes)
app.get('/api/metrics/sessions', async (req, res) => {
  try {
    const now = Date.now()
    if (metricsCache.sessions && (now - metricsCache.lastUpdate) < CACHE_TTL) {
      return res.json(metricsCache.sessions)
    }
    
    const result = await sessions_list({ limit: 20, messageLimit: 0 })
    
    // Solo métricas - sin contenido de mensajes
    const safeSessions = result.sessions.map(s => ({
      key: s.key,
      kind: s.kind,
      channel: s.channel,
      label: s.label || null,
      displayName: s.displayName,
      updatedAt: s.updatedAt,
      sessionId: s.sessionId,
      model: s.model,
      totalTokens: s.totalTokens || 0,
      contextTokens: s.contextTokens || 0,
      systemSent: s.systemSent,
      abortedLastRun: s.abortedLastRun,
      lastChannel: s.lastChannel
    }))
    
    const response = {
      count: result.count,
      sessions: safeSessions,
      fetchedAt: new Date().toISOString()
    }
    
    metricsCache.sessions = response
    metricsCache.lastUpdate = now
    
    res.json(response)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// GET /api/metrics/agents - Estado agregado de agentes
app.get('/api/metrics/agents', async (req, res) => {
  try {
    const result = await sessions_list({ limit: 50, messageLimit: 0 })
    
    // Agrupar por tipo de agente
    const agents = {
      'er-hineda': { sessions: 0, tokens: 0, lastActive: null },
      'coder': { sessions: 0, tokens: 0, lastActive: null },
      'netops': { sessions: 0, tokens: 0, lastActive: null },
      'pr-reviewer': { sessions: 0, tokens: 0, lastActive: null },
      'other': { sessions: 0, tokens: 0, lastActive: null }
    }
    
    result.sessions.forEach(s => {
      let agentType = 'other'
      if (s.key.includes('coder')) agentType = 'coder'
      else if (s.key.includes('netops')) agentType = 'netops'
      else if (s.key.includes('pr-reviewer')) agentType = 'pr-reviewer'
      else if (s.key.includes('main') || s.key.includes('telegram')) agentType = 'er-hineda'
      
      agents[agentType].sessions++
      agents[agentType].tokens += s.totalTokens || 0
      if (!agents[agentType].lastActive || s.updatedAt > agents[agentType].lastActive) {
        agents[agentType].lastActive = s.updatedAt
      }
    })
    
    res.json({
      agents,
      totalSessions: result.count,
      fetchedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    res.status(500).json({ error: 'Failed to fetch agent metrics' })
  }
})

// GET /api/metrics/gateway - Estado del gateway
app.get('/api/metrics/gateway', async (req, res) => {
  try {
    const result = await sessions_list({ limit: 1, messageLimit: 0 })
    
    const response = {
      status: 'online',
      uptime: process.uptime(),
      activeSessions: result.count,
      secure: true,
      readonly: true,
      fetchedAt: new Date().toISOString()
    }
    
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: 'Gateway unavailable' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', readonly: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`📊 Agent Metrics API running on port ${PORT}`)
  console.log('🔒 Modo solo lectura - sin capacidades de ejecución')
})
