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
├── src/App.jsx           # UI React principal - configuración de agentes
├── scripts/
│   ├── monitor-comms.mjs # Lee sesiones de agentes
│   └── run-monitor.sh    # Daemon continuo
└── public/
    └── agent-status.json # Estado generado (auto-actualizado)
```

## Añadir Nuevo Agente (para otros agentes)

Los agentes de OpenClaw pueden crear nuevos agentes para el dashboard automáticamente. 

### Opción 1: Automático (desde otro agente)

Desde cualquier agente, puedes ejecutar:

```bash
# El agente crea su carpeta de sesiones
mkdir -p /home/ubuntu/.openclaw/agents/tu-nuevo-agente/sessions

# Luego edita los archivos de configuración del dashboard (ver abajo)
```

### Opción 2: Manual

Para que un agente aparezca en el dashboard, hay que configurarlo en 3 lugares:

### 1. Editar `scripts/monitor-comms.mjs`

En el array `agents`, añadir un nuevo objeto:

```javascript
const agents = [
  { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899', folder: 'main', desc: 'Orquestador principal' },
  { id: 'er-plan', name: 'er Plan', emoji: '📐', color: '#f59e0b', folder: 'planner', desc: 'Arquitecto y diseñador' },
  { id: 'er-coder', name: 'er Coder', emoji: '🤖', color: '#8b5cf6', folder: 'coder', desc: 'Especialista en código' },
  { id: 'er-serve', name: 'er Serve', emoji: '🌐', color: '#06b6d4', folder: 'netops', desc: 'Especialista en redes' },
  { id: 'er-pr', name: 'er PR', emoji: '🔍', color: '#22c55e', folder: 'pr-reviewer', desc: 'Revisor de PRs' },
  // === AÑADIR AQUÍ ===
  { id: 'tu-agente', name: 'Tu Agente', emoji: '🎯', color: '#f59e0b', folder: 'tu-agente', desc: 'Descripción breve' }
]
```

**Parámetros:**
- `id`: Identificador único del agente (usado en el código)
- `name`: Nombre para mostrar en el dashboard
- `emoji`: Emoji representativo
- `color`: Color hexadecimal para bordes y glow
- `folder`: Nombre de la carpeta en `/home/ubuntu/.openclaw/agents/{folder}/sessions/`
- `desc`: Descripción breve

### 2. Editar `src/App.jsx`

En el array `agents` (línea ~331), añadir:

```javascript
const agents = [
  {
    id: 'tu-agente',
    name: 'Tu Agente',
    emoji: '🎯',
    description: 'Descripción que aparece en la tarjeta',
    color: 'text-amber-500',        // Clase Tailwind para texto
    borderColor: 'border-amber-500', // Clase para borde
    glowColor: '#f59e0b',           // Color hex para efecto glow
    role: 'Tu Rol'                  // Rol del agente
  },
  // ... más agentes
]
```

### 3. Crear carpeta de sesiones

```bash
mkdir -p /home/ubuntu/.openclaw/agents/tu-agente/sessions
```

El monitor leerá automáticamente los archivos `.jsonl` de esta carpeta.

### 4. (Opcional) Actualizar mapeo de folders

Si el `folder` es diferente del `id`, actualizar el mapa en `monitor-comms.mjs`:

```javascript
const folderToAgentId = {
  'main': 'er-hineda',
  'planner': 'er-plan',
  // ...existing mappings...
  'tu-agente': 'tu-agente'  // Si folder != id
}
```

## Colores Disponibles

| Agent | Hex | Clase Tailwind |
|-------|-----|----------------|
| er Hineda | `#ec4899` | `text-retro-pink` |
| er Coder | `#8b5cf6` | `text-retro-purple` |
| er Plan | `#f59e0b` | `text-retro-yellow` |
| er Serve | `#06b6d4` | `text-retro-cyan` |
| er PR | `#22c55e` | `text-retro-green` |

Puedes usar colores arbitrary: `text-[#tu-color]` o definir nuevos en `tailwind.config.js`.

## Cómo Funciona el Monitor

1. `monitor-comms.mjs` escanea carpetas de sesiones
2. Lee archivos `.jsonl` de `/home/ubuntu/.openclaw/agents/{folder}/sessions/`
3. Filtra logs (elimina ruido de herramientas)
4. Genera `agent-status.json` con:
   - Estado del agente (`running`, `active`, `idle`, `offline`)
   - Tarea actual
   - Logs filtrados
   - Comunicaciones entre agentes
   - Métricas de tokens

## Filtrar Logs

Editar función `isNoise()` en `monitor-comms.mjs` para agregar/eliminar palabras clave que se filtran.

## Deploy

```bash
npm run build
# Servir carpeta dist/ con cualquier servidor estático
```

## API de Estado

```json
{
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "agents": {
    "coder": {
      "id": "coder",
      "name": "er Coder",
      "status": "running",
      "task": "Implementando feature X",
      "progress": 75,
      "logs": [{ "type": "user", "text": "...", "time": "14:30" }],
      "tokens": { "input": 1000, "output": 2500, "total": 3500 }
    }
  },
  "metrics": {
    "tokens": { "input": 5000, "output": 12000, "total": 17000 },
    "activeAgents": 3,
    "idleAgents": 1,
    "offlineAgents": 1
  }
}
```
