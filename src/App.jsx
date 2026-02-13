import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Code, Network, GitPullRequest, Cpu, Activity, Clock, Zap, Lock, User, Eye, EyeOff, Folder, FileCode, Server, Search, Shield, Sparkles } from 'lucide-react'

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

// Pixel art creatures as components
const PixelCreature = ({ type, size = 80 }) => {
  const creatures = {
    'er-hineda': {
      emoji: '🧉',
      color: '#ec4899',
      desc: 'Orquestador'
    },
    'coder': {
      emoji: '🤖',
      color: '#8b5cf6',
      desc: 'Constructor'
    },
    'netops': {
      emoji: '🌐',
      color: '#06b6d4',
      desc: 'Servidor'
    },
    'pr-reviewer': {
      emoji: '🔍',
      color: '#22c55e',
      desc: 'Guardián'
    }
  }
  
  const c = creatures[type] || creatures['coder']
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Pixel art background creature */}
      <div 
        className="absolute inset-0 rounded-lg animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${c.color}40 0%, ${c.color}20 100%)`,
          boxShadow: `0 0 20px ${c.color}40, inset 0 0 20px ${c.color}20`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-4xl">
        {c.emoji}
      </div>
      {/* Status dot */}
      <div 
        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black animate-ping"
        style={{ backgroundColor: c.color }}
      />
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

// Hook para cargar métricas reales
function useRealMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/metrics.json')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setMetrics(data)
      } catch (e) {
        console.warn('Using fallback metrics:', e.message)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh cada 30s
    return () => clearInterval(interval)
  }, [])

  return { metrics, loading, error }
}

function AgentCard({ agent, isSelected, onClick, metrics }) {
  // Obtener métricas reales del agente si están disponibles
  const agentMetrics = metrics?.agents?.[agent.id]
  const realSessions = agentMetrics?.sessions || 0
  const realTokens = agentMetrics?.tokens || 0
  
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
        <PixelCreature type={agent.id} size={64} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${agent.color}`}>{agent.name}</h3>
            <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{agent.role}</span>
          </div>
          <p className="text-xs text-gray-500">{agent.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-mono ${statusLabels[agent.status].color}`}>
              {statusLabels[agent.status].text}
            </span>
          </div>
        </div>
        <div className="text-right">
          {metrics ? (
            <>
              <div className={`text-xl font-bold ${agent.color}`}>{realSessions}</div>
              <div className="text-xs text-gray-400">SESIONES</div>
              <div className="text-xs text-gray-600">{realTokens.toLocaleString()} tokens</div>
            </>
          ) : (
            <>
              <div className={`text-xl font-bold ${agent.color}`}>{agent.stats.active}</div>
              <div className="text-xs text-gray-500">TAREAS</div>
            </>
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

function AgentDetail({ agent }) {
  const [tasks, setTasks] = useState([])
  
  useEffect(() => {
    setTasks(generateTasks(agent.id))
    const interval = setInterval(() => {
      setTasks(generateTasks(agent.id))
    }, 2000)
    return () => clearInterval(interval)
  }, [agent.id])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/60 rounded-lg border-2 p-6"
      style={{ borderColor: agent.glowColor }}
    >
      <div className="flex items-center gap-4 mb-6">
        <PixelCreature type={agent.id} size={80} />
        <div>
          <h2 className={`text-2xl font-bold ${agent.color}`}>{agent.name}</h2>
          <p className="text-gray-400">{agent.role}</p>
          <span className={`text-sm font-mono ${statusLabels[agent.status].color}`}>
            {statusLabels[agent.status].text}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded p-3 text-center">
          <div className="text-2xl font-bold" style={{ color: agent.glowColor }}>{agent.stats.completed}</div>
          <div className="text-xs text-gray-500">COMPLETADAS</div>
        </div>
        <div className="bg-white/5 rounded p-3 text-center">
          <div className="text-2xl font-bold" style={{ color: agent.glowColor }}>{agent.stats.active}</div>
          <div className="text-xs text-gray-500">ACTIVAS</div>
        </div>
      </div>

      <h4 className="text-xs text-gray-500 mb-3 flex items-center gap-2">
        <Folder size={12} />
        TAREAS EN PROGRESO
      </h4>
      
      <div className="space-y-2">
        <AnimatePresence>
          {tasks.filter(t => t.status !== 'completed').map(task => (
            <TaskItem key={task.id} task={task} color={agent.glowColor} />
          ))}
        </AnimatePresence>
      </div>

      <h4 className="text-xs text-gray-500 mt-6 mb-3 flex items-center gap-2">
        <Sparkles size={12} />
        SKILLS
      </h4>
      <div className="flex flex-wrap gap-2">
        {agent.skills.map(skill => (
          <span key={skill} className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20">
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [currentTime, setCurrentTime] = useState(new Date())
  const { metrics, loading: metricsLoading } = useRealMetrics()

  useEffect(() => {
    const session = sessionStorage.getItem('agent-dashboard-session')
    if (session) setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = () => {
    sessionStorage.setItem('agent-dashboard-session', Date.now().toString())
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('agent-dashboard-session')
    setIsAuthenticated(false)
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
              metrics={metrics}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentDetail agent={selectedAgent} />
          
          <div className="bg-black/60 rounded-lg border-2 border-retro-pink p-6">
            <h3 className="text-retro-pink font-mono text-sm mb-4 flex items-center gap-2">
              <Activity size={16} />
              ESTADO DEL SISTEMA
            </h3>
            {metrics ? (
              <>
                {[
                  { label: 'Gateway', value: 'ONLINE', color: 'text-retro-green' },
                  { label: 'Sesiones Activas', value: metrics.sessions.total, color: 'text-retro-cyan' },
                  { label: 'Tokens Totales', value: metrics.sessions.totalTokens.toLocaleString(), color: 'text-retro-yellow' },
                  { label: 'Modo Seguro', value: 'ACTIVO', color: 'text-retro-green' },
                  { label: 'Última Actualización', value: new Date(metrics.generatedAt).toLocaleTimeString(), color: 'text-gray-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className={`font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: 'Gateway', value: 'ONLINE', color: 'text-retro-green' },
                  { label: 'Telegram', value: 'CONECTADO', color: 'text-retro-green' },
                  { label: 'Skills', value: '14/56', color: 'text-retro-yellow' },
                  { label: 'Memoria', value: 'ACTIVA', color: 'text-retro-cyan' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className={`font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </>
            )}
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
