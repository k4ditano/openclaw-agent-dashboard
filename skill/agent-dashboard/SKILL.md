---
name: agent-dashboard
description: Dashboard en Tiempo Real para monitorizar agentes de OpenClaw. Usa cuando: (1) Necesites ver estado de agentes en tiempo real, (2) Añadir nuevos agentes al dashboard, (3) Configurar el monitor de logs, (4) Desplegar el dashboard.
---

# Agent Dashboard

Dashboard de monitoreo en tiempo real para agentes OpenClaw.

## Quick Start

```bash
cd /home/ubuntu/.openclaw/workspace/agents-dashboard

# Desarrollo
npm run dev

# Build producción
npm run build

# Monitor ( daemon )
./scripts/run-monitor.sh
```

## Estructura

```
agents-dashboard/
├── src/App.jsx           # UI React principal
├── scripts/
│   ├── monitor-comms.mjs # Lee sesiones de agentes
│   └── run-monitor.sh    # Daemon continuo
└── public/
    └── agent-status.json # Estado generado
```

## Añadir Nuevo Agente

### 1. Editar `scripts/monitor-comms.mjs`

En objeto `agents`:
```javascript
const agents = {
  'main': { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899' },
  'coder': { id: 'coder', name: 'er Codi', emoji: '🤖', color: '#8b5cf6' },
  // Añadir aquí
  'tu-agente': { id: 'tu-agente', name: 'Tu Agente', emoji: '🎯', color: '#f59e0b' }
}
```

### 2. Editar `src/App.jsx`

En array `agents`:
```javascript
{
  id: 'tu-agente',
  name: 'Tu Agente',
  emoji: '🎯',
  description: 'Descripción',
  color: 'text-amber-500',
  borderColor: 'border-amber-500',
  glowColor: '#f59e0b',
  role: 'Tu Rol'
}
```

### 3. Carpeta de sesiones

```bash
mkdir -p /home/ubuntu/.openclaw/agents/tu-agente/sessions
```

## Colores

| Agent | Hex |
|-------|-----|
| er Hineda | `#ec4899` |
| er Codi | `#8b5cf6` |
| er Serve | `#06b6d4` |
| er PR | `#22c55e` |

## Monitor

El script `monitor-comms.mjs` lee archivos `.jsonl` de sesiones y genera `agent-status.json`.

**Filtro de logs** - Editar función `isUsefulLog()` para mostrar/ocultar mensajes.

## Deploy

```bash
npm run build
# Servir carpeta dist/
```

## API

Estado en `public/agent-status.json`:
```json
{
  "agents": {
    "coder": {
      "status": "running",
      "task": "Tarea actual",
      "progress": 75,
      "logs": [...]
    }
  }
}
```
