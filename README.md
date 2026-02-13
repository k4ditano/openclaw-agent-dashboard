# Agent Dashboard - Documentación

Dashboard en tiempo real para monitorizar agentes de OpenClaw.

## Estructura

```
agents-dashboard/
├── src/
│   ├── App.jsx          # Componente principal React
│   ├── index.css        # Estilos (Tailwind + custom)
│   └── main.jsx         # Entry point
├── scripts/
│   ├── monitor-comms.mjs # Monitor de agentes (lee sesiones)
│   └── run-monitor.sh   # Daemon para ejecución continua
├── public/
│   ├── agent-status.json    # Estado de agentes (generado)
│   └── index.html          # Entry HTML
├── dist/                   # Build de producción
└── package.json
```

## Quick Start

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
```

## Añadir/Quitar Agentes

### 1. Editar `scripts/monitor-comms.mjs`

En la sección `agents`, añadir o quitar:

```javascript
const agents = {
  'main': { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899' },
  'coder': { id: 'coder', name: 'er Codi', emoji: '🤖', color: '#8b5cf6' },
  'TU_NUEVO_AGENTE': { id: 'tu-agente', name: 'Tu Agente', emoji: '🤖', color: '#colorhex' }
}
```

### 2. Editar `src/App.jsx`

En el array `agents`, añadir definición:

```javascript
{
  id: 'tu-agente',
  name: 'Tu Agente',
  emoji: '🤖',
  description: 'Descripción',
  color: 'text-tu-color',
  borderColor: 'border-tu-color',
  glowColor: '#colorhex',
  status: 'idle',
  icon: Code,
  skills: ['Skill1', 'Skill2'],
  stats: { completed: 0, active: 0 },
  role: 'Tu Rol'
}
```

### 3. Carpetas de sesión

Cada agente necesita una carpeta en `/home/ubuntu/.openclaw/agents/`:

```
/home/ubuntu/.openclaw/agents/
├── main/sessions/      # er Hineda
├── coder/sessions/    # er Codi
├── tu-agente/sessions/ # TU NUEVO AGENTE
└── ...
```

**Nota:** Si el agente no tiene carpeta, aparecerá como "offline".

## Monitor de Agentes

El script `monitor-comms.mjs` lee los archivos `.jsonl` de sesiones y genera `agent-status.json`.

### Ejecución

```bash
# Manual
node scripts/monitor-comms.mjs

# Daemon (recomendado)
./scripts/run-monitor.sh
```

### Filtros

En `isUsefulLog()` puedes ajustar qué mensajes se muestran:

```javascript
function isUsefulLog(text) {
  if (text.includes('loquesea')) return false  // Ignorar
  return true  // Mostrar
}
```

## Variables de Entorno

No se necesitan variables de entorno - todo es local.

## Deployment

```bash
# Build
npm run build

# Servir (ejemplo con Python)
python3 -m http.server 3000 --directory dist
```

O desplegar la carpeta `dist` en cualquier hosting estático (Vercel, Netlify, etc).

## Colores Disponibles

- Pink: `#ec4899`
- Purple: `#8b5cf6`
- Cyan: `#06b6d4`
- Green: `#22c55e`
- Yellow: `#eab308`
- Red: `#ef4444`
