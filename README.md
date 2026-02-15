# Agent Dashboard

Real-time dashboard for monitoring OpenClaw agents.

## Features

- **Real-time Monitoring** - Watch agent status, tasks, and progress live
- **Multiple Agents** - Support for separate agents (coder, netops, pr-reviewer, etc.)
- **Visual Status** - Color-coded status indicators with glow effects
- **Session History** - View recent conversation logs per agent

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build
```

## Architecture

```
agents-dashboard/
├── src/App.jsx              # React UI
├── scripts/monitor-comms.mjs  # Node.js status monitor
├── public/agent-status.json   # Generated status file
└── scripts/run-monitor.sh     # Daemon script
```

## Adding a New Agent

1. **monitor-comms.mjs** - Add to `agents` object:
```javascript
'new-agent': { 
  id: 'new-agent', 
  name: 'New Agent', 
  emoji: '🎯', 
  color: '#f59e0b' 
}
```

2. **App.jsx** - Add to `agents` array:
```javascript
{ 
  id: 'new-agent', 
  name: 'New Agent', 
  glowColor: '#f59e0b',
  emoji: '🎯'
}
```

3. **Session folder**: `/home/ubuntu/.openclaw/agents/new-agent/sessions/`

## API

Read `public/agent-status.json`:
```json
{
  "agents": {
    "coder": {
      "status": "running",
      "task": "Current task description",
      "progress": 75,
      "logs": ["line1", "line2"]
    }
  }
}
```

## Tech Stack

- React + Vite
- Tailwind CSS
- Node.js monitoring script

## License

MIT
