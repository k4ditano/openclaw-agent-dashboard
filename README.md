# 🤖 Agent Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
</p>

> Dashboard en tiempo real para monitorizar agentes de OpenClaw. Visualiza estado, tareas y logs de cada agente.

## ✨ Características

- 📊 **Monitoreo en Tiempo Real** - Estado de agentes actualizado cada 3 segundos
- 🎨 **Interfaz Retro-Moderna** - Estilo terminal con efectos CRT
- 🤖 **Soporte Multi-Agente** - er Hineda, er Codi, er Serve, er PR
- 📝 **Logs en Vivo** - Ver conversaciones y actividad de cada agente
- 🔄 **Auto-Refresh** - Sin necesidad de recargar la página

## 🚀 Quick Start

```bash
# Clonar el proyecto
git clone https://github.com/SamuelHinestrosa/agents-dashboard.git
cd agents-dashboard

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 📁 Estructura del Proyecto

```
agents-dashboard/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── index.css        # Estilos + efectos CRT
│   └── main.jsx         # Entry point
├── scripts/
│   ├── monitor-comms.mjs # Monitor de agentes
│   └── run-monitor.sh   # Daemon (ejecutar siempre)
├── public/
│   ├── agent-status.json # Estado generado (auto)
│   └── index.html
├── dist/                # Build de producción
└── package.json
```

## ➕ Añadir Nuevo Agente

### Paso 1: Editar `scripts/monitor-comms.mjs`

```javascript
const agents = {
  'main': { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899' },
  'coder': { id: 'coder', name: 'er Codi', emoji: '🤖', color: '#8b5cf6' },
  // 👇 Añadir nuevo agente
  'tu-agente': { id: 'tu-agente', name: 'Tu Agente', emoji: '🎯', color: '#f59e0b' }
}
```

### Paso 2: Editar `src/App.jsx`

```javascript
{
  id: 'tu-agente',
  name: 'Tu Agente',
  emoji: '🎯',
  description: 'Descripción del agente',
  color: 'text-amber-500',
  borderColor: 'border-amber-500',
  glowColor: '#f59e0b',
  status: 'idle',
  icon: Code,
  skills: ['Skill1', 'Skill2'],
  stats: { completed: 0, active: 0 },
  role: 'Tu Rol'
}
```

### Paso 3: Crear carpeta de sesiones

```bash
mkdir -p /home/ubuntu/.openclaw/agents/tu-agente/sessions
```

## 🎨 Colores Disponibles

| Color | Hex | Nombre |
|-------|-----|--------|
| 🧉 Pink | `#ec4899` | er Hineda |
| 💜 Purple | `#8b5cf6` | er Codi |
| 💙 Cyan | `#06b6d4` | er Serve |
| 💚 Green | `#22c55e` | er PR |
| 💛 Yellow | `#eab308` | Custom |
| ❤️ Red | `#ef4444` | Custom |

## 🖥️ Ver Dashboard

```bash
# Iniciar daemon de monitoreo (opcional, para logs en vivo)
./scripts/run-monitor.sh

# Servir aplicación
npm run dev
```

Acceder a: **http://localhost:3000**

## 📡 API de Estado

El dashboard consume `agent-status.json`:

```json
{
  "generatedAt": "2026-02-13T09:30:00.000Z",
  "agents": {
    "coder": {
      "id": "coder",
      "name": "er Codi",
      "status": "running",
      "task": "Tarea actual...",
      "progress": 75,
      "logs": [...]
    }
  }
}
```

## 🔧 Tech Stack

| Tecnología | Propósito |
|------------|-----------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Estilos |
| Framer Motion | Animaciones |
| Node.js | Monitor de agentes |

## 📝 Licencia

MIT © Samuel Hinestrosa

---

<div align="center">
  <p>Hecho con 🧉 por er Hineda</p>
</div>
