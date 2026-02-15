# Agents Dashboard

A real-time dashboard for monitoring OpenClaw agents. View agent status, communications, and metrics in a beautiful React interface with live updates via WebSocket.

## Overview

The Agents Dashboard is a read-only monitoring dashboard that displays:
- Real-time agent status (running, active, idle, offline, error)
- Inter-agent communications and collaborations
- Token metrics (input/output per agent)
- Gateway status and session history
- GitHub integration for issues and pull requests

This is a monitoring-only tool — it cannot execute or control agents.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend  | React 18.2, Vite 5.0, Tailwind CSS 3.4 |
| Backend   | Express 5.2, Node.js |
| Real-time | WebSocket (ws), Server-Sent Events |
| Auth      | JWT (jsonwebtoken) |
| Proxy     | Nginx (Docker) |
| Deploy    | Docker, docker-compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development only)
- Access to `/home/ubuntu/.openclaw/agents` directory (agent session files)

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd /home/ubuntu/.openclaw/workspace/agents-dashboard
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your credentials:**
   ```bash
   nano .env
   ```

4. **Start the dashboard:**
   ```bash
   docker compose up -d
   ```

The dashboard will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GITHUB_TOKEN` | GitHub personal access token for PR/issue features | No | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `DASHBOARD_USERNAME` | Username for dashboard login | Yes | - |
| `DASHBOARD_PASSWORD` | Password for dashboard login | Yes | - |

## Architecture

```
agents-dashboard/
├── src/
│   ├── App.jsx           # Main React application
│   ├── main.jsx          # React entry point
│   ├── index.css         # Tailwind styles
│   └── test/             # Vitest test files
├── server.mjs            # Express API server + WebSocket
├── tools.mjs             # Session reading utilities
├── github-client.mjs     # GitHub API integration
├── proxy-server.cjs      # Dev proxy configuration
├── package.json          # Node dependencies
├── vite.config.js        # Vite build configuration
├── Dockerfile            # Frontend container (Nginx)
├── Dockerfile.api        # API container (Node)
├── docker-compose.yml    # Full stack orchestration
├── nginx.conf            # Nginx configuration
└── dist/                 # Built frontend (generated)
```

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user, returns JWT token |
| GET | `/api/auth/verify` | Verify token is valid |
| POST | `/api/auth/refresh` | Refresh expired token |

**Login Example:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ErHinedaAgents","password":"your-password"}'
```

### Metrics (all require JWT auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics/sessions` | List all agent sessions |
| GET | `/api/metrics/agents` | Aggregated agent metrics |
| GET | `/api/metrics/gateway` | Gateway status |
| GET | `/api/metrics/agent-status` | Full agent status with logs |
| GET | `/api/metrics/activity` | Recent agent activity |
| GET | `/api/metrics/communications-map` | Inter-agent communications |
| GET | `/api/metrics/weekly-heatmap` | Weekly activity heatmap |
| GET | `/api/metrics/load-prediction` | Load prediction data |

### GitHub Integration (all require JWT auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/github/repos` | List accessible repositories |
| GET | `/api/github/repos/:owner/:repo/issues` | List repository issues |
| GET | `/api/github/repos/:owner/:repo/pulls` | List repository pull requests |

### Real-time

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Server-Sent Events stream |
| WS | `/ws` | WebSocket connection (pass token as query param) |

**WebSocket Example:**
```javascript
const ws = new WebSocket('ws://localhost:3001/ws?token=YOUR_JWT_TOKEN');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

## Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Start the backend API
node server.mjs

# In another terminal, start frontend dev server
npm run dev
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

### Building

```bash
# Build frontend for production
npm run build
```

## Deployment

### Docker Compose (Production)

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Resource Limits

| Service | CPU Limit | Memory Limit |
|---------|-----------|--------------|
| frontend | 0.25 | 128MB |
| api | 0.50 | 256MB |

### Health Checks

```bash
# API health
curl http://localhost:3001/health

# Frontend health  
curl http://localhost:3000/health
```

## Adding New Agents

To add a new agent to the dashboard, modify three files:

1. **server.mjs** - Add to `agentsList` array (~line 230)
2. **tools.mjs** - Add to `AGENTS` object (~line 12)
3. **App.jsx** - Add to `agents` array

Then create the sessions folder:
```bash
mkdir -p /home/ubuntu/.openclaw/agents/your-folder/sessions
```

## Troubleshooting

- **"Token requerido"**: Re-login to get a fresh JWT token
- **Agents offline**: Check `/home/ubuntu/.openclaw/agents/{folder}/sessions` exists with `.jsonl` files
- **WebSocket fails**: Verify port 3001 is accessible; SSE fallback works automatically

## License

MIT
