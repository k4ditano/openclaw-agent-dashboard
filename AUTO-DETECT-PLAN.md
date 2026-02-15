# Plan: Detección Automática de Agentes

## Estado Actual

- **Agentes detectados**: `coder`, `main`, `netops`, `planner`, `pr-reviewer` (en `/home/ubuntu/.openclaw/agents/`)
- **Niveles hardcodeados**: `er-hineda`, `er-coder`, `er-plan`, `er-serve`, `er-pr` (en `levels.json`)
- **Configuración del agente**: `/home/ubuntu/.openclaw/workspace/agents/{agent-name}/config.json`

---

## 1. Detección de Carpetas de Agentes

### Ubicación
```
/home/ubuntu/.openclaw/agents/
```

### Algoritmo de Detección
```javascript
// Pseudo-código
const agentsPath = '/home/ubuntu/.openclaw/agents/';
const folders = fs.readdirSync(agentsPath, { withFileTypes: true });
const agents = folders
  .filter(f => f.isDirectory() && !f.name.startsWith('.'))
  .map(f => f.name);
```

### Mapeo agentId → nombre de carpeta
| agentId (levels.json) | Carpeta (detección) | ¿Existe? |
|----------------------|---------------------|----------|
| er-hineda            | -                   | ❌ No existe |
| er-coder             | coder               | ✅ Sí |
| er-plan              | planner             | ✅ Sí |
| er-serve             | -                   | ❌ No existe |
| er-pr                | pr-reviewer        | ✅ Sí |

---

## 2. Obtención de Metadatos (nombre/emoji/color)

### Fuentes de Datos

**Opción A:Desde config.json del workspace**
- Path: `/home/ubuntu/.openclaw/workspace/agents/{carpeta}/config.json`
- Contiene: `name`, `emoji`, `description`, `model`, `skills`

**Opción B:默认值 (fallback)**
Si no existe config.json, usar:
- **name**: nombre de la carpeta capitalizado (ej: `pr-reviewer` → `er PR`)
- **emoji**: `🤖` (default)
- **color**: Basado en hash del nombre o `#6366f1` (indigo default)

### Estructura de Datos del Agente
```typescript
interface AgentMetadata {
  folder: string;           // "pr-reviewer"
  agentId: string;          // "er-pr"
  name: string;             // "er PR"
  emoji: string;           // "🔍"
  description: string;     // "Agente especializado en..."
  hasConfig: boolean;      // ¿existe config.json?
}
```

---

## 3. Cuándo Hacer la Detección

### Timing Opciones

| Momento | Ventajas | Desventajas |
|---------|----------|-------------|
| **Al iniciar servidor** | Sincronización inicial garantizada | Retrasa startup |
| **Bajo demanda (API)** | Control total, flexible | Requiere llamada explícita |
| **Periódico (cron)** | Mantiene sync sin intervención | Puede perder cambios rápidos |

### Recomendación: Híbrido

1. **Al iniciar el servidor** → Detección inicial + sync con levels.json
2. **API endpoint** → `/api/agents/sync` (bajo demanda)
3. **Webhook** → Si se detecta nueva carpeta, recargar

### Endpoints API Propuestos
```
GET  /api/agents              → Lista todos los agentes detectados
GET  /api/agents/:id/metadata → Metadatos de un agente
POST /api/agents/sync        → Forzar sincronización
GET  /api/agents/status      → Estado (detectados vs levels.json)
```

---

## 4. Estructura de Datos Actualizada

### levels.json (Propuesto)
```json
{
  "agents": [
    {
      "agentId": "er-coder",
      "folder": "coder",
      "level": 1,
      "xp": 0,
      "xpToNextLevel": 100,
      "coins": 0,
      "decorations": [],
      "activeDecoration": null,
      "metadata": {
        "name": "er Coder",
        "emoji": "💻",
        "description": "..."
      }
    }
  ],
  "lastSync": "2026-02-15T17:42:00Z",
  "detectedFolders": ["coder", "main", "netops", "planner", "pr-reviewer"],
  "shop": [...]
}
```

### Alternativa: levels.json inmutable + agents.json dinámico

```json
// levels.json (solo XP/level)
{
  "agents": {
    "er-coder": { "level": 1, "xp": 0, "coins": 0 },
    "er-pr": { "level": 2, "xp": 150, "coins": 50 }
  },
  "lastSync": "..."
}
```

```json
// agents.json (metadatos + detección)
{
  "detected": ["coder", "main", "netops", "planner", "pr-reviewer"],
  "mapping": {
    "er-coder": { "folder": "coder", "name": "er Coder", "emoji": "💻" },
    "er-pr": { "folder": "pr-reviewer", "name": "er PR", "emoji": "🔍" }
  }
}
```

---

## 5. Lógica de Sincronización

### Al Detectar un Nuevo Agente
```javascript
function syncAgents() {
  const detected = detectAgentFolders();
  const current = loadLevelsAgents();
  
  // Nuevos agentes → agregar con nivel 1
  for (const folder of detected) {
    const agentId = folderToAgentId(folder);
    if (!current[agentId]) {
      current[agentId] = {
        agentId,
        folder,
        level: 1,
        xp: 0,
        coins: 0
      };
      console.log(`➕ Nuevo agente detectado: ${agentId}`);
    }
  }
  
  // Agentes en levels.json que ya no existen → marcar como archived
  for (const agentId of Object.keys(current)) {
    if (!detected.includes(agentIdToFolder(agentId))) {
      current[agentId].archived = true;
      console.log(`📦 Agente archivado: ${agentId}`);
    }
  }
  
  saveLevels(current);
}
```

### Detección de Carpetas Eliminadas
- **Mantener datos**: El levels.json guarda el historial
- **Archivar**: Flag `archived: true` + `archivedAt: timestamp`
- **No borrar**: Nunca eliminar entradas, solo marcar

---

## 6. Implementación Recomendada

### Paso 1: Crear módulo de detección
```
src/
  lib/
    agent-detector.js    # Lógica de detección
    levels-sync.js       # Sincronización con levels.json
```

### Paso 2: Integrar en server.mjs
- Llamar `agentDetector.sync()` al iniciar
- Exponer endpoints API

### Paso 3: Frontend
- Mostrar estado de sync (detectados vs levels)
- Botón "Sync Now"
- Indicador visual de agentes archiveados

---

## 7. Casos Edge

| Caso | Comportamiento |
|------|----------------|
| Nueva carpeta sin config.json | Usar defaults (emoji: 🤖, name: capitalizado) |
| levels.json tiene agente que no existe como carpeta | Archivar (no borrar) |
| Misma carpeta renombrada | Considerar nuevo agente (o ask) |
| Múltiples carpetas con mismo agentId | Warning + usar primera encontrada |

---

## Resumen

| Item | Valor |
|------|-------|
| **Detección** | `fs.readdir` en `/home/ubuntu/.openclaw/agents/` |
| **Metadatos** | Desde `config.json` del workspace + fallback |
| **Sync** | Al iniciar servidor + endpoint bajo demanda |
| **Archivado** | Flag `archived: true` (nunca borrar) |
| **Archivo** | `AUTO-DETECT-PLAN.md` (este archivo) |
