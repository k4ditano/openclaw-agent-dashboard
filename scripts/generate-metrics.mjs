/**
 * GENERADOR DE MÉTRICAS
 * 
 * Genera un archivo JSON con métricas de solo lectura
 * que el dashboard puede consumir sin riesgo.
 * 
 * Solo expone: conteos, tokens, estados, timestamps
 * ❌ Sin contenido de mensajes
 * ❌ Sin capacidad de ejecución
 */

import { sessions_list } from './tools.mjs'
import { writeFileSync } from 'fs'

async function generateMetrics() {
  try {
    console.log('📊 Generando métricas...')
    
    const result = await sessions_list({ limit: 50, messageLimit: 0 })
    
    // Métricas seguras - solo datos agregados
    const metrics = {
      generatedAt: new Date().toISOString(),
      gateway: {
        status: 'online',
        readonly: true,
        secure: true
      },
      sessions: {
        total: result.count,
        byChannel: {},
        byKind: {},
        totalTokens: 0
      },
      agents: {
        'er-hineda': { sessions: 0, tokens: 0, lastActivity: null },
        'coder': { sessions: 0, tokens: 0, lastActivity: null },
        'netops': { sessions: 0, tokens: 0, lastActivity: null },
        'pr-reviewer': { sessions: 0, tokens: 0, lastActivity: null },
        'other': { sessions: 0, tokens: 0, lastActivity: null }
      }
    }
    
    // Procesar sesiones
    result.sessions.forEach(s => {
      // Por canal
      metrics.sessions.byChannel[s.channel] = (metrics.sessions.byChannel[s.channel] || 0) + 1
      
      // Por tipo
      metrics.sessions.byKind[s.kind] = (metrics.sessions.byKind[s.kind] || 0) + 1
      
      // Tokens
      metrics.sessions.totalTokens += s.totalTokens || 0
      
      // Por agente
      let agentType = 'other'
      if (s.key.includes('coder')) agentType = 'coder'
      else if (s.key.includes('netops')) agentType = 'netops'
      else if (s.key.includes('pr-reviewer')) agentType = 'pr-reviewer'
      else if (s.key.includes('main') || s.key.includes('telegram')) agentType = 'er-hineda'
      
      metrics.agents[agentType].sessions++
      metrics.agents[agentType].tokens += s.totalTokens || 0
      if (s.updatedAt > (metrics.agents[agentType].lastActivity || 0)) {
        metrics.agents[agentType].lastActivity = s.updatedAt
      }
    })
    
    // Guardar a archivo
    writeFileSync(
      './public/metrics.json',
      JSON.stringify(metrics, null, 2)
    )
    
    console.log(`✅ Métricas actualizadas: ${result.count} sesiones, ${metrics.sessions.totalTokens} tokens`)
    return metrics
    
  } catch (error) {
    console.error('❌ Error generando métricas:', error)
  }
}

generateMetrics()
