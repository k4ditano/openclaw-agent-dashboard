# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agents Dashboard is a real-time monitoring dashboard for OpenClaw agents. It displays agent status, communications, and metrics via a React frontend with live updates through WebSocket and Server-Sent Events.

This is a **read-only monitoring tool** - it cannot execute or control agents.

## Tech Stack

- **Frontend**: React 18.2, Vite 5.0, Tailwind CSS 3.4, Framer Motion
- **Backend**: Express 5.2, Node.js
- **Real-time**: WebSocket, Server-Sent Events (SSE)
- **Auth**: JWT (jsonwebtoken)
- **Testing**: Vitest with jsdom
- **Deployment**: Docker, docker-compose, Nginx

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (frontend on port 3000, proxies API to localhost:3001)
npm run dev

# Run API server manually (start separately from dev server)
node server.mjs

# Build frontend for production
npm run build

# Run tests
npm test           # Watch mode
npm run test:run   # Single run

# Docker deployment
docker compose up -d --build
```

## Architecture

### Data Flow

1. Backend (`server.mjs`) reads session files from `/home/ubuntu/.openclaw/agents/{folder}/sessions`
2. Provides REST API endpoints for metrics, authentication, GitHub integration
3. Real-time updates via WebSocket (`/ws`) and SSE (`/api/events`)
4. Frontend (`src/App.jsx`) polls/connects to API and displays dashboard

### Key Files

| File | Purpose |
|------|---------|
| `server.mjs` | Express API, WebSocket, SSE, auth middleware |
| `tools.mjs` | Session reading utilities, agent configuration |
| `github-client.mjs` | GitHub API integration for PRs/issues |
| `src/App.jsx` | Main React dashboard component |

### Agent Configuration

Agents are configured in multiple places:
- `server.mjs` (~line 120): `agentsList` array
- `tools.mjs` (~line 12): `AGENTS` object
- `src/App.jsx`: `agents` array

Sessions are stored at `/home/ubuntu/.openclaw/agents/{folder}/sessions/*.jsonl`

## Environment Variables

Required in `.env`:
- `JWT_SECRET` - Secret for JWT tokens
- `DASHBOARD_USERNAME` - Login username
- `DASHBOARD_PASSWORD` - Login password
- `GITHUB_TOKEN` - Optional, for GitHub integration

## API Authentication

Most endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

Login at `POST /api/auth/login` to receive token.

## Testing

Tests are located in `src/test/` and use Vitest with jsdom environment. Setup file is at `src/test/setup.js`.
