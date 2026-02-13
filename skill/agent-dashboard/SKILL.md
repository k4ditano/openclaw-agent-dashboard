---
name: agent-dashboard
description: Dashboard en tiempo real para monitorizar agentes de OpenClaw. Usa para: (1) Ver estado de agentes, (2) Añadir nuevos agentes, (3) Configurar el monitor, (4) Desplegar el dashboard.
---

# Agent Dashboard

Dashboard con monitoreo en tiempo real de agentes OpenClaw.

## Estructura

```
agents-dashboard/
├── src/App.jsx              # UI React - define agentes visuales
├── scripts/monitor-comms.mjs # Monitor - lee sesiones de agentes
├── public/agent-status.json  # Estado generado (auto-actualizado)
└── scripts/run-monitor.sh    # Daemon para ejecutar monitor
```

## Cómo Añadir un Agente al Dashboard

Para que un nuevo agente aparezca en el dashboard, necesitas configurarlo en **3 lugares**:

### 1. Editar `scripts/monitor-comms.mjs`

Añade el agente al array `agents`:

```javascript
const agents = [
  { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899', folder: 'main', desc: 'Orquestador principal' },
  { id: 'er-coder', name: 'er Coder', emoji: '🤖', color: '#8b5cf6', folder: 'coder', desc: 'Especialista en código' },
  // AÑADIR TU AGENTE AQUÍ:
  { id: 'tu-agente', name: 'Tu Agente', emoji: '🎯', color: '#f59e0b', folder: 'tu-agente', desc: 'Tu descripción' }
]
```

**Campos requeridos:**
| Campo | Descripción |
|-------|-------------|
| `id` | Identificador único del agente |
| `name` | Nombre para mostrar |
| `emoji` | Emoji representativo |
| `color` | Color hexadecimal (ej: `#f59e0b`) |
| `folder` | Carpeta en `/home/ubuntu/.openclaw/agents/{folder}/sessions/` |
| `desc` | Descripción breve del rol |

### 2. Editar `src/App.jsx`

Añade el agente al array `agents` (aprox. línea 331):

```javascript
const agents = [
  {
    id: 'tu-agente',
    name: 'Tu Agente',
    emoji: '🎯',
    description: 'Descripción visible en la tarjeta',
    color: 'text-amber-500',         // Clase Tailwind
    borderColor: 'border-amber-500', // Clase para borde
    glowColor: '#f59e0b',            // Color hex para glow
    role: 'Tu Rol'
  }
]
```

### 3. Crear Carpeta de Sesiones

```bash
mkdir -p /home/ubuntu/.openclaw/agents/tu-agente/sessions
```

El monitor leerá los archivos `.jsonl` de esta carpeta para mostrar el estado del agente.

### 4. (Opcional) Mapeo de Folder

Si `folder` es diferente de `id`, añade al mapa `folderToAgentId`:

```javascript
const folderToAgentId = {
  'main': 'er-hineda',
  'tu-folder': 'tu-agente'  // Si folder != id
}
```

## Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Monitor (daemon)
./scripts/run-monitor.sh
```

## Colores Disponibles

| Agent | Hex | Tailwind |
|-------|-----|----------|
| er Hineda | `#ec4899` | `text-retro-pink` |
| er Coder | `#8b5cf6` | `text-retro-purple` |
| er Plan | `#f59e0b` | `text-retro-yellow` |
| er Serve | `#06b6d4` | `text-retro-cyan` |
| er PR | `#22c55e` | `text-retro-green` |

Para nuevos colores, usa `text-[#hex]` o define en `tailwind.config.js`.

## Estado API

Lee `public/agent-status.json`:

```json
{
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "agents": {
    "coder": {
      "status": "running",
      "task": "Implementando feature X",
      "progress": 75,
      "logs": [{ "type": "user", "text": "...", "time": "14:30" }],
      "tokens": { "input": 1000, "output": 2500, "total": 3500 }
    }
  },
  "metrics": {
    "activeAgents": 3,
    "idleAgents": 1,
    "offlineAgents": 1
  }
}
```

## Filtrado de Logs

El monitor filtra automáticamente el ruido (output de herramientas, errores comunes, etc.). Para personalizar, edita `isNoise()` en `monitor-comms.mjs`.
