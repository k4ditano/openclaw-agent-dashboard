# Agent Dashboard Controller

Skill para gestionar el dashboard de agentes de OpenClaw.

## Descripción

Controla y configura el dashboard de monitorización de agentes en tiempo real.

## Comandos

### Estado del Dashboard

```bash
# Ver estado actual
curl http://localhost:3000/agent-status.json

# Ver logs del monitor
tail -f /tmp/monitor-daemon.log
```

### Añadir Nuevo Agente

1. Editar `scripts/monitor-comms.mjs` - añadir entrada en `agents`
2. Editar `src/App.jsx` - añadir en array `agents`
3. Reiniciar el monitor

### Ver Dashboard

```bash
npm run dev
# Acceder a http://localhost:3000
```

## Ubicaciones

- Dashboard: `/home/ubuntu/.openclaw/workspace/agents-dashboard/`
- Monitor: `scripts/monitor-comms.mjs`
- Estado: `public/agent-status.json`
- Logs: `/tmp/monitor-daemon.log`

## Dependencias

- Node.js 18+
- React 18
- Vite 5
- Tailwind CSS 3
