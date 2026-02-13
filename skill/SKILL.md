---
name: agent-dashboard
description: Dashboard en tiempo real para monitorizar agentes de OpenClaw. Usa para: (1) Ver estado de agentes, (2) Añadir nuevos agentes, (3) Configurar el monitor, (4) Desplegar el dashboard.
---

# Agent Dashboard

Dashboard con monitoreo en tiempo real de agentes OpenClaw.

## Estructura

```
agents-dashboard/
├── src/App.jsx              # UI React
├── scripts/monitor-comms.mjs  # Monitor Node.js
├── public/agent-status.json   # Estado (generado)
└── scripts/run-monitor.sh      # Daemon
```

## Añadir Agente

1. **monitor-comms.mjs** - añadir en objeto `agents`:
```javascript
'tu-agente': { id: 'tu-agente', name: 'Tu Agente', emoji: '🎯', color: '#f59e0b' }
```

2. **App.jsx** - añadir en array `agents`:
```javascript
{ id: 'tu-agente', name: 'Tu Agente', glowColor: '#f59e0b', ... }
```

3. **Carpeta sesiones**: `/home/ubuntu/.openclaw/agents/tu-agente/sessions/`

## Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Monitor (daemon)
./scripts/run-monitor.sh
```

## Estado API

Lee `public/agent-status.json` con estructura:
```json
{
  "agents": {
    "coder": { "status": "running", "task": "...", "progress": 75, "logs": [...] }
  }
}
```
