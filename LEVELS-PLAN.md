# Plan de Implementación: Sistema de Niveles para Agentes

## 1. Arquitectura del Sistema

### Visión General
El sistema de niveles añade una capa de gamificación al dashboard de agentes, donde cada agente puede:
- Subir de nivel (empezando desde nivel 1)
- Ganar monedas al subir de nivel
- Personalizar su apariencia con decoraciones
- Ver animaciones al subir de nivel

### Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ AgentCard   │  │ LevelBadge  │  │ LevelUpAnimation    │  │
│  │ +level      │  │ +coins      │  │ (Framer Motion)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LevelsContext (React Context)           │    │
│  │  - currentLevel, coins, decorations                  │    │
│  │  - addCoins(), unlockDecoration(), checkLevelUp()   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ /api/levels │  │ /api/coins  │  │ /api/decorations    │  │
│  │ (GET/PUT)   │  │ (GET/POST)  │  │ (GET/POST/DELETE)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              levels.json (File Storage)              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Inicialización**: Al cargar el dashboard, se fetch los datos de niveles desde `/api/levels`
2. **Ganar XP**: Los eventos de tareas completadas/envíos generan XP automáticamente
3. **Subir de nivel**: Cuando XP >= umbral, se dispara animación y se dan monedas
4. **Gastar monedas**: Las decoraciones cuestan monedas

---

## 2. Estructura de Datos (JSON)

### Archivo: `data/levels.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-15T17:30:00Z",
  "agents": {
    "er-hineda": {
      "level": 5,
      "currentXp": 450,
      "xpToNextLevel": 1000,
      "totalXp": 3200,
      "coins": 150,
      "decorations": ["gold-border", "glow-blue"],
      "activeDecoration": "gold-border",
      "customAnimations": ["celebrate", "pulse"],
      "levelUpHistory": [
        { "from": 4, "to": 5, "timestamp": "2026-02-15T12:30:00Z", "coinsAwarded": 50 }
      ]
    },
    "er-coder": {
      "level": 3,
      "currentXp": 200,
      "xpToNextLevel": 500,
      "totalXp": 800,
      "coins": 75,
      "decorations": [],
      "activeDecoration": null,
      "customAnimations": [],
      "levelUpHistory": []
    },
    "er-plan": {
      "level": 1,
      "currentXp": 0,
      "xpToNextLevel": 100,
      "totalXp": 0,
      "coins": 0,
      "decorations": [],
      "activeDecoration": null,
      "customAnimations": [],
      "levelUpHistory": []
    },
    "er-serve": {
      "level": 2,
      "currentXp": 150,
      "xpToNextLevel": 300,
      "totalXp": 350,
      "coins": 30,
      "decorations": [],
      "activeDecoration": null,
      "customAnimations": [],
      "levelUpHistory": []
    },
    "er-pr": {
      "level": 1,
      "currentXp": 50,
      "xpToNextLevel": 100,
      "totalXp": 50,
      "coins": 10,
      "decorations": [],
      "activeDecoration": null,
      "customAnimations": [],
      "levelUpHistory": []
    }
  },
  "shop": {
    "decorations": [
      {
        "id": "gold-border",
        "name": "Borde Dorado",
        "description": "Un elegante borde dorado alrededor del agente",
        "price": 100,
        "category": "border",
        "css": "border: 2px solid #ffd700; box-shadow: 0 0 15px #ffd70080;"
      },
      {
        "id": "glow-blue",
        "name": "Brillo Azul",
        "description": "Efecto de brillo azul pulsante",
        "price": 150,
        "category": "glow",
        "css": "animation: glow-blue 2s infinite;"
      },
      {
        "id": "crown-icon",
        "name": "Corona",
        "description": "Icono de corona sobre el agente",
        "price": 200,
        "category": "icon",
        "icon": "👑"
      },
      {
        "id": "rainbow-border",
        "name": "Borde Arcoíris",
        "description": "Borde con colores del arcoíris",
        "price": 300,
        "category": "border",
        "css": "border-image: linear-gradient(45deg, red, orange, yellow, green, blue, purple) 1;"
      },
      {
        "id": "fire-glow",
        "name": "Resplandor de Fuego",
        "description": "Efecto de fuego alrededor del agente",
        "price": 250,
        "category": "glow",
        "css": "box-shadow: 0 0 20px #ff4500, 0 0 40px #ff450080;"
      }
    ],
    "animations": [
      {
        "id": "celebrate",
        "name": "Celebración",
        "description": "Animación de celebración al recibir mensajes",
        "price": 100
      },
      {
        "id": "dance",
        "name": "Baile",
        "description": "El agente baila cuando está activo",
        "price": 150
      },
      {
        "id": "pulse",
        "name": "Pulso",
        "description": "Efecto de pulso constante",
        "price": 50
      }
    ],
    "sounds": [
      {
        "id": "level-up-chime",
        "name": "Campana de Nivel",
        "description": "Sonido alegre al subir de nivel",
        "price": 75
      },
      {
        "id": "coin-collect",
        "name": "Sonido de Monedas",
        "description": "Sonido al recoger monedas",
        "price": 50
      }
    ]
  },
  "config": {
    "xpPerTask": 25,
    "xpPerMessage": 5,
    "xpPerPrReview": 50,
    "coinsPerLevel": 25,
    "levelScaling": "exponential",
    "levelThresholds": [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]
  }
}
```

### Tipos de Datos Detallados

```typescript
interface AgentLevel {
  level: number;                    // Nivel actual (empieza en 1)
  currentXp: number;                // XP acumulado en el nivel actual
  xpToNextLevel: number;           // XP necesario para el siguiente nivel
  totalXp: number;                 // XP total acumulado (tod los niveles)
  coins: number;                   // Monedas disponibles
  decorations: string[];          // IDs de decoraciones desbloqueadas
  activeDecoration: string | null; // Decoración activa actualmente
  customAnimations: string[];      // Animaciones personalizadas desbloqueadas
  levelUpHistory: LevelUpEvent[];  // Historial de subida de niveles
}

interface LevelUpEvent {
  from: number;
  to: number;
  timestamp: string;
  coinsAwarded: number;
}

interface ShopDecoration {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'border' | 'glow' | 'icon';
  css?: string;
  icon?: string;
}

interface ShopAnimation {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ShopSound {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface LevelConfig {
  xpPerTask: number;              // XP por tarea completada
  xpPerMessage: number;           // XP por mensaje enviado
  xpPerPrReview: number;         // XP por revisión de PR
  coinsPerLevel: number;          // Monedas otorgadas al subir de nivel
  levelScaling: 'linear' | 'exponential';
  levelThresholds: number[];      // Umbrales de XP por nivel
}
```

---

## 3. Endpoints API

### Endpoints de Niveles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/levels` | Obtener niveles de todos los agentes |
| GET | `/api/levels/:agentId` | Obtener nivel de un agente específico |
| PUT | `/api/levels/:agentId` | Actualizar nivel de un agente |
| POST | `/api/levels/:agentId/add-xp` | Agregar XP a un agente (dispara level up) |

### Endpoints de Monedas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/coins/:agentId` | Obtener monedas de un agente |
| POST | `/api/coins/:agentId/add` | Agregar monedas (recompensas) |
| POST | `/api/coins/:agentId/spend` | Gastar monedas (comprar decoraciones) |

### Endpoints de Decoraciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/decorations/shop` | Obtener todas las decoraciones disponibles |
| GET | `/api/decorations/:agentId` | Obtener decoraciones de un agente |
| POST | `/api/decorations/:agentId/buy` | Comprar decoración |
| PUT | `/api/decorations/:agentId/activate` | Activar una decoración |
| DELETE | `/api/decorations/:agentId/activate` | Desactivar decoración activa |

### Endpoints de Configuración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/config` | Obtener configuración del sistema de niveles |

### Ejemplos de Requests

```bash
# Obtener niveles de todos los agentes
GET /api/levels

# Agregar XP a un agente (cuando completa tarea)
POST /api/levels/er-coder/add-xp
Body: { "xp": 25, "reason": "task_completed" }

# Comprar decoración
POST /api/decorations/er-hineda/buy
Body: { "decorationId": "gold-border" }

# Activar decoración
PUT /api/decorations/er-hineda/activate
Body: { "decorationId": "gold-border" }
```

---

## 4. Componentes de UI

### Componentes a Crear

#### 1. `LevelBadge`
Muestra el nivel y las monedas de un agente.

```jsx
// src/components/LevelBadge.jsx
- Props: { level, coins, agentId, showCoins }
- Estados: normal, levelUp (animación)
- Usa Framer Motion para animaciones
```

#### 2. `LevelProgressBar`
Barra de progreso hacia el siguiente nivel.

```jsx
// src/components/LevelProgressBar.jsx
- Props: { currentXp, xpToNextLevel, level }
- Animación de relleno con Framer Motion
- Tooltip con detalles de XP
```

#### 3. `LevelUpAnimation`
Modal overlay con animación de celebración.

```jsx
// src/components/LevelUpAnimation.jsx
- Props: { agentId, fromLevel, toLevel, coinsEarned }
- Animación: número que crece, explota, confeti
- Sonido opcional (use TTS o archivo de audio)
- Duración: ~3 segundos
```

#### 4. `CoinDisplay`
Muestra el saldo de monedas.

```jsx
// src/components/CoinDisplay.jsx
- Props: { coins, animate }
- Icono de moneda con animación al cambiar
```

#### 5. `DecorationShop`
Tienda de decoraciones.

```jsx
// src/components/DecorationShop.jsx
- Props: { agentId, coins, onPurchase }
- Grid de decoraciones disponibles
- Indicador de decoraciones ya compradas
- Botón de comprar (deshabilitado si no hay monedas)
```

#### 6. `AgentCustomizationPanel`
Panel de personalización de agente.

```jsx
// src/components/AgentCustomizationPanel.jsx
- Props: { agentId, decorations, activeDecoration }
- Lista de decoraciones compradas
- Preview en vivo de la decoración
- Opciones de activar/desactivar
```

### Componentes a Modificar

#### 1. `AgentCard` (modificar existente)
- Añadir `LevelBadge` en la esquina
- Aplicar `activeDecoration` CSS si existe
- Animación especial cuando tiene decorations activas

```jsx
// Modificaciones en AgentCard.jsx
+ import LevelBadge from './LevelBadge'
+ 
+ // Aplicar estilos de decoración
+ const decorationStyle = activeDecoration ? getDecorationStyle(activeDecoration) : {}
+ 
  return (
    <motion.div style={decorationStyle}>
      {/* ... contenido existente ... */}
      <LevelBadge level={level} coins={coins} />
    </motion.div>
  )
```

#### 2. `App.jsx` (modificar existente)
- Proveer `LevelsContext` a toda la app
- Manejar eventos de level up globalmente
- Añadir tienda de decoraciones al UI

---

## 5. Lógica de XP y Monedas

### Sistema de XP

```javascript
// Ganancias de XP
const XPEvents = {
  TASK_COMPLETED: 25,           // Cuando una tarea se completa
  MESSAGE_SENT: 5,               // Cuando el agente envía un mensaje
  PR_REVIEWED: 50,               // Cuando se revisa un PR
  ERROR_RESOLVED: 100,           // Cuando se resuelve un error
  SESSION_ACTIVE_PER_MINUTE: 1   // Por cada minuto activo
}

// Fórmula de nivel (exponencial)
const calculateXPForLevel = (level) => {
  // Nivel 1: 0, Nivel 2: 100, Nivel 3: 300, Nivel 4: 600...
  if (level === 1) return 0
  return Math.floor(100 * Math.pow(level - 1, 1.5))
}

// Verificar si sube de nivel
const checkLevelUp = (agent) => {
  while (agent.currentXp >= agent.xpToNextLevel) {
    agent.currentXp -= agent.xpToNextLevel
    agent.level++
    agent.xpToNextLevel = calculateXPForLevel(agent.level + 1)
    agent.coins += CONFIG.coinsPerLevel * agent.level // Más monedas en niveles altos
    agent.levelUpHistory.push({
      from: agent.level - 1,
      to: agent.level,
      timestamp: new Date().toISOString(),
      coinsAwarded: CONFIG.coinsPerLevel * agent.level
    })
    // Trigger animación de level up
  }
  return agent
}
```

### Sistema de Monedas

```javascript
// Monedas por nivel
const COINS_PER_LEVEL = {
  1: 25,
  2: 30,
  3: 35,
  4: 40,
  5: 50,
  // ... aumenta con niveles
}

// Comprar decoración
const buyDecoration = (agent, decorationId, shop) => {
  const decoration = shop.decorations.find(d => d.id === decorationId)
  if (!decoration) throw new Error('Decoración no encontrada')
  if (agent.coins < decoration.price) throw new Error('Monedas insuficientes')
  if (agent.decorations.includes(decorationId)) throw new Error('Ya tienes esta decoración')
  
  agent.coins -= decoration.price
  agent.decorations.push(decorationId)
  return agent
}

// Activar decoración
const activateDecoration = (agent, decorationId) => {
  if (!agent.decorations.includes(decorationId)) {
    throw new Error('Primero compra la decoración')
  }
  agent.activeDecoration = agent.activeDecoration === decorationId ? null : decorationId
  return agent
}
```

### Eventos que Disparan XP

1. **Desde SSE/API**: Cuando llega evento de tarea completada
2. **Desde AgentCard**: Cuando el agente termina una tarea
3. **Periódico**: Cada minuto de sesión activa

```javascript
// Ejemplo de integración con el sistema existente
// En App.jsx, cuando llega un evento de update:

const handleAgentUpdate = (agentData) => {
  // Si hay una tarea completada, dar XP
  if (agentData.taskStatus === 'completed' && !agentData.xpAwarded) {
    addXP(agentData.agentId, XPEvents.TASK_COMPLETED, 'task_completed')
  }
  
  // Si hay nuevo mensaje, dar XP
  if (agentData.newMessage) {
    addXP(agentData.agentId, XPEvents.MESSAGE_SENT, 'message')
  }
}
```

---

## 6. Orden de Implementación (Fases)

### Fase 1: Fundamentos (Días 1-2)

**Objetivo**: Sistema básico de niveles sin UI de gamificación

- [ ] 1.1 Crear estructura de datos `data/levels.json`
- [ ] 1.2 Crear módulo de utilidades `server/levels.mjs`:
  - [ ] Funciones CRUD para niveles
  - [ ] Lógica de XP y level up
  - [ ] Funciones de monedas y compras
- [ ] 1.3 Implementar endpoints API en `server.mjs`:
  - [ ] GET `/api/levels`
  - [ ] GET `/api/levels/:agentId`
  - [ ] POST `/api/levels/:agentId/add-xp`
  - [ ] GET `/api/coins/:agentId`
  - [ ] POST `/api/coins/:agentId/spend`
  - [ ] GET `/api/decorations/shop`
  - [ ] POST `/api/decorations/:agentId/buy`
  - [ ] PUT `/api/decorations/:agentId/activate`
- [ ] 1.4 Crear script de inicialización de niveles para agentes existentes
- [ ] 1.5 Testing básico de endpoints con curl

### Fase 2: UI Básica (Días 2-3)

**Objetivo**: Mostrar nivel en las cards de agentes

- [ ] 2.1 Crear componente `LevelBadge.jsx`:
  - [ ] Mostrar número de nivel
  - [ ] Estilo visual (badge/chip)
  - [ ] Colores por nivel (gradual de verde a dorado)
- [ ] 2.2 Crear componente `LevelProgressBar.jsx`:
  - [ ] Barra de progreso visual
  - [ ] Animación de progreso con Framer Motion
  - [ ] Tooltip con XP actual/requerida
- [ ] 2.3 Crear componente `CoinDisplay.jsx`:
  - [ ] Icono de moneda
  - [ ] Animación al cambiar valor
- [ ] 2.4 Modificar `AgentCard.jsx` para incluir LevelBadge
- [ ] 2.5 Integrar datos de niveles con el estado de la app
- [ ] 2.6 Testing visual en el dashboard

### Fase 3: Animación de Level Up (Días 3-4)

**Objetivo**: Animación impactante cuando un agente sube de nivel

- [ ] 3.1 Crear `LevelUpAnimation.jsx`:
  - [ ] Overlay modal
  - [ ] Número de nivel que crece (scale animation)
  - [ ] Efecto de "explosión" al llegar al nuevo nivel
  - [ ] Confeti o partículas
  - [ ] Mostrar monedas ganadas
- [ ] 3.2 Integrar animación con el flujo de `add-xp`:
  - [ ] El frontend detecta cuando el nivel cambió
  - [ ] Dispara la animación
- [ ] 3.3 Añadir sonidos (opcional):
  - [ ] Sound effect para level up
  - [ ] Sound effect para ganar monedas
- [ ] 3.4 Testing de animaciones y transiciones

### Fase 4: Sistema de Personalización (Días 4-5)

**Objetivo**: Tienda de decoraciones y personalización

- [ ] 4.1 Crear `DecorationShop.jsx`:
  - [ ] Grid de decoraciones disponibles
  - [ ] Mostrar precio y estado (comprado/disponible)
  - [ ] Preview de cada decoración
- [ ] 4.2 Crear `AgentCustomizationPanel.jsx`:
  - [ ] Lista de decoraciones compradas
  - [ ] Botones para activar/desactivar
  - [ ] Preview en tiempo real
- [ ] 4.3 Implementar aplicación de decoraciones en AgentCard:
  - [ ] Aplicar CSS dinámico basado en decoration activa
  - [ ] Soporte para borders, glows, e icons
- [ ] 4.4 Integrar con API de compras
- [ ] 4.5 Testing del flujo completo: comprar → activar

### Fase 5: Polish y Optimización (Días 5-6)

**Objetivo**: Mejoras finales y optimización

- [ ] 5.1 Persistencia de preferencias del usuario (localStorage)
- [ ] 5.2 Animaciones adicionales:
  - [ ] Animación de "idle" para agentes de alto nivel
  - [ ] Efectos visuales exclusivos para nivel máximo (10)
- [ ] 5.3 Optimización de rendimiento:
  - [ ] Memoización de componentes
  - [ ] Carga perezosa de animaciones pesadas
- [ ] 5.4 Documentación de la API
- [ ] 5.5 Testing completo E2E
- [ ] 5.6 Deployment y validación en producción

---

## 7. Dependencias y Recursos

### Dependencias npm ya disponibles
- `framer-motion` ✅ (ya instalado)
- `react` ✅
- `tailwindcss` ✅

### Recursos adicionales necesarios
- Archivos de audio (opcional):
  - `public/sounds/level-up.mp3`
  - `public/sounds/coin-collect.mp3`
- Imágenes de decoraciones (si no son CSS puro)

### Consideraciones de Docker
El proyecto ya tiene Docker configurado. Para el sistema de niveles:
- No se necesita nueva imagen de Docker
- Solo agregar el archivo `data/levels.json` al volumen persistente
- Opcional: crear volumen dedicado para datos de niveles

---

## 8. Notas de Implementación

### Integración con el Dashboard Existente

1. **LevelsContext**: Crear un React Context que envuelva toda la app y provea:
   - Estado de niveles de todos los agentes
   - Funciones para agregar XP, comprar, etc.
   - Estado de animaciones activas

2. **SSE Integration**: Escuchar eventos de level up desde el servidor y mostrar animaciones automáticamente

3. **Fallback**: Si el archivo JSON no existe, inicializar con valores por defecto para cada agente

### Manejo de Errores

- Si el archivo JSON no se puede leer: crear uno nuevo con estructura vacía
- Si el agente no existe en levels.json: crearlo con valores iniciales (nivel 1)
- Si la compra falla: devolver error claro y no modificar el estado

### Seguridad

- Los endpoints de modificación requieren autenticación JWT
- Validar que el agentId enviado pertenece a un agente válido
- No permitir valores negativos de monedas

---

*Documento generado: 2026-02-15*
*Versión: 1.0.0*
