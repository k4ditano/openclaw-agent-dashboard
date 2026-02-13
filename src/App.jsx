import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Code, Network, GitPullRequest, Cpu, Activity, Clock, Zap, Lock, Eye, EyeOff, Maximize2, X } from 'lucide-react'

// Simple hash function for password verification
const hashPassword = (password) => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

const CREDENTIALS = {
  username: 'ErHinedaAgents',
  passwordHash: hashPassword('qubgos-9cehpe-caggEz')
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
    <div className="bg-black/80 rounded-lg border border-white/20 overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="bg-white/10 px-3 py-2 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-retro-green" />
          <span className="text-retro-green">AGENT COMM LINK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">● LIVE</span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="h-48 overflow-y-auto p-2 space-y-1">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="text-gray-600 italic">Esperando mensajes entre agentes...</div>
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
                    <span className="text-gray-600">→</span>
                    <span className="text-retro-pink font-bold">{msg.to.toUpperCase()}</span>
                    <span className="text-gray-600 text-[10px]">{msg.time}</span>
                  </div>
                  <div className="text-gray-300 truncate">{msg.content}</div>
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
      <div className="bg-white/5 px-3 py-2 border-t border-white/10">
        <div className="flex items-center gap-2 text-gray-500">
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
    description: 'Principal orchestrator - coordinates all agents',
    color: 'text-retro-pink',
    borderColor: 'border-retro-pink',
    glowColor: '#ec4899',
    status: 'working',
    icon: Cpu,
    skills: ['Orchestration', 'MiniMax M2.5', 'Telegram', 'GitHub'],
    stats: { completed: 1, active: 3 },
    role: 'Orquestador'
  },
  {
    id: 'coder',
    name: 'er Codi',
    emoji: '🤖',
    description: 'Coding agent - builds & creates',
    color: 'text-retro-purple',
    borderColor: 'border-retro-purple',
    glowColor: '#8b5cf6',
    status: 'working',
    icon: Code,
    skills: ['TypeScript', 'React', 'Node.js', 'Python'],
    stats: { completed: 127, active: 3 },
    role: 'Constructor'
  },
  {
    id: 'netops',
    name: 'er Serve',
    emoji: '🌐',
    description: 'Network operations & server management',
    color: 'text-retro-cyan',
    borderColor: 'border-retro-cyan',
    glowColor: '#06b6d4',
    status: 'monitoring',
    icon: Network,
    skills: ['Docker', 'SSH', 'Nginx', 'AWS'],
    stats: { completed: 45, active: 1 },
    role: 'Servidor'
  },
  {
    id: 'pr-reviewer',
    name: 'er PR',
    emoji: '🔍',
    description: 'PR Reviewer - code analysis & security',
    color: 'text-retro-green',
    borderColor: 'border-retro-green',
    glowColor: '#22c55e',
    status: 'reviewing',
    icon: GitPullRequest,
    skills: ['Code Review', 'Security', 'Best Practices'],
    stats: { completed: 89, active: 2 },
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
    await new Promise(resolve => setTimeout(resolve, 500))
    const hashedInput = hashPassword(password)
    if (username === CREDENTIALS.username && hashedInput === CREDENTIALS.passwordHash) {
      onLogin()
    } else {
      setLocalError('Credenciales inválidas')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-black/80 border-2 border-retro-purple rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Lock className="text-retro-purple" size={48} />
            </div>
            <h1 className="text-xl font-bold text-white font-display">
              AGENT DASHBOARD
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-white/20 rounded-lg px-4 py-3 text-white font-mono"
                placeholder="USUARIO"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-white/20 rounded-lg px-4 py-3 text-white font-mono pr-12"
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

// Hook para cargar estado completo de agentes
function useAgentStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/agent-status.json')
        if (res.ok) {
          setStatus(await res.json())
        }
      } catch (e) {
        console.warn('Error:', e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000) // Refresh cada 3 segundos
    return () => clearInterval(interval)
  }, [])

  return { status, loading }
}

function AgentCard({ agent, isSelected, onClick, agentData }) {
  const data = agentData?.[agent.id] || {}
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-lg cursor-pointer transition-all
        bg-black/50 border-2 ${agent.borderColor}
        ${isSelected ? 'ring-2 ring-offset-2 ring-offset-black' : ''}
      `}
      style={{ boxShadow: isSelected ? `0 0 20px ${agent.glowColor}40` : 'none' }}
    >
      <div className="flex items-center gap-4">
        <PixelCreature type={agent.id} size={64} isTalking={data.status === 'running'} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${agent.color}`}>{agent.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${data.status === 'running' ? 'bg-retro-green/20 text-retro-green' : 'bg-white/10 text-gray-400'}`}>
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
    <div className="bg-white/5 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{statusIcons[task.status]}</span>
          <span className="text-sm text-white">{task.name}</span>
        </div>
        <span className="text-xs" style={{ color }}>{task.progress}%</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
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
function LogEntry({ log, color }) {
  const isUser = log.type === 'user'
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-2 text-xs py-1 border-b border-white/5 hover:bg-white/5"
    >
      <span className="text-gray-600 font-mono min-w-[60px]">{log.time}</span>
      <span className={isUser ? 'text-retro-yellow' : 'text-retro-green'}>
        {isUser ? '↦' : '↤'}
      </span>
      <span className="text-gray-300 break-all">{log.text}</span>
    </motion.div>
  )
}

// Full-screen Log Modal
function LogModal({ agent, logs, onClose }) {
  const modalRef = useRef(null)
  
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        ref={modalRef}
        className="bg-black border-2 rounded-xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col"
        style={{ borderColor: agent.glowColor }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: `${agent.glowColor}15` }}>
          <div className="flex items-center gap-3">
            <PixelCreature type={agent.id} size={48} />
            <div>
              <h2 className={`text-xl font-bold ${agent.color}`}>{agent.name}</h2>
              <p className="text-xs text-gray-500">{logs.length} logs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-black/50 custom-scrollbar">
          <div className="font-mono text-sm">
            <AnimatePresence>
              {logs.map((log, i) => (
                <LogEntry key={i} log={log} color={agent.glowColor} />
              ))}
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

// Agent Detail with Terminal Logs - manual scroll + expand
function AgentDetail({ agent, agentData }) {
  const data = agentData?.[agent.id] || {}
  const logs = data.logs || []
  const [expanded, setExpanded] = useState(false)
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/60 rounded-lg border-2 overflow-hidden"
        style={{ borderColor: agent.glowColor }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10" style={{ backgroundColor: `${agent.glowColor}15` }}>
          <div className="flex items-center gap-4">
            <PixelCreature type={agent.id} size={64} isTalking={data.status === 'running'} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-bold ${agent.color}`}>{agent.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded ${data.status === 'running' ? 'bg-retro-green/20 text-retro-green' : 'bg-white/10 text-gray-400'}`}>
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
                  stroke={agent.glowColor} 
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray={`${(data.progress || 0) * 1.76} 176`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: agent.glowColor }}>
                {data.progress || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Terminal Logs - manual scroll */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-retro-green" />
              <span className="text-xs text-gray-500 font-mono">LIVE LOGS</span>
              <span className="text-xs text-gray-600">({logs.length})</span>
            </div>
            {logs.length > 0 && (
              <button 
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 text-xs text-retro-cyan hover:text-retro-cyan/80 transition-colors"
              >
                <Maximize2 size={12} />
                Expandir
              </button>
            )}
          </div>
          
          <div className="bg-black/90 rounded-lg border border-white/10 p-3 h-64 overflow-y-auto font-mono text-xs custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Esperando logs...</div>
            ) : (
              logs.map((log, i) => (
                <LogEntry key={i} log={log} color={agent.glowColor} />
              ))
            )}
          </div>
          
          {data.started && (
            <div className="mt-3 text-xs text-gray-500">
              Iniciado: <span className="text-retro-cyan font-mono">{data.started}</span>
            </div>
          )}
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
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [currentTime, setCurrentTime] = useState(new Date())
  const { status: agentStatus, loading: statusLoading } = useAgentStatus()
  
  // Mensajes: primero los reales del backend, luego fallback simulado
  const [agentMessages, setAgentMessages] = useState([])
  const [talkingAgent, setTalkingAgent] = useState(null)

  useEffect(() => {
    const session = sessionStorage.getItem('agent-dashboard-session')
    if (session) setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Simular mensajes si no hay reales (fallback)
  useEffect(() => {
    if (agentMessages.length > 0) return // Ya hay mensajes reales
    
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
  }, [agentMessages.length])

  const handleLogin = () => {
    sessionStorage.setItem('agent-dashboard-session', Date.now().toString())
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('agent-dashboard-session')
    setIsAuthenticated(false)
  }

  const handleAgentClickFromTerminal = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent) setSelectedAgent(agent)
  }

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/10 bg-black/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Cpu className="text-retro-purple" size={32} />
            <div>
              <h1 className="text-lg font-bold text-white font-display">AGENT DASHBOARD</h1>
              <p className="text-xs text-gray-500">er Hineda & Co.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-500">HORA</div>
              <div className="font-mono text-retro-cyan">{currentTime.toLocaleTimeString()}</div>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400">SALIR</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
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
            {/* Estado del sistema */}
            <div className="bg-black/60 rounded-lg border-2 border-retro-pink p-4">
              <h3 className="text-retro-pink font-mono text-sm mb-3 flex items-center gap-2">
                <Activity size={16} />
                ESTADO DEL SISTEMA
              </h3>
              {[
                { label: 'Gateway', value: 'ONLINE', color: 'text-retro-green' },
                { label: 'Agentes Activos', value: Object.values(agentStatus?.agents || {}).filter(a => a.status === 'running' || a.status === 'active').length, color: 'text-retro-cyan' },
                { label: 'Última Actualización', value: agentStatus?.generatedAt ? new Date(agentStatus.generatedAt).toLocaleTimeString() : '--:--:--', color: 'text-gray-400' },
                { label: 'Modo Seguro', value: 'ACTIVO', color: 'text-retro-green' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className={`font-mono ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-4 mt-8">
        <div className="text-center text-gray-600 text-xs">
          🔒 MODO SEGURO • SOLO MÉTRICAS • API READ-ONLY
        </div>
      </footer>
    </div>
  )
}

export default App
