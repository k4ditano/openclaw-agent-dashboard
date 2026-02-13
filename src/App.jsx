import { useState, useEffect, useRef, useMemo, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Code, Network, GitPullRequest, Cpu, Activity, Clock, Zap, Lock, Eye, EyeOff, Maximize2, X, Search, Download, Bell, AlertTriangle, BarChart3, History, FileJson, FileText, Filter, RefreshCw, Sun, Moon, Calendar, TrendingUp, Server, Gauge, CalendarDays, FileSpreadsheet } from 'lucide-react'

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

// Credenciales para login (solo se usan para solicitar token, no para verificar localmente)
const CREDENTIALS = {
  username: 'ErHinedaAgents',
  password: 'qubgos-9cehpe-caggEz'
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
const PixelCreature = ({ type, size = 80, isTalking = false }) => {
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
const AgentTerminal = ({ messages, onAgentClick }) => {
  const [autoScroll, setAutoScroll] = useState(true)
  
  return (
    <div className="bg-gray-100 dark:bg-black/80 rounded-lg border border-gray-600 dark:border-white/20 overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="bg-gray-300 dark:bg-white/10 px-3 py-2 flex items-center justify-between border-b border-gray-400 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-retro-green" />
          <span className="text-retro-green">AGENT COMM LINK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-500">● LIVE</span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="h-48 overflow-y-auto p-2 space-y-1 bg-gray-50 dark:bg-black/50">
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
                  <PixelCreature type={msg.from} size={24} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-retro-cyan font-bold">{msg.from.toUpperCase()}</span>
                    <span className="text-gray-500 dark:text-gray-600">→</span>
                    <span className="text-retro-pink font-bold">{msg.to.toUpperCase()}</span>
                    <span className="text-gray-500 dark:text-gray-600 text-[10px]">{msg.time}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{msg.content}</div>
                </div>
                
                {/* Arrow animation */}
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-retro-green"
                >
                  ▸
                </motion.span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
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

// Task simulation data
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

const agents = [
  {
    id: 'er-hineda',
    name: 'er Hineda',
    emoji: '🧉',
    description: 'Sesión principal',
    color: 'text-retro-pink',
    borderColor: 'border-retro-pink',
    glowColor: '#ec4899',
    role: 'Orquestador'
  },
  {
    id: 'er-coder',
    name: 'er Codi',
    emoji: '🤖',
    description: 'Sub-agente coder',
    color: 'text-retro-purple',
    borderColor: 'border-retro-purple',
    glowColor: '#8b5cf6',
    role: 'Constructor'
  },
  {
    id: 'er-plan',
    name: 'er Plan',
    emoji: '📐',
    description: 'Sub-agente planner',
    color: 'text-retro-yellow',
    borderColor: 'border-retro-yellow',
    glowColor: '#f59e0b',
    role: 'Arquitecto'
  },
  {
    id: 'er-serve',
    name: 'er Serve',
    emoji: '🌐',
    description: 'Sub-agente netops',
    color: 'text-retro-cyan',
    borderColor: 'border-retro-cyan',
    glowColor: '#06b6d4',
    role: 'Servidor'
  },
  {
    id: 'er-pr',
    name: 'er PR',
    emoji: '🔍',
    description: 'Sub-agente PR',
    color: 'text-retro-green',
    borderColor: 'border-retro-green',
    glowColor: '#22c55e',
    role: 'Guardián'
  }
]

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

  useEffect(() => {
    const token = localStorage.getItem('jwt_token')
    
    // Si no hay token, intentar con fallback
    if (!token) {
      setLoading(false)
      return
    }

    // Función para obtener datos iniciales
    async function fetchInitialStatus() {
      try {
        const res = await fetch('/api/metrics/agent-status', {
          headers: { 'Authorization': `Bearer ${token}` }
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

    // Conectar a SSE para tiempo real
    function connectSSE() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = new EventSource(`/api/events?token=${token}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('📡 SSE conectado')
        setConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'connected') {
            console.log('📡 Evento de conexión recibido')
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

      eventSource.onerror = (err) => {
        console.warn('SSE error, reconectando...', err)
        setConnected(false)
        eventSource.close()
        
        // Reintentar conexión en 5 segundos
        setTimeout(connectSSE, 5000)
      }
    }

    // Cargar datos iniciales
    fetchInitialStatus()
    
    // Conectar SSE
    connectSSE()

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return { status, loading, error, connected }
}

function AgentCard({ agent, isSelected, onClick, agentData }) {
  const data = agentData?.[agent.id] || {}
  
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-lg cursor-pointer transition-all
        bg-white/50 dark:bg-black/50 border-2 ${agent.borderColor}
        ${isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-black' : ''}
        ${data.status === 'error' ? 'border-retro-red' : ''}
      `}
      style={{ 
        boxShadow: isSelected ? `0 0 20px ${agent.glowColor}40` : 
                   data.status === 'error' ? '0 0 20px #ef444440' : 'none' 
      }}
    >
      <div className="flex items-center gap-4">
        <PixelCreature type={agent.id} size={64} isTalking={data.status === 'running'} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${agent.color}`}>{agent.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${getStatusClass(data.status)}`}>
              {data.status?.toUpperCase() || 'OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-gray-500">{data.task || 'Sin actividad'}</p>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${agent.color}`}>{data.progress || 0}%</div>
          <div className="text-xs text-gray-500">PROGRESS</div>
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
    <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-gray-200 dark:border-white/10 p-4">
      <div className="flex items-center gap-2 mb-4">
        <History size={16} style={{ color }} />
        <span className="text-sm font-bold" style={{ color }}>TIMELINE DE TAREAS</span>
      </div>
      
      {timelineEvents.length === 0 ? (
        <div className="text-xs text-gray-500 italic">Sin actividad reciente...</div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/10" />
          
          <div className="space-y-3">
            {timelineEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-6"
              >
                {/* Timeline dot */}
                <div 
                  className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-black ${event.type === 'user' ? 'bg-retro-yellow' : 'bg-retro-green'}`}
                />
                
                <div className="text-xs">
                  <div className="flex items-center gap-2">
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
function ActivityCharts({ agentStatus }) {
  const [hourlyActivity, setHourlyActivity] = useState([])
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
        console.log('No token available for activity fetch')
        return
      }
      
      try {
        const res = await fetch('/api/metrics/activity', {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          console.log('Activity data received:', data.hourly?.length, 'hours')
          setHourlyActivity(data.hourly || [])
        } else {
          console.warn('Activity fetch error:', res.status)
        }
      } catch (e) {
        console.warn('Error fetching hourly activity:', e.message)
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
      {/* Token Usage Chart */}
      <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-purple p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-retro-purple" />
          <span className="text-sm font-bold text-retro-purple">USO DE TOKENS</span>
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
      
      {/* Hourly Activity Chart - DATOS REALES */}
      <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-cyan p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-retro-cyan" />
          <span className="text-sm font-bold text-retro-cyan">ACTIVIDAD POR HORA</span>
        </div>
        
        {/* SIMPLE Bar Chart - min 3px height */}
        <div className="flex items-end gap-1 h-20">
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
                    minWidth: '8px'
                  }}
                  title={`${hour.hour}: ${hour.activity} acts`}
                />
              </div>
            )
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          <span className="text-[8px] text-gray-600">{displayHourlyActivity[0]?.hour}</span>
          <span className="text-[8px] text-gray-600">{displayHourlyActivity[Math.floor(displayHourlyActivity.length/2)]?.hour}</span>
          <span className="text-[8px] text-gray-600">{displayHourlyActivity[displayHourlyActivity.length-1]?.hour}</span>
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
    const newErrors = Object.entries(agentsData || {})
      .filter(([id, data]) => data.status === 'error')
      .map(([id, data]) => ({ id, ...data }))
    
    // Filtrar errores no dismissidos
    const activeErrors = newErrors.filter(e => !dismissed.has(e.id))
    setErrors(activeErrors)
  }, [agentsData, dismissed])
  
  const dismissError = (id) => {
    setDismissed(prev => new Set([...prev, id]))
  }
  
  if (errors.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="bg-retro-red/20 border-2 border-retro-red rounded-lg p-3 max-w-sm"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-retro-red flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-retro-red font-bold text-sm">ERROR EN AGENTE</span>
                  <button 
                    onClick={() => dismissError(error.id)}
                    className="text-gray-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-gray-800 dark:text-white text-xs mt-1">{error.name || error.id}</p>
                <p className="text-gray-400 text-xs mt-1 truncate">{error.task || 'Error desconocido'}</p>
                <button 
                  onClick={() => {
                    const agent = agents.find(a => a.id === error.id)
                    if (agent) onAgentClick(agent)
                  }}
                  className="text-retro-red text-xs mt-2 hover:underline"
                >
                  Ver detalles →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// FASE 1: NUEVOS COMPONENTES DE ALTO IMPACTO
// =============================================================================

// 1. GLOBAL METRICS DASHBOARD - Panel de métricas global con gráficos completos
function GlobalMetricsDashboard({ agentStatus }) {
  const [activeView, setActiveView] = useState('tokens') // 'tokens' | 'activity' | 'uptime'
  const [hourlyData, setHourlyData] = useState([])
  
  useEffect(() => {
    async function fetchActivity() {
      const token = localStorage.getItem('jwt_token')
      if (!token) return
      
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
      }
    }
    
    fetchActivity()
    const interval = setInterval(fetchActivity, 15000)
    return () => clearInterval(interval)
  }, [])
  
  const agents = agentStatus?.agents || {}
  const metrics = agentStatus?.metrics || {}
  
  // Calcular métricas
  const totalTokens = metrics?.tokens?.total || Object.values(agents).reduce((sum, a) => sum + (a.tokens?.total || 0), 0)
  const inputTokens = metrics?.tokens?.input || Object.values(agents).reduce((sum, a) => sum + (a.tokens?.input || 0), 0)
  const outputTokens = metrics?.tokens?.output || Object.values(agents).reduce((sum, a) => sum + (a.tokens?.output || 0), 0)
  
  const activeAgents = Object.values(agents).filter(a => a.status === 'running' || a.status === 'active').length
  const idleAgents = Object.values(agents).filter(a => a.status === 'idle').length
  const errorAgents = Object.values(agents).filter(a => a.status === 'error').length
  
  // Calcular uptime simulado (basado en actividad reciente)
  const uptime = activeAgents > 0 ? 99.5 + (Math.random() * 0.5) : 95
  
  // Datos para gráfico de tokens por agente
  const tokenByAgent = Object.entries(agents).map(([id, data]) => ({
    name: id.replace('er-', ''),
    input: data.tokens?.input || 0,
    output: data.tokens?.output || 0,
    total: data.tokens?.total || 0,
    color: agentsList.find(a => a.id === id)?.color || '#888'
  }))
  
  const maxToken = Math.max(...tokenByAgent.map(t => t.total), 1)
  
  return (
    <div className="space-y-6">
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
              {hourlyData.length === 0 ? (
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
              {Object.entries(agents).map(([id, data]) => {
                const agentUptime = data.status === 'error' ? 0 : data.status === 'offline' ? 50 : 95 + Math.random() * 5
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

// 2. ACTIVITY HEATMAP - Heatmap de actividad semanal
function ActivityHeatmap({ agentStatus }) {
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Generar datos de actividad simulados para los últimos 7 días
    // En producción, esto vendría de una API que guarda el histórico
    const days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Simular actividad (en producción sería datos reales)
      const dayData = {
        date: dateStr,
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNum: date.getDate(),
        activity: Math.floor(Math.random() * 100),
        sessions: Math.floor(Math.random() * 10),
        tokens: Math.floor(Math.random() * 50000),
        agents: Object.keys(agentStatus?.agents || {}).map(id => ({
          id,
          active: Math.random() > 0.3,
          tokens: Math.floor(Math.random() * 10000)
        }))
      }
      days.push(dayData)
    }
    
    setWeeklyData(days)
    setLoading(false)
  }, [agentStatus])
  
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
                style={{ backgroundColor: agentsList.find(a => a.id === agentId)?.color || '#888' }}
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
                      const agent = agentsList.find(a => a.id === error.id)
                      if (agent) onAgentClick(agent)
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
            <PixelCreature type={agent.id} size={48} />
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
function AgentDetail({ agent, agentData }) {
  const data = agentData?.[agent.id] || {}
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
          <div className="flex items-center gap-4">
            <PixelCreature type={agent.id} size={64} isTalking={data.status === 'running'} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-bold ${agent.color}`}>{agent.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusClass(data.status)}`}>
                  ● {data.status?.toUpperCase() || 'OFFLINE'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{data.task || 'Sin actividad'}</p>
            </div>
            {/* Progress ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="white/10" strokeWidth="4" fill="none" />
                <circle 
                  cx="32" cy="32" r="28" 
                  stroke={data.status === 'error' ? '#ef4444' : agent.glowColor} 
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray={`${(data.progress || 0) * 1.76} 176`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: data.status === 'error' ? '#ef4444' : agent.glowColor }}>
                {data.progress || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Terminal Logs - manual scroll + search (FASE 2) */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-retro-green" />
              <span className="text-xs text-gray-500 font-mono">LIVE LOGS</span>
              <span className="text-xs text-gray-600">
                {searchTerm ? `(${filteredLogs.length}/${logs.length})` : `(${logs.length})`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {logs.length > 0 && (
                <>
                  {/* Search inline */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filtrar..."
                      className="w-24 bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded px-2 py-1 text-xs text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-retro-cyan"
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
                    Expandir
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-black/90 rounded-lg border border-gray-300 dark:border-white/10 p-3 h-64 overflow-y-auto font-mono text-xs">
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
            <div className="mt-3 text-xs text-gray-500">
              Iniciado: <span className="text-retro-cyan font-mono">{data.started}</span>
            </div>
          )}
        </div>

        {/* Task Timeline (FASE 2) */}
        <div className="p-4 pt-0">
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

// Communication Bubble - Popup when agents message each other
function CommunicationBubble({ message, onClose }) {
  if (!message) return null
  
  const getAgentColor = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    return agent?.glowColor || '#888'
  }
  
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div 
            className="bg-white dark:bg-black border-2 rounded-2xl shadow-2xl p-4 max-w-md"
            style={{ borderColor: getAgentColor(message.from) }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <PixelCreature type={message.from} size={32} />
                <span 
                  className="text-sm font-bold"
                  style={{ color: getAgentColor(message.from) }}
                >
                  {message.from.toUpperCase()}
                </span>
              </div>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="text-retro-green"
              >
                ➜
              </motion.span>
              <div className="flex items-center gap-2">
                <PixelCreature type={message.to} size={32} />
                <span 
                  className="text-sm font-bold"
                  style={{ color: getAgentColor(message.to) }}
                >
                  {message.to.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-white/10 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
              {message.content}
            </div>
            <button 
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentView, setCurrentView] = useState('agents') // 'agents' | 'metrics' | 'activity'
  const { status: agentStatus, loading: statusLoading } = useAgentStatus()
  
  // Mensajes: primero los reales del backend, luego fallback simulado
  const [agentMessages, setAgentMessages] = useState(() => {
    // Inicializar con mensajes del backend si existen
    return [] // Se llena con useEffect
  })
  const [talkingAgent, setTalkingAgent] = useState(null)
  
  // Communication bubble state
  const [currentBubble, setCurrentBubble] = useState(null)
  const [previousMessagesCount, setPreviousMessagesCount] = useState(0)

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
      
      // Show bubble when new message arrives (but not on initial load)
      const latestMsg = agentStatus.communications[agentStatus.communications.length - 1]
      if (latestMsg && previousMessagesCount > 0 && agentStatus.communications.length > previousMessagesCount) {
        setCurrentBubble(latestMsg)
        setTimeout(() => setCurrentBubble(null), 4000)
      }
      setPreviousMessagesCount(agentStatus.communications.length)
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
      const newMsg = { 
        ...msg, 
        time: new Date().toLocaleTimeString('es-ES', { hour12: false }) 
      }
      setAgentMessages(prev => [...prev.slice(-10), newMsg])
      setTalkingAgent(msg.from)
      
      // Show bubble for simulated messages too
      setCurrentBubble(newMsg)
      setTimeout(() => setCurrentBubble(null), 4000)
      
      setTimeout(() => setTalkingAgent(null), 1500)
    }, 8000)
    
    return () => clearInterval(interval)
  }, [agentMessages.length, agentStatus?.communications])

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
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      {/* Error Notifications - FASE 1 Mejorado */}
      <EnhancedErrorNotifications 
        agentsData={agentStatus?.agents} 
        onAgentClick={handleErrorAgentClick}
      />
      
      {/* Communication Bubble - shows when agents message each other */}
      <CommunicationBubble 
        message={currentBubble} 
        onClose={() => setCurrentBubble(null)}
      />
      
      <header className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Cpu className="text-retro-purple" size={32} />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white font-display">AGENT DASHBOARD</h1>
                <p className="text-xs text-gray-500 dark:text-gray-500">er Hineda & Co.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Botón de exportar datos - FASE 1 */}
              <GlobalExportPanel agentStatus={agentStatus} />
              <ThemeToggle className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10" />
              <div className="text-right">
                <div className="text-xs text-gray-500">HORA</div>
                <div className="font-mono text-retro-cyan">{currentTime.toLocaleTimeString()}</div>
              </div>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400">SALIR</button>
            </div>
          </div>
          
          {/* Navegación de vistas - FASE 1 */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('agents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'agents' 
                  ? 'bg-retro-purple text-white' 
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              <Cpu size={16} />
              Agentes
            </button>
            <button
              onClick={() => setCurrentView('metrics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'metrics' 
                  ? 'bg-retro-purple text-white' 
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              <BarChart3 size={16} />
              Métricas Global
            </button>
            <button
              onClick={() => setCurrentView('activity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'activity' 
                  ? 'bg-retro-purple text-white' 
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              <CalendarDays size={16} />
              Actividad
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* VISTA DE AGENTES - Vista por defecto */}
        {currentView === 'agents' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {agents.map(agent => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  isSelected={selectedAgent.id === agent.id} 
                  onClick={() => setSelectedAgent(agent)}
                  agentData={agentStatus?.agents}
                  isTalking={talkingAgent === agent.id}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AgentDetail agent={selectedAgent} agentData={agentStatus?.agents} />
              </div>
              
              <div className="space-y-4">
                {/* Comms Terminal */}
                <AgentTerminal 
                  messages={agentStatus?.communications || agentMessages} 
                  onAgentClick={handleAgentClickFromTerminal}
                />

                {/* Estado del sistema */}
                <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-pink p-4">
                  <h3 className="text-retro-pink font-mono text-sm mb-3 flex items-center gap-2">
                    <Activity size={16} />
                    ESTADO DEL SISTEMA
                  </h3>
                  {[
                    { label: 'Gateway', value: 'ONLINE', color: 'text-retro-green' },
                    { label: 'Agentes Activos', value: agentStatus?.metrics?.activeAgents ?? Object.values(agentStatus?.agents || {}).filter(a => a.status === 'running' || a.status === 'active').length, color: 'text-retro-cyan' },
                    { label: 'Agentes Idle', value: agentStatus?.metrics?.idleAgents ?? Object.values(agentStatus?.agents || {}).filter(a => a.status === 'idle').length, color: 'text-retro-yellow' },
                    { label: 'Agentes Error', value: agentStatus?.metrics?.errorAgents ?? Object.values(agentStatus?.agents || {}).filter(a => a.status === 'error').length, color: 'text-retro-red' },
                    { label: 'Última Actualización', value: agentStatus?.generatedAt ? new Date(agentStatus.generatedAt).toLocaleTimeString() : '--:--:--', color: 'text-gray-400' },
                    { label: 'Modo Seguro', value: 'ACTIVO', color: 'text-retro-green' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-gray-500 text-sm">{item.label}</span>
                      <span className={`font-mono ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Métricas de Tokens */}
                <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-purple p-4">
                  <h3 className="text-retro-purple font-mono text-sm mb-3 flex items-center gap-2">
                    <Zap size={16} />
                    MÉTRICAS DE TOKENS
                  </h3>
                  {[
                    { label: 'Input', value: agentStatus?.metrics?.tokens?.input ?? 0, color: 'text-retro-cyan', suffix: '' },
                    { label: 'Output', value: agentStatus?.metrics?.tokens?.output ?? 0, color: 'text-retro-pink', suffix: '' },
                    { label: 'Total', value: agentStatus?.metrics?.tokens?.total ?? 0, color: 'text-retro-yellow', suffix: ' tokens' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-gray-500 text-sm">{item.label}</span>
                      <span className={`font-mono ${item.color}`}>{item.value.toLocaleString()}{item.suffix}</span>
                    </div>
                  ))}
                </div>

                {/* Activity Charts (FASE 2) */}
                <ActivityCharts agentStatus={agentStatus} />
              </div>
            </div>
          </>
        )}

        {/* VISTA DE MÉTRICAS GLOBAL - FASE 1 */}
        {currentView === 'metrics' && (
          <div className="space-y-6">
            <GlobalMetricsDashboard agentStatus={agentStatus} />
          </div>
        )}

        {/* VISTA DE ACTIVIDAD - FASE 1 */}
        {currentView === 'activity' && (
          <div className="space-y-6">
            <ActivityHeatmap agentStatus={agentStatus} />
            
            {/* Resumen de actividad */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-green p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-retro-green" />
                  <span className="text-xs text-retro-green">ACTIVIDAD HOY</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {Object.values(agentStatus?.agents || {}).reduce((sum, a) => sum + (a.tokens?.total || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">tokens</div>
              </div>
              
              <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-cyan p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={16} className="text-retro-cyan" />
                  <span className="text-xs text-retro-cyan">SESIONES</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {Object.values(agentStatus?.agents || {}).filter(a => a.status !== 'offline').length}
                </div>
                <div className="text-xs text-gray-500">activas</div>
              </div>
              
              <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-yellow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-retro-yellow" />
                  <span className="text-xs text-retro-yellow">ÚLTIMA ACT.</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {agentStatus?.generatedAt 
                    ? new Date(agentStatus.generatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </div>
                <div className="text-xs text-gray-500">actualizado</div>
              </div>
              
              <div className="bg-white/60 dark:bg-black/60 rounded-lg border border-retro-purple p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={16} className="text-retro-purple" />
                  <span className="text-xs text-retro-purple">UPTIME</span>
                </div>
                <div className="text-2xl font-bold text-retro-green">99.9%</div>
                <div className="text-xs text-gray-500">sistema</div>
              </div>
            </div>
          </div>
        )}
      </main>

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
  agents,
  statusLabels
}

export default AppWithProvider
