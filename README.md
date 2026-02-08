# 🤖 OpenClaw Agent Dashboard

Real-time monitoring dashboard for OpenClaw AI agents. Watch your agents think, chat, and execute tools in real-time.

![Dashboard Preview](docs/preview.png)

## ✨ Features

- **Real-time Agent Monitoring** - Watch agents in action live
- **Activity Feed** - See messages, reasoning, and tool executions
- **Tool Execution History** - Track what tools each agent uses
- **Agent Statistics** - Messages sent, tools used, conversations
- **WebSocket API** - Connect external agents for monitoring
- **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

```bash
# Install dependencies
cd openclaw-agent-dashboard
npm install

# Start the dashboard
npm start

# Open in browser
# http://localhost:3000
```

## 📡 Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/agents` | List all agents |
| `GET /api/agents/:id` | Get agent details |
| `GET /api/activities` | Recent activity feed |
| `GET /api/tools` | Tool execution history |
| `GET /api/stats` | Dashboard statistics |
| `WS /` | Socket.IO for real-time updates |

## 🔌 WebSocket API

Connect external agents to broadcast activity:

```javascript
// Register an agent
ws.send(JSON.stringify({
  type: 'register_agent',
  name: 'My Agent',
  model: 'GPT-4',
  emoji: '🤖'
}));

// Broadcast activity
ws.send(JSON.stringify({
  type: 'activity',
  agentId: 'agent-uuid',
  activityType: 'message',
  content: 'Thinking about the problem...',
  metadata: { tokens: 1500 }
}));

// Report tool execution
ws.send(JSON.stringify({
  type: 'tool_execution',
  agentId: 'agent-uuid',
  tool: 'read_file',
  args: { path: '/some/file.txt' },
  duration: 234
}));
```

## 🔧 Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | 3000 | HTTP server port |
| `WS_PORT` | 3001 | WebSocket server port |

## 📁 Project Structure

```
openclaw-agent-dashboard/
├── src/
│   └── server.js          # Main server (Express + Socket.IO)
├── public/
│   ├── index.html         # Dashboard UI
│   ├── css/style.css     # Styles
│   └── js/app.js         # Frontend JavaScript
├── package.json
└── README.md
```

## 🎨 UI Components

- **Agents Panel** - Shows all registered agents with their status
- **Activity Feed** - Real-time stream of agent activities
- **Tools Panel** - Recent tool executions with duration
- **Stats Grid** - Overview statistics

## 🔄 Integration with OpenClaw

The dashboard can connect to OpenClaw's session store to monitor real agents. Currently uses in-memory storage for demo purposes.

## 📝 License

MIT License - feel free to use and modify!

---

Built with ❤️ for the OpenClaw ecosystem
