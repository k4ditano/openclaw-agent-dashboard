import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Code, Network, GitPullRequest, Cpu, Activity, Clock, Zap, Lock, Eye, EyeOff, Maximize2, X, Search, Download, Bell, AlertTriangle, BarChart3, History, FileJson, FileText, Filter, RefreshCw, Sun, Moon, MessageSquare, Server, Gauge, TrendingUp, CalendarDays, ShoppingCart } from 'lucide-react'

// Componentes de niveles
import { LevelBadge } from './components/LevelBadge'
import { LevelProgressBar } from './components/LevelProgressBar'
import { CoinDisplay } from './components/CoinDisplay'
import { LevelUpAnimation } from './components/LevelUpAnimation'
import { DecorationShop, getDecorationById, useDecorations } from './components/DecorationShop'
import { AgentCustomizationPanel } from './components/AgentCustomizationPanel'
import { Tooltip, HelpIcon, InfoBadge } from './components/Tooltip'
import { IdleAnimation, MaxLevelEffects, LevelProgressGlow } from './components/LevelEffects'

// Hooks de persistencia
import { useLocalStorage, useLastSelectedAgent, useLastActiveTab, useActiveDecoration, useOwnedDecorations, useUIPreferences } from './hooks/useLocalStorage'

// =============================================================================
// THEME CONTEXT - Dark/Light Theme
// =============================================================================

const ThemeContext = createContext(null)

function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or default to dark
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return true // Default to dark
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    // Update document class for Tailwind dark mode
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Theme toggle button component
function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Moon size={18} className="text-retro-yellow" /> : <Sun size={18} className="text-retro-orange" />}
      </motion.div>
      <span className="text-sm text-gray-400 hidden sm:inline">
        {isDark ? 'Oscuro' : 'Claro'}
      </span>
    </button>
  )
}

// =============================================================================
// AUTH CONTEXT - JWT Authentication
// =============================================================================

const AuthContext = createContext(null)

// Hook para acceder al token
function useAuth() {
  return useContext(AuthContext)
}

// Función para hacer requests autenticadas
async function authFetch(url, token, options = {}) {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  }
  return fetch(url, { ...options, headers })
}

// Pixel art creatures - Enhanced version with unique avatars
const PixelCreature = ({ type, size = 80, isTalking = false, image }) => {
  // If image is provided, use it instead of pixel art
  if (image && !image.includes('agent-avatars')) {
    // Individual avatar image - just display it
    return (
      <div 
        className="relative rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img 
          src={image} 
          alt={type}
          className="w-full h-full object-cover"
          style={{ borderRadius: '50%' }}
        />
        {isTalking && (
          <div 
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ boxShadow: '0 0 20px currentColor' }}
          />
        )}
      </div>
    )
  }
  
  // Fallback: Sprite sheet (for backwards compatibility)
  if (image) {
    const positionMap = {
      'er-hineda': '25% 16.5%',
      'er-coder': '75% 16.5%',
      'er-plan': '25% 50%',
      'er-serve': '75% 50%',
      'er-pr': '25% 83.5%'
    }
    const position = positionMap[type] || '50% 50%'
    
    return (
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{ width: size, height: size }}
      >
        <div 
          className="w-full h-full bg-no-repeat"
          style={{ 
            backgroundImage: `url(${image})`,
            backgroundPosition: position,
            backgroundSize: '200% 300%'
          }}
        />
        {isTalking && (
          <div 
            className="absolute inset-0 rounded-lg animate-pulse"
            style={{ boxShadow: '0 0 20px currentColor' }}
          />
        )}
      </div>
    )
  }
  
  const creatures = {
    'er-hineda': {
      color: '#ec4899',
      desc: 'Orquestador',
      // Matriz de pixels 8x8 para estilo pixel art
      pixels: [
        [0,0,1,1,1,1,0,0],
        [0,1,2,2,2,2,1,0],
        [1,2,3,2,2,3,2,1],
        [1,2,2,2,2,2,2,1],
        [1,2,4,2,2,4,2,1],
        [0,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,1,0],
        [0,1,1,0,0,1,1,0]
      ],
      emoji: '🧉'
    },
    'coder': {
      color: '#8b5cf6',
      desc: 'Constructor',
      pixels: [
        [0,0,1,1,1,1,0,0],
        [0,1,2,2,2,2,1,0],
        [1,2,2,2,2,2,2,1],
        [1,2,3,2,2,3,2,1],
        [1,2,2,3,3,2,2,1],
        [1,2,2,2,2,2,2,1],
        [0,1,1,0,0,1,1,0],
        [1,0,0,0,0,0,0,1]
      ],
      emoji: '🤖'
    },
    'netops': {
      color: '#06b6d4',
      desc: 'Servidor',
      pixels: [
        [0,0,1,1,1,1,0,0],
        [0,1,2,2,2,2,1,0],
        [1,2,3,2,2,3,2,1],
        [1,2,2,3,3,2,2,1],
        [1,2,2,2,2,2,2,1],
        [0,1,2,2,2,2,1,0],
        [0,1,0,1,1,0,1,0],
        [0,1,0,0,0,0,1,0]
      ],
      emoji: '🌐'
    },
    'pr-reviewer': {
      color: '#22c55e',
      desc: 'Guardián',
      pixels: [
        [0,0,1,1,1,1,0,0],
        [0,1,2,2,2,2,1,0],
        [1,2,3,2,2,3,2,1],
        [1,2,2,2,2,2,2,1],
        [1,2,3,2,2,3,2,1],
        [0,1,2,2,2,2,1,0],
        [0,1,0,2,2,0,1,0],
        [0,1,0,1,1,0,1,0]
      ],
      emoji: '🔍'
    }
  }
  
  const c = creatures[type] || creatures['coder']
  
  // Mapeo de colores para los pixels
  const colorMap = {
    0: 'transparent',
    1: c.color,
    2: `${c.color}dd`,
    3: '#ffffff',
    4: '#ffeb3b'
  }
  
  return (
    <motion.div 
      className="relative"
      style={{ width: size, height: size }}
      animate={isTalking ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Background glow */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${c.color}30 0%, ${c.color}10 100%)`,
          boxShadow: `0 0 30px ${c.color}60, inset 0 0 20px ${c.color}20`
        }}
      />
      
      {/* Pixel art grid */}
      <div 
        className="absolute inset-2 grid"
        style={{ 
          gridTemplateColumns: `repeat(8, 1fr)`,
          gridTemplateRows: `repeat(8, 1fr)`,
        }}
      >
        {c.pixels.flat().map((pixel, i) => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{
              backgroundColor: colorMap[pixel],
              opacity: pixel === 0 ? 0 : 1
            }}
            animate={isTalking ? { 
              opacity: [0.5, 1, 0.5],
              y: [0, -2, 0]
            } : {}}
            transition={{ 
              duration: 0.5, 
              repeat: isTalking ? Infinity : 0,
              delay: i * 0.02
            }}
          />
        ))}
      </div>
      
      {/* Emoji overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-60">
        {c.emoji}
      </div>
      
      {/* Status indicator */}
      <motion.div 
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black"
        style={{ backgroundColor: c.color }}
        animate={isTalking ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

// Terminal de comunicaciones entre agentes
const AgentTerminal = ({ messages, onAgentClick, agents = [] }) => {
  const [autoScroll, setAutoScroll] = useState(true)
  const [scrollPosition, setScrollPosition] = useState({ atBottom: true, isUserScrolling: false })
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const prevMessagesLengthRef = useRef(messages.length)
  
  // Función para obtener imagen del agente
  const getAgentImage = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    return agent?.image || null
  }
  
  const isInitialRender = useRef(true)
  
  // Check if currently at bottom
  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    return scrollHeight - scrollTop - clientHeight < 50
  }
  
  // Auto-scroll disabled - causing issues on mobile page refresh
  // The scrollIntoView was moving the page unexpectedly
  
  // Handle scroll to detect if user scrolled up
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setScrollPosition(prev => ({
      atBottom: isAtBottom,
      isUserScrolling: true
    }))
    setAutoScroll(isAtBottom)
  }
  
  return (
    <div className="bg-gray-100 dark:bg-black/80 rounded-lg border border-gray-600 dark:border-white/20 overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="bg-gray-300 dark:bg-white/10 px-2 sm:px-3 py-2 flex items-center justify-between border-b border-gray-400 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-retro-green" />
          <span className="text-retro-green hidden sm:inline">AGENT COMM LINK</span>
          <span className="text-retro-green sm:hidden">COMM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-500">● LIVE</span>
        </div>
      </div>
      
      {/* Messages - larger height with proper scrolling */}
      <div 
        ref={messagesContainerRef}
        className="h-48 sm:h-56 md:h-64 overflow-y-auto p-2 space-y-1 bg-gray-50 dark:bg-black/50 scroll-smooth"
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-600 italic">Esperando mensajes entre agentes...</div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 py-1"
              >
                {/* From avatar */}
                <button onClick={() => onAgentClick(msg.from)} className="flex-shrink-0">
                  <PixelCreature type={msg.from} size={24} image={getAgentImage(msg.from)} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-retro-cyan font-bold">{msg.from.toUpperCase()}</span>
                    <span className="text-gray-500 dark:text-gray-600">→</span>
                    <span className="text-retro-pink font-bold">{msg.to.toUpperCase()}</span>
                    <span className="text-gray-500 dark:text-gray-600 text-[10px]">{msg.time}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 break-words">{msg.content}</div>
                </div>
                
                {/* Arrow animation */}
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-retro-green flex-shrink-0"
                >
                  ▸
                </motion.span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        {/* Invisible element for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll indicator */}
      {!autoScroll && messages.length > 0 && (
        <div className="px-2 py-1 text-[10px] text-gray-500 bg-gray-200 dark:bg-white/5 text-center">
          ↑ Más mensajes arriba
        </div>
      )}
      
      {/* Input模拟 */}
      <div className="bg-white dark:bg-white/5 px-3 py-2 border-t border-gray-300 dark:border-white/10">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-600">
          <span className="text-retro-green">$</span>
          <span className="italic">conexión segura activa...</span>
        </div>
      </div>
    </div>
  )
}

// Network visualization for agent communications - Enhanced version
const CommsNetwork = ({ communications = [], agents = [], onAgentClick }) => {
  // Map comm IDs to agent IDs
  const mapCommIdToAgentId = (commId) => {
    const mapping = {
      'main': 'er-hineda',
      'planner': 'er-plan',
      'coder': 'er-coder',
      'netops': 'er-serve',
      'pr-reviewer': 'er-pr'
    }
    if (mapping[commId]) return mapping[commId]
    // If already starts with er-, use as is
    if (commId.startsWith('er-')) return commId
    return commId
  }

  // Calculate connection strength between agents
  const connectionMap = {}
  const agentSet = new Set()

  communications.forEach(msg => {
    const fromMapped = mapCommIdToAgentId(msg.from)
    const toMapped = mapCommIdToAgentId(msg.to)
    agentSet.add(fromMapped)
    agentSet.add(toMapped)
    const key = [fromMapped, toMapped].sort().join('-')
    connectionMap[key] = (connectionMap[key] || 0) + 1
  })

  // Use agents from API instead of hardcoded list
  const allAgentIds = agents.map(a => a.id)
  const activeAgents = allAgentIds.filter(id => agentSet.has(id))
  const displayAgents = activeAgents.length > 0 ? activeAgents : allAgentIds

  const positions = {}
  const centerX = 50
  const centerY = 50
  const radius = 32

  displayAgents.forEach((agentId, i) => {
    const angle = (2 * Math.PI * i) / displayAgents.length - Math.PI / 2
    positions[agentId] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })

  const maxConnection = Math.max(...Object.values(connectionMap), 1)

  // Get agent data from the agents array
  const getAgentData = (id) => {
    const agent = agents.find(a => a.id === id)
    if (!agent) return { color: '#6b7280', emoji: '●', name: id }

    // Parse color from agent object
    let color = '#6b7280'
    if (agent.glowColor) {
      color = agent.glowColor
    } else if (typeof agent.color === 'string') {
      // Extract hex from Tailwind class if needed
      const colorMap = {
        'text-retro-pink': '#ec4899',
        'text-retro-purple': '#8b5cf6',
        'text-retro-cyan': '#06b6d4',
        'text-retro-green': '#22c55e',
        'text-retro-yellow': '#f59e0b',
        'text-retro-orange': '#f97316',
      }
      color = colorMap[agent.color] || agent.glowColor || '#6b7280'
    }

    return {
      color,
      emoji: agent.emoji || '●',
      name: agent.name || id
    }
  }

  const getAgentColor = (id) => getAgentData(id).color
  const getAgentEmoji = (id) => getAgentData(id).emoji
  const getAgentName = (id) => getAgentData(id).name

  if (displayAgents.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Network size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">Sin comunicaciones aún</p>
        </div>
      </div>
    )
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 100%)' }}>
      <defs>
        {/* Glow filters */}
        <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {/* Gradient for connections */}
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.8"/>
        </linearGradient>
        {/* Radial gradient for center */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Center glow */}
      {displayAgents.length >= 2 && (
        <circle
          cx={centerX}
          cy={centerY}
          r={20}
          fill="url(#centerGlow)"
        />
      )}

      {/* Animated connections with flow */}
      {Object.entries(connectionMap).map(([key, count]) => {
        const [from, to] = key.split('-')
        if (!positions[from] || !positions[to]) return null
        const strength = count / maxConnection
        const color = getAgentColor(from)

        return (
          <g key={key}>
            {/* Base connection line */}
            <line
              x1={positions[from].x}
              y1={positions[from].y}
              x2={positions[to].x}
              y2={positions[to].y}
              stroke={color}
              strokeWidth={0.3 + strength * 1}
              strokeOpacity={0.2 + strength * 0.4}
              strokeDasharray="2 1"
            />
            {/* Glowing core */}
            <line
              x1={positions[from].x}
              y1={positions[from].y}
              x2={positions[to].x}
              y2={positions[to].y}
              stroke={color}
              strokeWidth={0.1 + strength * 0.3}
              strokeOpacity={0.6 + strength * 0.4}
            />
            {/* Animated flow particles */}
            {strength > 0.3 && (
              <circle r="0.8" fill={color} filter="url(#glow-cyan)">
                <animateMotion
                  dur={`${2 + strength * 2}s`}
                  repeatCount="indefinite"
                  path={`M ${positions[from].x} ${positions[from].y} L ${positions[to].x} ${positions[to].y}`}
                />
                <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            )}
          </g>
        )
      })}

      {/* Center hub */}
      {displayAgents.length >= 2 && (
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r={6}
            fill="#1e1b4b"
            stroke="#6366f1"
            strokeWidth={0.3}
            opacity={0.8}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={4}
            fill="#6366f1"
            opacity={0.6}
          >
            <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.8;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle
            cx={centerX}
            cy={centerY}
            r={2}
            fill="#a5b4fc"
          >
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}

      {/* Agent nodes */}
      {displayAgents.map(agentId => {
        const pos = positions[agentId]
        const agent = agents.find(a => a.id === agentId)
        const color = getAgentColor(agentId)
        const emoji = getAgentEmoji(agentId)
        const name = getAgentName(agentId)
        const isActive = communications.some(c => c.from === agentId || c.to === agentId)
        const connectionCount = Object.entries(connectionMap)
          .filter(([key]) => key.includes(agentId))
          .reduce((sum, [, count]) => sum + count, 0)

        return (
          <g
            key={agentId}
            onClick={() => onAgentClick(agentId)}
            className="cursor-pointer"
          >
            {/* Outer glow ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={12}
              fill="transparent"
              stroke={color}
              strokeWidth={0.2}
              opacity={0.2}
            />

            {/* Animated ring when active */}
            {isActive && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={11}
                fill="transparent"
                stroke={color}
                strokeWidth={0.4}
                opacity={0.8}
                filter="url(#glow-purple)"
              >
                <animate attributeName="r" values="9;12;9" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            )}

            {/* Main node background */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={8}
              fill={`${color}20`}
              stroke={color}
              strokeWidth={0.5}
            />

            {/* Inner gradient */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={6}
              fill={color}
              opacity={0.3}
            />

            {/* Avatar image or fallback to emoji */}
            {agent?.image ? (
              <g>
                <defs>
                  <clipPath id={`clip-${agentId}`}>
                    <circle cx={pos.x} cy={pos.y} r={7} />
                  </clipPath>
                </defs>
                <image
                  href={agent.image}
                  x={pos.x - 7}
                  y={pos.y - 7}
                  width={14}
                  height={14}
                  clipPath={`url(#clip-${agentId})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            ) : (
              /* Emoji in center */
              <text
                x={pos.x}
                y={pos.y + 1.5}
                textAnchor="middle"
                fontSize={6}
                dominantBaseline="middle"
              >
                {emoji}
              </text>
            )}

            {/* Connection count badge */}
            {connectionCount > 0 && (
              <g>
                <circle
                  cx={pos.x + 7}
                  cy={pos.y - 7}
                  r={3}
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth={0.3}
                />
                <text
                  x={pos.x + 7}
                  y={pos.y - 6.5}
                  textAnchor="middle"
                  fill={color}
                  fontSize={2.5}
                  dominantBaseline="middle"
                >
                  {connectionCount}
                </text>
              </g>
            )}

            {/* Agent label */}
            <text
              x={pos.x}
              y={pos.y + 14}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize={3}
              fontFamily="monospace"
            >
              {name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const generateTasks = (agentId) => {
  const tasksByAgent = {
    'er-hineda': [
      { id: 1, name: 'Orquestando er Codi', status: 'running', progress: 65 },
      { id: 2, name: 'Coordinando er PR', status: 'pending', progress: 0 },
      { id: 3, name: 'Sincronizando memoria', status: 'completed', progress: 100 },
    ],
    'coder': [
      { id: 1, name: 'Compilando src/index.ts', status: 'running', progress: 80 },
      { id: 2, name: 'Optimizando bundle.js', status: 'pending', progress: 0 },
      { id: 3, name: 'Ejecutando tests', status: 'completed', progress: 100 },
    ],
    'netops': [
      { id: 1, name: 'Monitoreando nginx', status: 'running', progress: 45 },
      { id: 2, name: 'Verificando certificados', status: 'completed', progress: 100 },
      { id: 3, name: 'Backup database', status: 'pending', progress: 0 },
    ],
    'pr-reviewer': [
      { id: 1, name: 'Analizando commit 3394c45', status: 'running', progress: 90 },
      { id: 2, name: 'Escaneando vulnerabilidades', status: 'pending', progress: 0 },
      { id: 3, name: 'Generando informe', status: 'pending', progress: 0 },
    ]
  }
  return tasksByAgent[agentId] || []
}

// Lista estática de agentes (fallback cuando no hay datos del API)
const STATIC_AGENTS = [
  {
    id: 'er-hineda',
    name: 'er Hineda',
    emoji: '🧉',
    description: 'Sesión principal',
    color: 'text-retro-pink',
    borderColor: 'border-retro-pink',
    glowColor: '#ec4899',
    role: 'Orquestador',
    image: '/avatar_er_hineda.png'
  },
  {
    id: 'er-coder',
    name: 'er Codi',
    emoji: '🤖',
    description: 'Sub-agente coder',
    color: 'text-retro-purple',
    borderColor: 'border-retro-purple',
    glowColor: '#8b5cf6',
    role: 'Constructor',
    image: '/avatar_er_coder.png'
  },
  {
    id: 'er-plan',
    name: 'er Plan',
    emoji: '📐',
    description: 'Sub-agente planner',
    color: 'text-retro-yellow',
    borderColor: 'border-retro-yellow',
    glowColor: '#f59e0b',
    role: 'Arquitecto',
    image: '/avatar_er_plan.png'
  },
  {
    id: 'er-serve',
    name: 'er Serve',
    emoji: '🌐',
    description: 'Sub-agente netops',
    color: 'text-retro-cyan',
    borderColor: 'border-retro-cyan',
    glowColor: '#06b6d4',
    role: 'Servidor',
    image: '/avatar_er_serve.png'
  },
  {
    id: 'er-pr',
    name: 'er PR',
    emoji: '🔍',
    description: 'Sub-agente PR',
    color: 'text-retro-green',
    borderColor: 'border-retro-green',
    glowColor: '#22c55e',
    role: 'Guardián',
    image: '/avatar_er_pr.png'
  }
]

// Función para convertir agente del API al formato del frontend
function apiAgentToFrontend(agentId, agentData) {
  // Colores por defecto para agentes dinámicos
  const defaultColors = [
    { color: 'text-retro-pink', borderColor: 'border-retro-pink', glowColor: '#ec4899' },
    { color: 'text-retro-purple', borderColor: 'border-retro-purple', glowColor: '#8b5cf6' },
    { color: 'text-retro-cyan', borderColor: 'border-retro-cyan', glowColor: '#06b6d4' },
    { color: 'text-retro-green', borderColor: 'border-retro-green', glowColor: '#22c55e' },
    { color: 'text-retro-yellow', borderColor: 'border-retro-yellow', glowColor: '#f59e0b' },
    { color: 'text-retro-orange', borderColor: 'border-retro-orange', glowColor: '#f97316' },
  ]
  
  const index = Object.keys(agentData || {}).indexOf(agentId)
  const colorSet = defaultColors[index % defaultColors.length] || defaultColors[0]

  // Intentar encontrar coincidencia en agentes estáticos
  const staticMatch = STATIC_AGENTS.find(a => a.id === agentId)
  
  return {
    id: agentId,
    name: agentData?.name || staticMatch?.name || agentId,
    emoji: agentData?.emoji || staticMatch?.emoji || '🧠',
    description: agentData?.desc || agentData?.description || staticMatch?.description || `Agente ${agentId}`,
    color: staticMatch?.color || colorSet.color,
    borderColor: staticMatch?.borderColor || colorSet.borderColor,
    glowColor: staticMatch?.glowColor || colorSet.glowColor,
    role: staticMatch?.role || 'Agente',
    image: agentData?.image || staticMatch?.image || null,
    folder: agentData?.folder || agentId
  }
}

const statusLabels = {
  idle: { text: 'ESPERANDO', color: 'text-gray-400' },
  monitoring: { text: 'MONITOREANDO', color: 'text-retro-cyan' },
  reviewing: { text: 'ANALIZANDO', color: 'text-retro-green' },
  working: { text: 'TRABAJANDO', color: 'text-retro-yellow' },
  error: { text: 'ERROR', color: 'text-retro-red' }
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLocalError('')
    
    try {
      // Login con JWT real
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error en login')
      }
      
      const data = await res.json()
      
      // Guardar token en localStorage
      localStorage.setItem('jwt_token', data.token)
      localStorage.setItem('jwt_expiry', Date.now() + (24 * 60 * 60 * 1000)) // 24 horas
      
      onLogin()
    } catch (err) {
      setLocalError(err.message || 'Credenciales inválidas')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-white dark:bg-black border-2 border-retro-purple rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Lock className="text-retro-purple" size={48} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display">
              AGENT DASHBOARD
            </h1>
            <p className="text-xs text-gray-500 mt-2">JWT Authentication</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-white/20 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-mono"
                placeholder="USUARIO"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-white/20 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-mono pr-12"
                placeholder="PASSWORD"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {localError && <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">{localError}</div>}
            <button type="submit" disabled={loading} className="w-full bg-retro-purple hover:bg-retro-purple/80 text-white font-bold py-3 rounded-lg">
              {loading ? 'ACCEDIENDO...' : 'ACCEDER'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Hook para cargar estado completo de agentes desde API real
function useAgentStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef(null)

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    console.log('Manual reconnect triggered')
    reconnectAttemptsRef.current = 0
    setError(null)
    setConnected(false)

    // Cerrar conexión existente
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Limpiar timeout anterior
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    // Reintentar inmediatamente
    const token = localStorage.getItem('jwt_token')
    if (token) {
      connectSSE(token)
    }
  }, [])

  // Función para obtener datos iniciales
  async function fetchInitialStatus(authToken) {
    try {
      const res = await fetch('/api/metrics/agent-status', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      if (res.ok) {
        setStatus(await res.json())
        setError(null)
      } else if (res.status === 401 || res.status === 403) {
        // Token expirado, limpiar
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('jwt_expiry')
        setError('Sesión expirada')
      }
    } catch (e) {
      console.warn('Error fetching initial status:', e.message)
      // Fallback a archivo estático
      try {
        const staticRes = await fetch('/agent-status.json')
        if (staticRes.ok) {
          setStatus(await staticRes.json())
        }
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  // Función para conectar a SSE
  function connectSSE(authToken) {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(`/api/events?token=${authToken}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnected(true)
      setError(null)
      reconnectAttemptsRef.current = 0 // Reset counter on successful connection
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'connected') {
          // Evento de conexión recibido
        } else if (data.type === 'update') {
          // Actualizar estado con datos de SSE
          setStatus({
            generatedAt: data.timestamp,
            agents: data.agents,
            communications: data.communications,
            metrics: data.metrics
          })
        } else if (data.type === 'error') {
          console.warn('SSE error:', data.error)
          setError(data.error)
        }
      } catch (e) {
        console.error('Error parsing SSE data:', e)
      }
    }

    const maxReconnectAttempts = 10

    eventSource.onerror = (err) => {
      console.warn('SSE error, reconectando...', err)
      setConnected(false)
      eventSource.close()

      // Verificar token antes de reintentar
      const currentToken = localStorage.getItem('jwt_token')
      if (!currentToken) {
        console.warn('SSE: Token no disponible, no se reconecta')
        setError('Sesión expirada')
        return
      }

      // Limitar reintentos (usar el ref counter)
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.warn('SSE: Máximo de reintentos alcanzado')
        setError('Conexión perdida. Toca "Reconectar" para intentarlo de nuevo.')
        return
      }

      // Backoff exponencial: 5s, 10s, 20s
      const delay = 5000 * Math.pow(2, reconnectAttemptsRef.current)
      reconnectAttemptsRef.current++

      console.log(`SSE: Reintento ${reconnectAttemptsRef.current}/${maxReconnectAttempts} en ${delay}ms`)

      // Reintentar conexión
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSSE(currentToken)
      }, delay)
    }
  }

  // Inicializar
  useEffect(() => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      fetchInitialStatus(token)
      connectSSE(token)
    } else {
      setLoading(false)
    }

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { status, loading, error, connected, reconnect }
}

function AgentCard({ agent, isSelected, onClick, agentData, levelData, decoration }) {
  const data = agentData?.[agent.id] || {}
  const userLevel = levelData?.user || {}
  
  // Obtener datos de la decoración activa
  const activeDecoration = decoration ? getDecorationById(decoration) : null
  
  // Determinar clase de estado
  const getStatusClass = (status) => {
    switch (status) {
      case 'running':
        return 'bg-retro-green/20 text-retro-green'
      case 'active':
        return 'bg-retro-cyan/20 text-retro-cyan'
      case 'idle':
        return 'bg-retro-yellow/20 text-retro-yellow'
      case 'error':
        return 'bg-retro-red/20 text-retro-red'
      default:
        return 'bg-white/10 text-gray-400'
    }
  }
  
  // Determinar estilos de decoración
  const getDecorationStyle = () => {
    if (!activeDecoration) return {}
    
    if (activeDecoration.type === 'glow') {
      return { boxShadow: activeDecoration.value }
    }
    if (activeDecoration.type === 'border') {
      return { border: activeDecoration.value }
    }
    return {}
  }
  
  // Icono de decoración
  const renderDecorationIcon = () => {
    if (!activeDecoration || activeDecoration.type !== 'icon') return null
    
    // Dynamic import del icono
    const iconMap = {
      crown: '👑', rocket: '🚀', target: '🎯', sun: '☀️', moon: '🌙', gem: '💎',
      Zap: '⚡', Crown: '👑', Star: '⭐', Gem: '💎', Rocket: '🚀', 
      Target: '🎯', Sun: '☀️', Moon: '🌙'
    }
    
    const iconName = activeDecoration.value
    const emoji = iconMap[iconName] || '✨'
    
    return (
      <div 
        className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center z-10 animate-bounce"
        style={{ 
          backgroundColor: activeDecoration.borderColor,
          boxShadow: `0 0 10px ${activeDecoration.borderColor}`
        }}
      >
        <span className="text-xs">{emoji}</span>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative p-2 sm:p-3 md:p-4 rounded-lg cursor-pointer transition-all
        bg-white/50 dark:bg-black/50 
        ${activeDecoration?.type === 'border' ? '' : `border-2 ${agent.borderColor}`}
        ${isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-black' : ''}
        ${data.status === 'error' ? 'border-retro-red' : ''}
      `}
      style={{ 
        boxShadow: activeDecoration?.type === 'glow' 
          ? activeDecoration.value 
          : (isSelected ? `0 0 20px ${agent.glowColor}40` : 
             data.status === 'error' ? '0 0 20px #ef444440' : 'none'),
        ...(activeDecoration?.type === 'border' ? { border: activeDecoration.value } : {})
      }}
    >
      {/* Icono de decoración */}
      {renderDecorationIcon()}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <PixelCreature type={agent.id} size={40} sm={48} md={64} isTalking={data.status === 'running'} image={agent.image} />
        <div className="flex-1 min-w-0">
          {/* Primera línea: Nombre + Estado (separados para evitar overlap) */}
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-sm sm:text-base md:text-lg font-bold ${agent.color} truncate`}>{agent.name}</h3>
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap z-20 relative ${getStatusClass(data.status)}`}>
              {data.status?.toUpperCase() || 'OFFLINE'}
            </span>
          </div>
          {/* Segunda línea: Level Badge + Level Progress Bar (separada del estado) */}
          <div className="flex items-center gap-2 mt-2">
            {/* Level Badge - always visible, no tooltip */}
            {userLevel.level && (
              <LevelBadge level={userLevel.level} size="sm" showTooltip={false} />
            )}
            {/* Level Progress Bar - solo visible en md+ */}
            {userLevel.level && userLevel.xpForNextLevel && (
              <div className="flex-1 hidden md:block">
                <LevelProgressBar 
                  currentXP={userLevel.currentXP} 
                  xpForNextLevel={userLevel.xpForNextLevel}
                  level={userLevel.level}
                  showLabel={false}
                  size="sm"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate hidden sm:block mt-1">{data.task || 'Sin actividad'}</p>
        </div>
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <div className={`text-base sm:text-xl font-bold ${agent.color}`}>{data.progress || 0}%</div>
          <div className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">PROGRESS</div>
          {/* Coin Display */}
          {userLevel.coins !== undefined && (
            <CoinDisplay coins={userLevel.coins} size="sm" showLabel={false} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TaskItem({ task, color }) {
  const statusIcons = {
    running: <Activity size={14} className="animate-spin" />,
    pending: <Clock size={14} />,
    completed: <Zap size={14} />
  }
  
  return (
    <div className="bg-gray-100/50 dark:bg-white/5 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{statusIcons[task.status]}</span>
          <span className="text-sm text-gray-900 dark:text-white">{task.name}</span>
        </div>
        <span className="text-xs" style={{ color }}>{task.progress}%</span>
      </div>
      <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${task.progress}%` }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// Terminal-style Log Entry
function LogEntry({ log, color, highlight }) {
  const isUser = log.type === 'user'
  const highlightMatch = highlight && log.text?.toLowerCase().includes(highlight.toLowerCase())
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex gap-2 text-xs py-1 border-b border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/5 ${highlightMatch ? 'bg-retro-yellow/10' : ''}`}
    >
      <span className="text-gray-500 dark:text-gray-600 font-mono min-w-[60px]">{log.time}</span>
      <span className={isUser ? 'text-retro-yellow' : 'text-retro-green'}>
        {isUser ? '↦' : '↤'}
      </span>
      <span className="text-gray-800 dark:text-gray-300 break-all">
        {highlightMatch ? (
          <HighlightText text={log.text} query={highlight} />
        ) : log.text}
      </span>
    </motion.div>
  )
}

// Highlight search text
function HighlightText({ text, query }) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-retro-yellow/40 text-retro-yellow rounded px-0.5">{part}</mark>
          : part
      )}
    </>
  )
}

// ========== FASE 2 COMPONENTS ==========

// 1. LOG SEARCH - Input para filtrar logs por texto
function LogSearch({ searchTerm, onSearchChange, resultsCount, totalCount }) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-black/60 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2">
      <Search size={16} className="text-retro-cyan" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar en logs..."
        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none"
      />
      {searchTerm && (
        <span className="text-xs text-gray-500">
          {resultsCount}/{totalCount}
        </span>
      )}
      {searchTerm && (
        <button 
          onClick={() => onSearchChange('')}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// 2. TASK TIMELINE - Timeline visual de tareas por agente
function TaskTimeline({ agent, agentData, color }) {
  const data = agentData?.[agent.id] || {}
  const tasks = data.tasks || []
  
  // Generar timeline simulado basado en logs recientes
  const timelineEvents = useMemo(() => {
    const logs = data.logs || []
    return logs.slice(0, 8).map((log, i) => ({
      id: i,
      time: log.time,
      title: log.type === 'user' ? 'Entrada de usuario' : 'Respuesta del agente',
      description: log.text?.substring(0, 60) + (log.text?.length > 60 ? '...' : ''),
      type: log.type
    }))
  }, [data.logs])
  
  const statusColors = {
    running: 'bg-retro-green',
    completed: 'bg-retro-cyan',
    pending: 'bg-retro-yellow',
    error: 'bg-retro-red'
  }
  
  return (
    <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-gray-200 dark:border-white/10 p-2 sm:p-3 md:p-4">
      <div className="flex items-center gap-2 mb-2 sm:mb-4">
        <History size={14} sm={16} style={{ color }} />
        <span className="text-xs sm:text-sm font-bold" style={{ color }}>TIMELINE DE TAREAS</span>
      </div>
      
      {timelineEvents.length === 0 ? (
        <div className="text-xs text-gray-500 italic">Sin actividad reciente...</div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1.5 sm:left-2 top-0 bottom-0 w-0.5 bg-white/10" />
          
          <div className="space-y-2 sm:space-y-3">
            {timelineEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-4 sm:pl-6"
              >
                {/* Timeline dot */}
                <div 
                  className={`absolute left-0 top-1 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border-2 border-black ${event.type === 'user' ? 'bg-retro-yellow' : 'bg-retro-green'}`}
                />
                
                <div className="text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-gray-500 font-mono">{event.time}</span>
                    <span className={event.type === 'user' ? 'text-retro-yellow' : 'text-retro-green'}>
                      {event.title}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-0.5 truncate">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 3. ACTIVITY CHARTS - Gráficos de uso de tokens y actividad por hora
function ActivityCharts({ agentStatus, agents = [] }) {
  const [hourlyActivity, setHourlyActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const agentsData = agentStatus?.agents || {}
  
  // Obtener token para usar como dependencia del useEffect
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token'))
  
  // Actualizar token cuando cambie el estado de autenticación
  useEffect(() => {
    const checkToken = () => {
      const newToken = localStorage.getItem('jwt_token')
      if (newToken !== token) {
        setToken(newToken)
      }
    }
    // Verificar token inmediatamente y cada segundo
    checkToken()
    const interval = setInterval(checkToken, 1000)
    return () => clearInterval(interval)
  }, [token])
  
  // Cargar datos reales de actividad por hora desde el API
  useEffect(() => {
    async function fetchHourlyActivity() {
      // Always try to get token fresh from localStorage
      let currentToken = localStorage.getItem('jwt_token')
      
      // If no token in localStorage, try to get from storage event (other tab)
      if (!currentToken) {
        try {
          const stored = localStorage.getItem('jwt_token')
          currentToken = stored
        } catch(e) {}
      }
      
      if (!currentToken) {
        return
      }
      
      try {
        const res = await fetch('/api/metrics/activity', {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          setHourlyActivity(data.hourly || [])
          setLoading(false)
        } else {
          console.warn('Activity fetch error:', res.status)
          setLoading(false)
        }
      } catch (e) {
        console.warn('Error fetching hourly activity:', e.message)
        setLoading(false)
      }
    }
    
    // Fetch after a short delay to ensure login completes
    setTimeout(fetchHourlyActivity, 1000)
    
    // Also try to fetch immediately 
    fetchHourlyActivity()
    
    // Refresh cada 10 segundos
    const interval = setInterval(fetchHourlyActivity, 10000)
    return () => clearInterval(interval)
  }, [])
  
  // Calcular tokens por agente
  const tokenData = useMemo(() => {
    return Object.entries(agentsData).map(([id, data]) => ({
      name: id,
      input: data.tokens?.input || 0,
      output: data.tokens?.output || 0,
      total: data.tokens?.total || 0,
      color: agents.find(a => a.id === id)?.glowColor || '#888'
    })).filter(d => d.total > 0)
  }, [agentsData])
  
  // Usar datos reales si existen, si no generar fallback con ceros (no aleatorio)
  const displayHourlyActivity = hourlyActivity.length > 0 ? hourlyActivity : Array.from({ length: 12 }, (_, i) => {
    const hour = new Date()
    hour.setHours(hour.getHours() - (11 - i))
    return {
      hour: hour.getHours().toString().padStart(2, '0') + ':00',
      activity: 0,
      input: 0,
      output: 0
    }
  })
  
  const maxToken = Math.max(...tokenData.map(d => d.total), 1)
  const maxActivity = Math.max(...displayHourlyActivity.map(h => h.activity), 1)
  
  return (
    <div className="space-y-4">
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-retro-purple"></div>
          <p className="text-xs text-gray-500 mt-2">Cargando datos de actividad...</p>
        </div>
      )}
      {/* Token Usage Chart */}
      <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-purple p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <BarChart3 size={14} sm={16} className="text-retro-purple" />
          <span className="text-xs sm:text-sm font-bold text-retro-purple">USO DE TOKENS</span>
        </div>
        
        <div className="space-y-2">
          {tokenData.length === 0 ? (
            <div className="text-xs text-gray-500 italic">Sin datos de tokens...</div>
          ) : (
            tokenData.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">{agent.name}</span>
                  <span className="text-gray-500">{agent.total.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(agent.total / maxToken) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Token Legend */}
        <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-retro-cyan" />
            <span className="text-[10px] sm:text-xs text-gray-500">Input</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-retro-pink" />
            <span className="text-[10px] sm:text-xs text-gray-500">Output</span>
          </div>
        </div>
      </div>
      
      {/* Hourly Activity Chart - DATOS REALES */}
      <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-cyan p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Activity size={14} sm={16} className="text-retro-cyan" />
          <span className="text-xs sm:text-sm font-bold text-retro-cyan">ACTIVIDAD POR HORA</span>
        </div>
        
        {/* SIMPLE Bar Chart - min 3px height */}
        <div className="flex items-end gap-px sm:gap-1 h-16 sm:h-20">
          {displayHourlyActivity.map((hour, i) => {
            const pct = maxActivity > 0 ? Math.round((hour.activity / maxActivity) * 100) : 0
            const minHeight = 3 // minimum 3px
            const heightPx = Math.max(Math.round(pct * 0.8), minHeight) // 80px * 1% = 0.8px
            return (
              <div key={hour.hour} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t"
                  style={{ 
                    height: `${heightPx}px`,
                    backgroundColor: '#06b6d4',
                    minWidth: '4px'
                  }}
                  title={`${hour.hour}: ${hour.activity} acts`}
                />
              </div>
            )
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-1 sm:mt-2">
          <span className="text-[8px] sm:text-[10px] text-gray-600">{displayHourlyActivity[0]?.hour}</span>
          <span className="text-[8px] sm:text-[10px] text-gray-600">{displayHourlyActivity[Math.floor(displayHourlyActivity.length/2)]?.hour}</span>
          <span className="text-[8px] sm:text-[10px] text-gray-600">{displayHourlyActivity[displayHourlyActivity.length-1]?.hour}</span>
        </div>
      </div>
    </div>
  )
}

// 4. ERROR NOTIFICATIONS - Alertas cuando un agente tiene errores
function ErrorNotifications({ agentsData, onAgentClick }) {
  const [errors, setErrors] = useState([])
  const [dismissed, setDismissed] = useState(new Set())
  
  useEffect(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)

    const newErrors = Object.entries(agentsData || {})
      .filter(([id, data]) => {
        // Only show if status is error AND error is recent (within last hour)
        if (data.status !== 'error') return false
        // If no lastError timestamp, check if session is recent
        if (data.lastError) {
          const errorTime = new Date(data.lastError).getTime()
          return errorTime > oneHourAgo
        }
        // If no timestamp, only show if session was updated recently
        if (data.sessionStartTime) {
          const sessionTime = new Date(data.sessionStartTime).getTime()
          return sessionTime > oneHourAgo
        }
        return false
      })
      .map(([id, data]) => ({ id, ...data }))

    // Filtrar errores no dismissidos
    const activeErrors = newErrors.filter(e => !dismissed.has(e.id))
    setErrors(activeErrors)

    // DO NOT scroll - let user stay at their current position
    // The page should not auto-scroll when errors appear
  }, [agentsData, dismissed])
  
  // Auto-dismiss errors after 10 seconds
  useEffect(() => {
    if (errors.length === 0) return

    const timer = setTimeout(() => {
      setDismissed(prev => {
        const newDismissed = new Set(prev)
        errors.forEach(e => newDismissed.add(e.id))
        return newDismissed
      })
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [errors])

  const dismissError = (id) => {
    setDismissed(prev => new Set([...prev, id]))
  }

  const dismissAll = () => {
    setDismissed(prev => new Set([...prev, ...errors.map(e => e.id)]))
  }

  if (errors.length === 0) return null

  return (
    <div className="fixed top-16 right-2 left-2 md:left-auto md:right-4 z-40 space-y-2 md:max-w-xs" style={{ transform: 'translateZ(0)' }}>
      <AnimatePresence>
        {errors.slice(0, 2).map((error) => ( // Max 2 errors shown
          <motion.div
            key={error.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/90 border-2 border-retro-red rounded-lg p-2 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-retro-red flex-shrink-0" />
              <span className="text-white text-xs font-bold flex-1 truncate">{error.id.replace('er-', '')}</span>
              <button
                onClick={() => dismissError(error.id)}
                className="text-gray-400 hover:text-white p-2 -m-1 rounded bg-white/10"
                aria-label="Cerrar error"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {errors.length > 0 && (
        <button
          onClick={dismissAll}
          className="text-xs text-white/70 hover:text-white bg-black/50 rounded px-3 py-1.5 block w-full"
        >
          Cerrar todos ({errors.length})
        </button>
      )}
    </div>
  )
}

// =============================================================================
// FASE 1: NUEVOS COMPONENTES DE ALTO IMPACTO
// =============================================================================

// 1. GLOBAL METRICS DASHBOARD - Panel de métricas global con gráficos completos
function GlobalMetricsDashboard({ agentStatus, agents = [] }) {
  const [activeView, setActiveView] = useState('tokens') // 'tokens' | 'activity' | 'uptime'
  const [hourlyData, setHourlyData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchActivity() {
      const token = localStorage.getItem('jwt_token')
      if (!token) {
        setLoading(false)
        return
      }
      
      try {
        const res = await fetch('/api/metrics/activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setHourlyData(data.hourly || [])
        }
      } catch (e) {
        console.warn('Error fetching activity:', e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchActivity()
    const interval = setInterval(fetchActivity, 15000)
    return () => clearInterval(interval)
  }, [])
  
  const agentData = agentStatus?.agents || {}
  const metrics = agentStatus?.metrics || {}
  
  // Calcular métricas
  const totalTokens = metrics?.tokens?.total || Object.values(agentData).reduce((sum, a) => sum + (a.tokens?.total || 0), 0)
  const inputTokens = metrics?.tokens?.input || Object.values(agentData).reduce((sum, a) => sum + (a.tokens?.input || 0), 0)
  const outputTokens = metrics?.tokens?.output || Object.values(agentData).reduce((sum, a) => sum + (a.tokens?.output || 0), 0)

  const activeAgents = Object.values(agentData).filter(a => a.status === 'running' || a.status === 'active').length
  const idleAgents = Object.values(agentData).filter(a => a.status === 'idle').length
  const errorAgents = Object.values(agentData).filter(a => a.status === 'error').length

  // Calcular uptime real desde datos del servidor
  const calculateUptime = () => {
    const agentUptimes = Object.values(agentData).map(a => a.uptime || 0).filter(u => u > 0)
    if (agentUptimes.length === 0) return 0
    const avgUptime = agentUptimes.reduce((a, b) => a + b, 0) / agentUptimes.length
    // Convert hours to percentage (cap at 99.99% for very long uptimes)
    return Math.min(99.99, avgUptime)
  }
  const uptime = calculateUptime()
  
  // Datos para gráfico de tokens por agente
  const tokenByAgent = Object.entries(agentData).map(([id, data]) => ({
    name: id.replace('er-', ''),
    input: data.tokens?.input || 0,
    output: data.tokens?.output || 0,
    total: data.tokens?.total || 0,
    color: agents.find(a => a.id === id)?.color || '#888'
  }))
  
  const maxToken = Math.max(...tokenByAgent.map(t => t.total), 1)
  
  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-retro-purple"></div>
          <p className="text-xs text-gray-500 mt-2">Cargando métricas globales...</p>
        </div>
      )}
      {/* Tabs de navegación */}
      <div className="flex gap-2">
        {[
          { id: 'tokens', label: 'Tokens', icon: Zap },
          { id: 'activity', label: 'Actividad', icon: Activity },
          { id: 'uptime', label: 'Uptime', icon: Server }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === tab.id 
                ? 'bg-retro-purple text-white' 
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Vista de Tokens */}
      {activeView === 'tokens' && (
        <div className="space-y-4">
          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-retro-cyan/20 border border-retro-cyan rounded-lg p-4">
              <div className="text-xs text-retro-cyan mb-1">INPUT TOKENS</div>
              <div className="text-2xl font-bold text-white">{inputTokens.toLocaleString()}</div>
            </div>
            <div className="bg-retro-pink/20 border border-retro-pink rounded-lg p-4">
              <div className="text-xs text-retro-pink mb-1">OUTPUT TOKENS</div>
              <div className="text-2xl font-bold text-white">{outputTokens.toLocaleString()}</div>
            </div>
            <div className="bg-retro-yellow/20 border border-retro-yellow rounded-lg p-4">
              <div className="text-xs text-retro-yellow mb-1">TOTAL TOKENS</div>
              <div className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Gráfico de barras por agente */}
          <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-purple p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-retro-purple" />
              <span className="text-sm font-bold text-retro-purple">TOKENS POR AGENTE</span>
            </div>
            
            <div className="space-y-3">
              {tokenByAgent.length === 0 ? (
                <div className="text-xs text-gray-500 italic">Sin datos...</div>
              ) : (
                tokenByAgent.map((agent, i) => (
                  <div key={agent.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400 capitalize">{agent.name}</span>
                      <span className="text-gray-500">{agent.total.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1 h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(agent.input / maxToken) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full bg-retro-cyan rounded-l"
                        style={{ maxWidth: '50%' }}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(agent.output / maxToken) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 + 0.1 }}
                        className="h-full bg-retro-pink rounded-r"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-retro-cyan" />
                <span className="text-xs text-gray-500">Input</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-retro-pink" />
                <span className="text-xs text-gray-500">Output</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Vista de Actividad */}
      {activeView === 'activity' && (
        <div className="space-y-4">
          {/* Estadísticas de actividad */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-retro-green/20 border border-retro-green rounded-lg p-4">
              <div className="text-xs text-retro-green mb-1">AGENTES ACTIVOS</div>
              <div className="text-2xl font-bold text-white">{activeAgents}</div>
            </div>
            <div className="bg-retro-yellow/20 border border-retro-yellow rounded-lg p-4">
              <div className="text-xs text-retro-yellow mb-1">AGENTES IDLE</div>
              <div className="text-2xl font-bold text-white">{idleAgents}</div>
            </div>
            <div className="bg-retro-red/20 border border-retro-red rounded-lg p-4">
              <div className="text-xs text-retro-red mb-1">AGENTES ERROR</div>
              <div className="text-2xl font-bold text-white">{errorAgents}</div>
            </div>
          </div>
          
          {/* Gráfico de actividad por hora */}
          <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-cyan p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-retro-cyan" />
              <span className="text-sm font-bold text-retro-cyan">ACTIVIDAD POR HORA (HOY)</span>
            </div>
            
            <div className="flex items-end gap-1 h-32">
              {!hourlyData || hourlyData.length === 0 ? (
                Array.from({ length: 12 }, (_, i) => {
                  const hour = new Date()
                  hour.setHours(hour.getHours() - (11 - i))
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-700 rounded-t" style={{ height: '3px' }} />
                    </div>
                  )
                })
              ) : (
                hourlyData.map((hour, i) => {
                  const maxActivity = Math.max(...hourlyData.map(h => h.activity), 1)
                  const pct = Math.round((hour.activity / maxActivity) * 100)
                  const heightPx = Math.max(Math.round(pct * 1.28), 3)
                  return (
                    <div key={hour.hour} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-retro-cyan to-retro-cyan/50"
                        style={{ height: `${heightPx}px`, minHeight: '3px' }}
                        title={`${hour.hour}: ${hour.activity} acts`}
                      />
                    </div>
                  )
                })
              )}
            </div>
            
            <div className="flex justify-between mt-2">
              <span className="text-[8px] text-gray-600">
                {hourlyData[0]?.hour || '--:--'}
              </span>
              <span className="text-[8px] text-gray-600">
                {hourlyData[Math.floor(hourlyData.length/2)]?.hour || '--:--'}
              </span>
              <span className="text-[8px] text-gray-600">
                {hourlyData[hourlyData.length-1]?.hour || '--:--'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Vista de Uptime */}
      {activeView === 'uptime' && (
        <div className="space-y-4">
          {/* Uptime general */}
          <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-green p-6 text-center">
            <Gauge size={48} className="mx-auto text-retro-green mb-2" />
            <div className="text-4xl font-bold text-retro-green">{uptime.toFixed(2)}%</div>
            <div className="text-sm text-gray-500 mt-1">UPTIME DEL SISTEMA</div>
            <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uptime}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-retro-green rounded-full"
              />
            </div>
          </div>
          
          {/* Uptime por agente */}
          <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-cyan p-4">
            <div className="flex items-center gap-2 mb-4">
              <Server size={16} className="text-retro-cyan" />
              <span className="text-sm font-bold text-retro-cyan">UPTIME POR AGENTE</span>
            </div>
            
            <div className="space-y-3">
              {Object.entries(agentData).map(([id, data]) => {
                // Usar uptime real del servidor, con fallback
                const agentUptime = data.uptime
                  ? Math.min(99.99, data.uptime)
                  : (data.status === 'error' ? 0 : data.status === 'offline' ? 0 : 0)
                return (
                  <div key={id} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-400 capitalize">{id.replace('er-', '')}</div>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${agentUptime}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          agentUptime >= 99 ? 'bg-retro-green' : 
                          agentUptime >= 95 ? 'bg-retro-yellow' : 'bg-retro-red'
                        }`}
                      />
                    </div>
                    <div className="w-12 text-xs text-right" style={{ 
                      color: agentUptime >= 99 ? '#22c55e' : agentUptime >= 95 ? '#f59e0b' : '#ef4444'
                    }}>
                      {agentUptime.toFixed(1)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 2. ACTIVITY HEATMAP - Heatmap de actividad semanal (DATOS REALES)
function ActivityHeatmap({ agentStatus, hourlyActivity = [], dailyActivity = [], agents = [] }) {
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Usar datos reales de actividad del API
    const days = []
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Safe hourly activity
    const safeHourlyActivity = hourlyActivity || []
    const todayActivity = safeHourlyActivity.reduce((sum, h) => sum + (h.activity || 0), 0)
    const todayTokens = safeHourlyActivity.reduce((sum, h) => sum + (h.input || 0) + (h.output || 0), 0)
    
    // Safe daily activity - create a lookup map
    const dailyMap = {}
    ;(dailyActivity || []).forEach(d => {
      dailyMap[d.date] = d
    })
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const isToday = dateStr === todayStr
      
      // Usar datos reales del API (dailyActivity) para todos los días
      const dailyData = dailyMap[dateStr]
      
      // Si hay datos reales del API usarlos, si no usar datos de hoy
      const hasRealData = dailyData && (dailyData.activity > 0 || dailyData.tokens > 0)
      
      const dayData = {
        date: dateStr,
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNum: date.getDate(),
        activity: hasRealData ? dailyData.activity : todayActivity,
        sessions: hasRealData ? dailyData.sessions : Math.max(1, Math.floor(todayTokens / 5000)),
        tokens: hasRealData ? dailyData.tokens : todayTokens,
        agents: (agentStatus?.agents ? Object.keys(agentStatus.agents) : []).map(id => ({
          id,
          active: hasRealData ? dailyData.activity > 0 : (safeHourlyActivity.length > 0),
          tokens: hasRealData ? Math.floor(dailyData.tokens / Math.max(1, Object.keys(agentStatus?.agents || {}).length)) : Math.floor(todayTokens / Math.max(1, Object.keys(agentStatus?.agents || {}).length))
        }))
      }
      days.push(dayData)
    }
    
    setWeeklyData(days)
    setLoading(false)
  }, [agentStatus, hourlyActivity, dailyActivity])
  
  // Función para obtener color según nivel de actividad
  const getActivityColor = (level) => {
    if (level === 0) return 'bg-gray-800'
    if (level < 25) return 'bg-retro-green/20'
    if (level < 50) return 'bg-retro-green/40'
    if (level < 75) return 'bg-retro-green/60'
    return 'bg-retro-green/80'
  }
  
  const maxTokens = Math.max(...weeklyData.map(d => d.tokens), 1)
  
  return (
    <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-yellow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-retro-yellow" />
          <span className="text-sm font-bold text-retro-yellow">HISTORIAL DE ACTIVIDAD (7 DÍAS)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Menos</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-gray-800" />
            <div className="w-3 h-3 rounded bg-retro-green/20" />
            <div className="w-3 h-3 rounded bg-retro-green/40" />
            <div className="w-3 h-3 rounded bg-retro-green/60" />
            <div className="w-3 h-3 rounded bg-retro-green/80" />
          </div>
          <span>Más</span>
        </div>
      </div>
      
      {loading ? (
        <div className="text-xs text-gray-500 italic">Cargando historial...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-center"
            >
              {/* Día de la semana */}
              <div className="text-[10px] text-gray-500 uppercase mb-1">
                {day.dayName}
              </div>
              
              {/* Heatmap cell */}
              <div
                className={`w-full aspect-square rounded-lg ${getActivityColor(day.activity)} cursor-pointer transition-all hover:scale-105`}
                title={`${day.date}: ${day.activity}% actividad, ${day.tokens.toLocaleString()} tokens`}
              >
                {/* Número del día */}
                <div className="text-xs font-bold mt-1">{day.dayNum}</div>
              </div>
              
              {/* Tokens del día */}
              <div className="text-[9px] text-gray-500 mt-1">
                {day.tokens > 0 ? `${(day.tokens / 1000).toFixed(1)}k` : '0'}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Leyenda de actividad por agente */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-500 mb-2">AGENTES ACTIVOS POR DÍA</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(agentStatus?.agents || {}).map(agentId => (
            <div key={agentId} className="flex items-center gap-1 text-xs">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: agents.find(a => a.id === agentId)?.color || '#888' }}
              />
              <span className="text-gray-400 capitalize">{agentId.replace('er-', '')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 3. ENHANCED ERROR NOTIFICATIONS - Alertas de errores mejoradas con historial
function EnhancedErrorNotifications({ agentsData, onAgentClick }) {
  const [errors, setErrors] = useState([])
  const [dismissed, setDismissed] = useState(new Set())
  const [expanded, setExpanded] = useState(false)
  
  useEffect(() => {
    const newErrors = Object.entries(agentsData || {})
      .filter(([id, data]) => data.status === 'error')
      .map(([id, data]) => ({ 
        id, 
        ...data,
        timestamp: new Date().toISOString()
      }))
    
    const activeErrors = newErrors.filter(e => !dismissed.has(e.id))
    setErrors(activeErrors)
  }, [agentsData, dismissed])
  
  const dismissError = (id) => {
    setDismissed(prev => new Set([...prev, id]))
  }
  
  const dismissAll = () => {
    setDismissed(prev => new Set([...prev, ...errors.map(e => e.id)]))
  }
  
  // Estado general del sistema
  const hasErrors = errors.length > 0
  const errorCount = errors.length
  
  if (!hasErrors) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {/* Banner de error principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-retro-red/90 border-2 border-retro-red rounded-lg p-3 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-white" />
            <span className="text-white font-bold">
              {errorCount === 1 ? '1 AGENTE CON ERROR' : `${errorCount} AGENTES CON ERROR`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-white/80 hover:text-white text-xs underline"
            >
              {expanded ? 'Ocultar' : 'Ver detalles'}
            </button>
            <button 
              onClick={dismissAll}
              className="text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Lista expandida de errores */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {errors.map((error) => (
                <div 
                  key={error.id}
                  className="bg-white/10 rounded p-2 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <PixelCreature type={error.id} size={24} />
                      <span className="text-white text-sm font-medium capitalize">
                        {error.id.replace('er-', '')}
                      </span>
                    </div>
                    <p className="text-white/70 text-xs truncate mt-1">
                      {error.task || 'Error desconocido'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      // Use the error object directly - it already contains all agent data from agentsData
                      onAgentClick({ id: error.id, ...error })
                      dismissError(error.id)
                    }}
                    className="text-white/80 hover:text-white text-xs underline ml-2"
                  >
                    Ver
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Notificaciones individuales (cuando no está expandido) */}
      {!expanded && errors.slice(0, 2).map((error) => (
        <motion.div
          key={error.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="bg-retro-red/20 border border-retro-red rounded-lg p-3"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-retro-red flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-retro-red font-bold text-sm capitalize">
                  {error.id.replace('er-', '')}
                </span>
                <button 
                  onClick={() => dismissError(error.id)}
                  className="text-gray-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-gray-400 text-xs truncate">{error.task || 'Error desconocido'}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// 4. GLOBAL EXPORT PANEL - Panel de exportación de datos globales
function GlobalExportPanel({ agentStatus }) {
  const [showMenu, setShowMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const exportMetricsJSON = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('jwt_token')
      
      // Recopilar todos los datos
      const data = {
        exportedAt: new Date().toISOString(),
        summary: {
          totalTokens: agentStatus?.metrics?.tokens?.total || 0,
          inputTokens: agentStatus?.metrics?.tokens?.input || 0,
          outputTokens: agentStatus?.metrics?.tokens?.output || 0,
          activeAgents: Object.values(agentStatus?.agents || {}).filter(a => a.status === 'running' || a.status === 'active').length,
          idleAgents: Object.values(agentStatus?.agents || {}).filter(a => a.status === 'idle').length,
          errorAgents: Object.values(agentStatus?.agents || {}).filter(a => a.status === 'error').length
        },
        agents: Object.entries(agentStatus?.agents || {}).map(([id, data]) => ({
          id,
          status: data.status,
          task: data.task,
          progress: data.progress,
          tokens: data.tokens,
          logs: data.logs?.slice(0, 50) || [] // Limitar a 50 logs por agente
        })),
        communications: agentStatus?.communications || []
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      downloadBlob(blob, `metrics-${Date.now()}.json`)
    } catch (e) {
      console.error('Export error:', e)
    } finally {
      setExporting(false)
      setShowMenu(false)
    }
  }
  
  const exportMetricsCSV = () => {
    setExporting(true)
    try {
      // CSV de métricas por agente
      const headers = ['Agent ID', 'Status', 'Task', 'Progress', 'Input Tokens', 'Output Tokens', 'Total Tokens']
      const rows = Object.entries(agentStatus?.agents || {}).map(([id, data]) => [
        id,
        data.status || 'unknown',
        (data.task || '').replace(/,/g, ';'),
        data.progress || 0,
        data.tokens?.input || 0,
        data.tokens?.output || 0,
        data.tokens?.total || 0
      ])
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      downloadBlob(blob, `metrics-${Date.now()}.csv`)
    } catch (e) {
      console.error('Export error:', e)
    } finally {
      setExporting(false)
      setShowMenu(false)
    }
  }
  
  const exportLogsTXT = () => {
    setExporting(true)
    try {
      // Exportar todos los logs de todos los agentes
      let text = `AGENT DASHBOARD - EXPORT DE LOGS\n`
      text += `Exportado: ${new Date().toISOString()}\n`
      text += `${'='.repeat(50)}\n\n`
      
      Object.entries(agentStatus?.agents || {}).forEach(([agentId, data]) => {
        text += `[${agentId.toUpperCase()}]\n`
        text += `Status: ${data.status}\n`
        text += `Task: ${data.task}\n`
        text += `-`.repeat(30) + '\n'
        
        const logs = data.logs || []
        if (logs.length === 0) {
          text += 'Sin logs disponibles\n'
        } else {
          logs.forEach(log => {
            text += `[${log.time}] ${log.type?.toUpperCase()}: ${log.text}\n`
          })
        }
        text += '\n'
      })
      
      const blob = new Blob([text], { type: 'text/plain' })
      downloadBlob(blob, `logs-${Date.now()}.txt`)
    } catch (e) {
      console.error('Export error:', e)
    } finally {
      setExporting(false)
      setShowMenu(false)
    }
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          exporting 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-retro-purple hover:bg-retro-purple/80 text-white'
        }`}>
        {exporting ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {exporting ? 'Exportando...' : 'Exportar Datos'}
      </button>
      
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 bg-white dark:bg-black border border-gray-200 dark:border-white/20 rounded-lg shadow-xl overflow-hidden z-20 min-w-[200px]"
          >
            <div className="p-2 border-b border-gray-200 dark:border-white/10">
              <span className="text-xs text-gray-500">Seleccionar formato:</span>
            </div>
            <button
              onClick={exportMetricsJSON}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <FileJson size={18} className="text-retro-yellow" />
              <div className="text-left">
                <div className="font-medium">JSON Completo</div>
                <div className="text-xs text-gray-500">Métricas + logs + comunicaciones</div>
              </div>
            </button>
            <button
              onClick={exportMetricsCSV}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <FileSpreadsheet size={18} className="text-retro-green" />
              <div className="text-left">
                <div className="font-medium">CSV Métricas</div>
                <div className="text-xs text-gray-500">Hoja de cálculo Excel/Numbers</div>
              </div>
            </button>
            <button
              onClick={exportLogsTXT}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <FileText size={18} className="text-retro-cyan" />
              <div className="text-left">
                <div className="font-medium">TXT Logs</div>
                <div className="text-xs text-gray-500">Todos los logs formateados</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 5. EXPORT LOGS - Botón para descargar logs como .txt/.json
function ExportLogs({ agent, logs, color }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const exportAsJSON = () => {
    const data = {
      agent: agent.name,
      exportedAt: new Date().toISOString(),
      logs: logs.map(l => ({
        time: l.time,
        type: l.type,
        text: l.text
      }))
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `${agent.id}-logs-${Date.now()}.json`)
    setShowMenu(false)
  }
  
  const exportAsTXT = () => {
    const text = logs
      .map(l => `[${l.time}] ${l.type?.toUpperCase()}: ${l.text}`)
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    downloadBlob(blob, `${agent.id}-logs-${Date.now()}.txt`)
    setShowMenu(false)
  }
  
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors bg-white/5 dark:hover:bg-white/10 px-2 py-1 rounded"
      >
        <Download size={12} />
        Exportar
      </button>
      
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-1 bg-white dark:bg-black border border-gray-200 dark:border-white/20 rounded-lg shadow-xl overflow-hidden z-10"
          >
            <button
              onClick={exportAsJSON}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <FileJson size={14} className="text-retro-yellow" />
              Exportar como JSON
            </button>
            <button
              onClick={exportAsTXT}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <FileText size={14} className="text-retro-cyan" />
              Exportar como TXT
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Full-screen Log Modal with Search & Export (FASE 2)
function LogModal({ agent, logs, onClose }) {
  const modalRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])
  
  // Filtrar logs por búsqueda
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs
    return logs.filter(log => 
      log.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [logs, searchTerm])
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100/90 dark:bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        ref={modalRef}
        className="bg-white dark:bg-black border-2 rounded-xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col"
        style={{ borderColor: agent.glowColor }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between" style={{ backgroundColor: `${agent.glowColor}15` }}>
          <div className="flex items-center gap-3">
            <PixelCreature type={agent.id} size={48} image={agent.image} />
            <div>
              <h2 className={`text-xl font-bold ${agent.color}`}>{agent.name}</h2>
              <p className="text-xs text-gray-500">
                {searchTerm ? `${filteredLogs.length}/${logs.length} logs` : `${logs.length} logs`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        
        {/* Search & Export Bar (FASE 2) */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 flex items-center gap-3">
          <LogSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultsCount={filteredLogs.length}
            totalCount={logs.length}
          />
          <ExportLogs agent={agent} logs={filteredLogs} color={agent.glowColor} />
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-black/50 custom-scrollbar">
          <div className="font-mono text-sm">
            <AnimatePresence>
              {filteredLogs.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  {searchTerm ? 'No se encontraron resultados' : 'Esperando logs...'}
                </div>
              ) : (
                filteredLogs.map((log, i) => (
                  <LogEntry key={i} log={log} color={agent.glowColor} highlight={searchTerm} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-3 border-t border-white/10 text-center">
          <span className="text-xs text-gray-500">Presiona ESC o click fuera para cerrar</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Agent Detail with Terminal Logs, Search & Timeline (FASE 2)
function AgentDetail({ agent, agentData, levelData }) {
  const data = agentData?.[agent.id] || {}
  const userLevel = levelData?.user || {}
  const logs = data.logs || []
  const [expanded, setExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filtrar logs localmente
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs
    return logs.filter(log => 
      log.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [logs, searchTerm])
  
  // Determinar clase de estado
  const getStatusClass = (status) => {
    switch (status) {
      case 'running':
        return 'bg-retro-green/20 text-retro-green'
      case 'active':
        return 'bg-retro-cyan/20 text-retro-cyan'
      case 'idle':
        return 'bg-retro-yellow/20 text-retro-yellow'
      case 'error':
        return 'bg-retro-red/20 text-retro-red'
      default:
        return 'bg-white/10 text-gray-400'
    }
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/60 dark:bg-black/60 rounded-lg border-2 overflow-hidden"
        style={{ borderColor: data.status === 'error' ? '#ef4444' : agent.glowColor }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10" style={{ backgroundColor: `${data.status === 'error' ? '#ef444415' : agent.glowColor}15` }}>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <PixelCreature type={agent.id} size={40} sm={48} md={64} isTalking={data.status === 'running'} image={agent.image} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <h2 className={`text-base sm:text-lg md:text-xl font-bold ${agent.color} truncate`}>{agent.name}</h2>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${getStatusClass(data.status)}`}>
                  ● {data.status?.toUpperCase() || 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1 truncate">{data.task || 'Sin actividad'}</p>
            </div>
          </div>
          {/* Progress - below header info, not overlapping */}
          {userLevel.level && userLevel.xpForNextLevel && (
            <div className="w-full mt-3">
              <LevelProgressBar 
                currentXP={userLevel.currentXP} 
                xpForNextLevel={userLevel.xpForNextLevel}
                level={userLevel.level}
                showLabel={true}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Terminal Logs - manual scroll + search (FASE 2) */}
        <div className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Terminal size={12} sm={14} className="text-retro-green" />
              <span className="text-xs text-gray-500 font-mono">LIVE LOGS</span>
              <span className="text-xs text-gray-600">
                {searchTerm ? `(${filteredLogs.length}/${logs.length})` : `(${logs.length})`}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
              {logs.length > 0 && (
                <>
                  {/* Search inline */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filtrar..."
                      className="w-20 sm:w-24 bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded px-2 py-1 text-xs text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-retro-cyan"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <ExportLogs agent={agent} logs={filteredLogs} color={agent.glowColor} />
                  <button 
                    onClick={() => setExpanded(true)}
                    className="flex items-center gap-1 text-xs text-retro-cyan hover:text-retro-cyan/80 transition-colors"
                  >
                    <Maximize2 size={12} />
                    <span className="hidden sm:inline">Expandir</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-black/90 rounded-lg border border-gray-300 dark:border-white/10 p-2 sm:p-3 h-40 sm:h-52 md:h-64 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Esperando logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-gray-600 italic">No hay resultados para "{searchTerm}"</div>
            ) : (
              filteredLogs.map((log, i) => (
                <LogEntry key={i} log={log} color={agent.glowColor} highlight={searchTerm} />
              ))
            )}
          </div>
          
          {data.started && (
            <div className="mt-2 sm:mt-3 text-xs text-gray-500">
              Iniciado: <span className="text-retro-cyan font-mono">{data.started}</span>
            </div>
          )}
        </div>

        {/* Task Timeline (FASE 2) */}
        <div className="p-2 sm:p-3 md:p-4 pt-0">
          <TaskTimeline agent={agent} agentData={agentData} color={agent.glowColor} />
        </div>
      </motion.div>
      
      {/* Full-screen Modal */}
      <AnimatePresence>
        {expanded && (
          <LogModal 
            agent={agent} 
            logs={logs} 
            onClose={() => setExpanded(false)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}

function App() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Persistencia: última pestaña activa
  const [lastActiveTab, setLastActiveTab] = useLastActiveTab()
  const [activeTab, setActiveTab] = useState(lastActiveTab)
  
  // Persistencia: último agente seleccionado
  const [lastSelectedAgentId, setLastSelectedAgentId] = useLastSelectedAgent()
  const [selectedAgent, setSelectedAgent] = useState(null)
  
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Persistencia: decoración activa y preferencias UI
  const [savedActiveDecoration, setSavedActiveDecoration] = useActiveDecoration()
  const [savedOwnedDecorations, setSavedOwnedDecorations] = useOwnedDecorations()
  const { preferences: uiPreferences } = useUIPreferences()
  
  // Estados para decoraciones
  const [showShop, setShowShop] = useState(false)
  const { 
    ownedDecorations, 
    activeDecoration, 
    buyDecoration, 
    activateDecoration, 
    deactivateDecoration,
    setOwnedDecorations,
    setActiveDecoration
  } = useDecorations(savedOwnedDecorations)
  
  // Sincronizar decoraciones guardadas con el estado
  useEffect(() => {
    setOwnedDecorations(savedOwnedDecorations)
  }, [savedOwnedDecorations])

  useEffect(() => {
    if (savedActiveDecoration) {
      setActiveDecoration(savedActiveDecoration)
    }
  }, [savedActiveDecoration])
  
  const { status: agentStatus, loading: statusLoading, error: statusError, connected, reconnect } = useAgentStatus()
  
  // Construir lista de agentes dinámicamente desde el API
  // Si no hay datos del API, usar STATIC_AGENTS como fallback
  const agents = useMemo(() => {
    const apiAgents = agentStatus?.agents || {}
    const apiAgentIds = Object.keys(apiAgents)

    if (apiAgentIds.length > 0) {
      // Convertir agentes del API al formato del frontend
      return apiAgentIds.map(id => apiAgentToFrontend(id, apiAgents[id]))
    }

    // Fallback a lista estática
    return STATIC_AGENTS
  }, [agentStatus]) || STATIC_AGENTS // Fallback extra por seguridad
  
  // Estado para detectar cambio de agentes y resetear selectedAgent si es necesario
  const [prevAgentIds, setPrevAgentIds] = useState(() => Object.keys(agentStatus?.agents || {}))
  
  // Actualizar selectedAgent si el agente seleccionado ya no existe en la nueva lista
  useEffect(() => {
    const currentAgentIds = Object.keys(agentStatus?.agents || {})
    const currentAgentIdSet = new Set(currentAgentIds)
    
    // Inicializar selectedAgent si es null o si el agente seleccionado ya no existe
    if (agents.length > 0 && (!selectedAgent || !currentAgentIdSet.has(selectedAgent.id))) {
      // Buscar coincidencia por nombre o fallback al primero
      const match = agents.find(a => 
        a.id === lastSelectedAgentId || 
        a.name.toLowerCase().includes(lastSelectedAgentId?.toLowerCase() || '')
      )
      setSelectedAgent(match || agents[0])
    }
  }, [agents, agentStatus, lastSelectedAgentId, selectedAgent])
  
  // Estados para nivel de usuario y animación de level up
  const [userLevelData, setUserLevelData] = useState(null)
  const [levelData, setLevelData] = useState(null)
  const [levelUpData, setLevelUpData] = useState(null)
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false)
  
  // Usar ref para evitar bucle infinito con previousLevel
  const previousLevelRef = useRef(null)
  
  // Fix 1: Define hourlyActivity and dailyActivity at App level for heatmap
  const [hourlyActivity, setHourlyActivity] = useState([])
  const [dailyActivity, setDailyActivity] = useState([])
  
  // Fetch hourly and daily activity data for heatmap
  useEffect(() => {
    async function fetchActivityData() {
      const token = localStorage.getItem('jwt_token')
      if (!token) return
      
      try {
        const res = await fetch('/api/metrics/activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setHourlyActivity(data.hourly || [])
          setDailyActivity(data.daily || [])
        }
      } catch (e) {
        console.warn('Error fetching activity data:', e.message)
      }
    }
    
    fetchActivityData()
    const interval = setInterval(fetchActivityData, 10000)
    return () => clearInterval(interval)
  }, [])
  
  // Persistencia: guardar pestaña activa cuando cambie
  useEffect(() => {
    setLastActiveTab(activeTab)
  }, [activeTab, setLastSelectedAgentId])
  
  // Persistencia: guardar agente seleccionado cuando cambie
  useEffect(() => {
    if (selectedAgent) {
      setLastSelectedAgentId(selectedAgent.id)
    }
  }, [selectedAgent, setLastSelectedAgentId])
  
  // Persistencia: guardar decoración activa cuando compre o active
  const handleActivateDecoration = (decorationId) => {
    activateDecoration(decorationId)
    setSavedActiveDecoration(decorationId)
  }
  
  const handleDeactivateDecoration = () => {
    deactivateDecoration()
    setSavedActiveDecoration(null)
  }
  
  const handleBuyDecoration = (decoration) => {
    // Verificar que el usuario tiene suficientes Leuros
    const currentCoins = levelData?.user?.coins || 0
    if (currentCoins < decoration.price) {
      alert('No tienes suficientes Leuros para comprar esta decoración')
      return
    }
    
    // Decrementar los Leuros
    const newCoins = currentCoins - decoration.price
    
    // Actualizar el estado local
    setLevelData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        coins: newCoins
      }
    }))
    
    // Añadir la decoración al inventario
    buyDecoration(decoration)
    setSavedOwnedDecorations(prev => [...prev, decoration.id])
  }
  
  // Fetch level data
  useEffect(() => {
    async function fetchLevelData() {
      const token = localStorage.getItem('jwt_token')
      if (!token) return
      
      try {
        const res = await fetch('/api/levels', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setLevelData(data)
        }
      } catch (e) {
        console.warn('Error fetching level data:', e.message)
      }
    }
    
    fetchLevelData()
    const interval = setInterval(fetchLevelData, 30000)
    return () => clearInterval(interval)
  }, [])
  
  // Mensajes: primero los reales del backend, luego fallback simulado
  const [agentMessages, setAgentMessages] = useState(() => {
    // Inicializar con mensajes del backend si existen
    return [] // Se llena con useEffect
  })
  const [talkingAgent, setTalkingAgent] = useState(null)

  useEffect(() => {
    // Verificar token JWT al inicio
    const token = localStorage.getItem('jwt_token')
    const expiry = localStorage.getItem('jwt_expiry')
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true)
    } else if (token) {
      // Token existe pero expiró
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('jwt_expiry')
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Actualizar mensajes cuando lleguen datos reales del backend
  useEffect(() => {
    if (agentStatus?.communications?.length > 0) {
      setAgentMessages(agentStatus.communications)
    }
  }, [agentStatus?.communications])

  // Simular mensajes si no hay reales (fallback)
  useEffect(() => {
    if (agentStatus?.communications?.length > 0) return // Ya hay mensajes reales del backend
    if (agentMessages.length > 0) return // Ya hay mensajes (reales o simulados)
    
    const messages = [
      { from: 'er-hineda', to: 'coder', content: 'Samuel quiere métricas reales en el dashboard' },
      { from: 'coder', to: 'er-hineda', content: 'Entendido. Conectando API segura...' },
      { from: 'netops', to: 'er-hineda', content: 'Servidor estable. Uptime: 99.9%' },
      { from: 'pr-reviewer', to: 'er-hineda', content: 'Escaneando commits... sin issues' },
    ]
    
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)]
      setAgentMessages(prev => [...prev.slice(-10), { 
        ...msg, 
        time: new Date().toLocaleTimeString('es-ES', { hour12: false }) 
      }])
      setTalkingAgent(msg.from)
      setTimeout(() => setTalkingAgent(null), 1500)
    }, 8000)
    
    return () => clearInterval(interval)
  }, [agentMessages.length, agentStatus?.communications])

  // Fetch de datos de nivel y detectar level up
  useEffect(() => {
    async function fetchLevelData() {
      const token = localStorage.getItem('jwt_token')
      if (!token) return
      
      try {
        const res = await fetch('/api/levels', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const newLevel = data?.user?.level || 1
          const newCoins = data?.user?.coins || 0
          
          // Detectar cambio de nivel usando ref (evita bucle infinito)
          if (previousLevelRef.current !== null && newLevel > previousLevelRef.current) {
            // Calcular Leuros ganados (ejemplo: 50 Leuros por nivel subido)
            const levelsGained = newLevel - previousLevelRef.current
            const coinsEarned = levelsGained * 50
            
            setLevelUpData({
              fromLevel: previousLevelRef.current,
              toLevel: newLevel,
              coinsEarned: coinsEarned
            })
            setShowLevelUpAnimation(true)
          }
          
          // Actualizar ref para la próxima detección
          previousLevelRef.current = newLevel
          setUserLevelData(data)
        }
      } catch (error) {
        console.error('Error fetching level data:', error)
      }
    }
    
    fetchLevelData()
    // Refresh cada 30 segundos
    const interval = setInterval(fetchLevelData, 30000)
    return () => clearInterval(interval)
  }, []) // Sin dependencias - solo se ejecuta al montar y por el interval

  const handleLogin = () => {
    // El token ya se guarda en LoginScreen
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('jwt_expiry')
    setIsAuthenticated(false)
  }

  const handleAgentClickFromTerminal = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent) setSelectedAgent(agent)
  }

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />

  // Handler para seleccionar agente desde notificaciones de error
  const handleErrorAgentClick = (agent) => {
    setSelectedAgent(agent)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white overflow-x-hidden">
      {/* Level Up Animation Overlay */}
      {showLevelUpAnimation && levelUpData && (
        <LevelUpAnimation
          agentId="user"
          fromLevel={levelUpData.fromLevel}
          toLevel={levelUpData.toLevel}
          coinsEarned={levelUpData.coinsEarned}
          onComplete={() => setShowLevelUpAnimation(false)}
        />
      )}

      {/* Error Notifications - moved to Errors tab */}

      {/* Mobile-friendly header */}
      <header className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Cpu className="text-retro-purple flex-shrink-0" size={20} sm={24} md={32} />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white font-display truncate">AGENT DASHBOARD</h1>
              <p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">er Hineda & Co.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <ThemeToggle className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10" />
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500">HORA</div>
              <div className="font-mono text-retro-cyan text-xs">{currentTime.toLocaleTimeString()}</div>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400">SALIR</button>
          </div>
        </div>
      </header>

      {/* Tab Navigation - scrollable on mobile */}
      <div className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 sticky top-[60px] sm:top-[72px] md:top-[80px] z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
          <div className="flex gap-1 sm:gap-2 min-w-max">
            {[
              { id: 'metrics', label: 'Métricas', icon: BarChart3 },
              { id: 'heatmap', label: 'Heatmap', icon: Activity },
              { id: 'prediction', label: 'Predicción', icon: Zap },
              { id: 'comms', label: 'Comms', icon: MessageSquare },
              { id: 'errors', label: 'Errores', icon: AlertTriangle },
              { id: 'shop', label: 'Tienda', icon: ShoppingCart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-retro-purple text-retro-purple bg-retro-purple/5' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} sm={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8">
        {/* Tab Content */}
        {activeTab === 'metrics' && (
          <>
        {/* Agent Cards - responsive grid: 1 col mobile, 2 col small, 3 col tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {agents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              isSelected={selectedAgent?.id === agent.id} 
              onClick={() => setSelectedAgent(agent)}
              agentData={agentStatus?.agents}
              levelData={levelData}
              isTalking={talkingAgent === agent.id}
              decoration={activeDecoration}
            />
          ))}
        </div>

        {/* Main content area with sidebar - responsive: stacked on mobile, side-by-side on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            {selectedAgent && (
              <AgentDetail agent={selectedAgent} agentData={agentStatus?.agents} levelData={levelData} />
            )}
          </div>
          
          {/* Sidebar content */}
          <div className="space-y-3 sm:space-y-4">
            {/* Comms Terminal - smaller height on mobile */}
            <AgentTerminal 
              messages={agentStatus?.communications || agentMessages} 
              onAgentClick={handleAgentClickFromTerminal}
              agents={agents}
            />

            {/* Estado del sistema */}
            <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-pink p-3 sm:p-4">
              <h3 className="text-retro-pink font-mono text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
                <Activity size={14} sm={16} />
                ESTADO DEL SISTEMA
              </h3>
              {/* Connection status and reconnect button */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-retro-green animate-pulse' : 'bg-retro-red'}`} />
                  <span className={`text-xs font-mono ${connected ? 'text-retro-green' : 'text-retro-red'}`}>
                    {connected ? 'CONECTADO' : 'DESCONECTADO'}
                  </span>
                </div>
                {!connected && (
                  <button
                    onClick={reconnect}
                    className="text-xs px-2 py-1 bg-retro-cyan/20 text-retro-cyan rounded border border-retro-cyan/50 hover:bg-retro-cyan/30 transition-colors"
                  >
                    Reconectar
                  </button>
                )}
              </div>
              {[
                { label: 'Gateway', value: 'ONLINE', color: 'text-retro-green' },
                { label: 'Agentes Activos', value: agentStatus?.metrics?.activeAgents ?? Object.values(agentStatus?.agents || {}).filter(a => a.status === 'running' || a.status === 'active').length, color: 'text-retro-cyan' },
                { label: 'Agentes Idle', value: agentStatus?.metrics?.idleAgents ?? Object.values(agentStatus?.agents || {}).filter(a => a.status === 'idle').length, color: 'text-retro-yellow' },
                { label: 'Agentes Error', value: agentStatus?.metrics?.errorAgents ?? Object.values(agentStatus?.agents || {}).filter(a => a.status === 'error').length, color: 'text-retro-red' },
                { label: 'Última Actualización', value: agentStatus?.generatedAt ? new Date(agentStatus.generatedAt).toLocaleTimeString() : '--:--:--', color: 'text-gray-400' },
                { label: 'Modo Seguro', value: 'ACTIVO', color: 'text-retro-green' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1 sm:py-2 border-b border-white/5 text-xs sm:text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-mono ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Métricas de Tokens */}
            <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-purple p-3 sm:p-4">
              <h3 className="text-retro-purple font-mono text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
                <Zap size={14} sm={16} />
                MÉTRICAS DE TOKENS
              </h3>
              {[
                { label: 'Input', value: agentStatus?.metrics?.tokens?.input ?? 0, color: 'text-retro-cyan', suffix: '' },
                { label: 'Output', value: agentStatus?.metrics?.tokens?.output ?? 0, color: 'text-retro-pink', suffix: '' },
                { label: 'Total', value: agentStatus?.metrics?.tokens?.total ?? 0, color: 'text-retro-yellow', suffix: ' tokens' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1 sm:py-2 border-b border-white/5 text-xs sm:text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-mono ${item.color}`}>{item.value.toLocaleString()}{item.suffix}</span>
                </div>
              ))}
            </div>

            {/* Activity Charts (FASE 2) */}
            <ActivityCharts agentStatus={agentStatus} agents={agents} />
          </div>
        </div>
          </>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div className="space-y-4 sm:space-y-6">
            <ActivityHeatmap agentStatus={agentStatus} hourlyActivity={hourlyActivity} dailyActivity={dailyActivity} agents={agents} />
          </div>
        )}

        {/* Prediction Tab */}
        {activeTab === 'prediction' && (
          <div className="space-y-4 sm:space-y-6">
            <GlobalMetricsDashboard agentStatus={agentStatus} agents={agents} />
          </div>
        )}

        {/* Comms Tab */}
        {activeTab === 'comms' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Network Visualization */}
            <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-cyan p-3 sm:p-4">
              <h3 className="text-retro-cyan font-mono text-xs sm:text-sm mb-2 sm:mb-4 flex items-center gap-2">
                <Network size={14} sm={16} />
                MAPA DE COMUNICACIONES
              </h3>
              <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-900/50 rounded-lg overflow-hidden flex items-center justify-center">
                <CommsNetwork
                  communications={agentStatus?.communications || agentMessages}
                  agents={agents}
                  onAgentClick={handleAgentClickFromTerminal}
                />
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-green p-4">
              <h3 className="text-retro-green font-mono text-sm mb-4 flex items-center gap-2">
                <MessageSquare size={16} />
                REGISTRO DE COMUNICACIONES
              </h3>
              <AgentTerminal 
                messages={agentStatus?.communications || agentMessages} 
                onAgentClick={handleAgentClickFromTerminal}
                agents={agents}
              />
            </div>
          </div>
        )}

        {/* Errors Tab */}
        {activeTab === 'errors' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-red p-4">
              <h3 className="text-retro-red font-mono text-sm mb-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                ERRORES DE AGENTES
              </h3>
              {(() => {
                const errorAgents = Object.entries(agentStatus?.agents || {})
                  .filter(([id, data]) => data.status === 'error')
                  .map(([id, data]) => ({ id, ...data }))

                if (errorAgents.length === 0) {
                  return (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No hay errores activos</p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    {errorAgents.map(error => (
                      <div
                        key={error.id}
                        onClick={() => handleAgentClickFromTerminal({ id: error.id, ...error })}
                        className="bg-retro-red/10 border border-retro-red/30 rounded-lg p-3 cursor-pointer hover:bg-retro-red/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-retro-red" />
                          <span className="text-white font-bold">{error.id.replace('er-', '')}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{error.task || 'Error desconocido'}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {error.lastError ? new Date(error.lastError).toLocaleString() : 'Sin timestamp'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Shop Tab - Tienda de Decoraciones */}
        {activeTab === 'shop' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Panel de personalización */}
            <AgentCustomizationPanel 
              ownedDecorations={ownedDecorations}
              activeDecoration={activeDecoration}
              onActivateDecoration={handleActivateDecoration}
              onDeactivateDecoration={handleDeactivateDecoration}
            />
            
            {/* Botón para abrir tienda */}
            <div className="text-center">
              <button
                onClick={() => setShowShop(true)}
                className="bg-gradient-to-r from-retro-purple to-retro-pink text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
              >
                <ShoppingCart size={20} />
                Abrir Tienda de Decoraciones
              </button>
            </div>
            
            {/* Información de Leuros */}
            {levelData?.user?.coins !== undefined && (
              <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-yellow p-4 text-center">
                <p className="text-gray-400 text-sm mb-2">Tu saldo actual</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-retro-yellow">{levelData.user.coins}</span>
                  <span className="text-retro-yellow text-xl">🪙</span>
                </div>
                <p className="text-gray-500 text-xs mt-2">Gana Leuros subiendo de nivel</p>
              </div>
            )}
            
            {/* Vista previa de decoraciones disponibles */}
            <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-cyan p-4">
              <h3 className="text-retro-cyan font-mono text-sm mb-4 flex items-center gap-2">
                <ShoppingCart size={16} />
                CATÁLOGO DE DECORACIONES
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: 'Glows', desc: 'Auras brillantes', color: '#06b6d4', count: 4 },
                  { type: 'Bordes', desc: 'Efectos de borde', color: '#ec4899', count: 4 },
                  { type: 'Iconos', desc: 'Iconos decorativos', color: '#fbbf24', count: 6 },
                  { type: 'Bundles', desc: 'Packs especiales', color: '#8b5cf6', count: 1 }
                ].map(item => (
                  <div 
                    key={item.type}
                    className="bg-white/10 rounded-lg p-3 text-center"
                    style={{ borderColor: item.color }}
                  >
                    <div 
                      className="text-lg font-bold"
                      style={{ color: item.color }}
                    >
                      {item.type}
                    </div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.count} items</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de la Tienda de Decoraciones */}
      <DecorationShop 
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        coins={levelData?.user?.coins || 0}
        ownedDecorations={ownedDecorations}
        activeDecoration={activeDecoration}
        onBuyDecoration={handleBuyDecoration}
        onSetActiveDecoration={handleActivateDecoration}
      />

      <footer className="border-t border-white/10 py-4 mt-8">
        <div className="text-center text-gray-600 text-xs">
          🔒 MODO SEGURO • SOLO MÉTRICAS • API READ-ONLY
        </div>
      </footer>
    </div>
  )
}

// Wrap App with ThemeProvider
function AppWithProvider() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

// Export named components for testing
export { 
  ThemeProvider, 
  useTheme, 
  ThemeToggle, 
  PixelCreature,
  AgentCard,
  LoginScreen,
  generateTasks,
  STATIC_AGENTS,
  apiAgentToFrontend,
  statusLabels
}

export default AppWithProvider
