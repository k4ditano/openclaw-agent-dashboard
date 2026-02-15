import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLevelColor, getLevelName } from './LevelBadge'

/**
 * LevelUpAnimation - Modal de animación de level up
 * Muestra celebración cuando un agente sube de nivel
 * 
 * @param {string} agentId - ID del agente
 * @param {number} fromLevel - Nivel anterior
 * @param {number} toLevel - Nuevo nivel
 * @param {number} coinsEarned - Leuros ganados
 * @param {number} duration - Duración en ms (default 3000)
 * @param {function} onComplete - Callback al terminar
 */
export function LevelUpAnimation({ 
  agentId,
  fromLevel, 
  toLevel, 
  coinsEarned = 0, 
  duration = 3000,
  onComplete 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState([])
  
  // Generar partículas de confeti
  useEffect(() => {
    if (isVisible) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
        color: [
          '#fbbf24', // amber
          '#f97316', // orange
          '#10b981', // emerald
          '#3b82f6', // blue
          '#8b5cf6', // violet
          '#ec4899', // pink
        ][Math.floor(Math.random() * 6)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)
    }
  }, [isVisible])
  
  // Activar animación al montar
  useEffect(() => {
    if (fromLevel && toLevel && fromLevel !== toLevel) {
      setIsVisible(true)
    }
  }, [fromLevel, toLevel])
  
  // Cerrar después de duration ms
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onComplete])
  
  const fromColor = getLevelColor(fromLevel)
  const toColor = getLevelColor(toLevel)
  const toName = getLevelName(toLevel)
  
  // No renderizar si no hay cambio de nivel
  if (!isVisible || fromLevel === toLevel) return null
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Overlay oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setIsVisible(false)
              onComplete?.()
            }}
          />
          
          {/* Partículas de confeti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: `${particle.x}%`, 
                  y: -20,
                  rotate: 0,
                  scale: 0
                }}
                animate={{ 
                  y: '120vh',
                  rotate: particle.rotation,
                  scale: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: 'easeIn'
                }}
                className="absolute"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}
          </div>
          
          {/* Modal principal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-10 bg-gray-900/90 border-2 border-retro-yellow rounded-2xl p-8 text-center shadow-2xl"
            style={{
              boxShadow: `
                0 0 60px rgba(234, 179, 8, 0.3),
                0 0 100px rgba(234, 179, 8, 0.1)
              `,
              minWidth: '320px',
            }}
          >
            {/* Título "LEVEL UP!" */}
            <motion.h2
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              className="text-4xl font-black text-retro-yellow mb-2 tracking-wider"
              style={{
                textShadow: '0 0 20px rgba(234, 179, 8, 0.5)',
              }}
            >
              ¡LEVEL UP!
            </motion.h2>
            
            {/* Cambio de nivel */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Nivel anterior */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 0.8, opacity: 0.5 }}
                className={`
                  flex flex-col items-center gap-1
                  ${fromColor.bg} ${fromColor.border} border-2 rounded-xl px-4 py-2
                `}
              >
                <span className="text-xs text-gray-400">Nivel</span>
                <span className={`text-3xl font-bold ${fromColor.text}`}>
                  {fromLevel}
                </span>
              </motion.div>
              
              {/* Flecha */}
              <motion.div
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-retro-yellow text-2xl"
              >
                ➜
              </motion.div>
              
              {/* Nuevo nivel */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: 1 
                }}
                transition={{ 
                  delay: 0.4,
                  duration: 0.6,
                  times: [0, 0.5, 1]
                }}
                className={`
                  flex flex-col items-center gap-1
                  ${toColor.bg} ${toColor.border} border-2 rounded-xl px-4 py-2
                `}
                style={{
                  boxShadow: `0 0 30px ${toColor.glow}50`,
                }}
              >
                <span className="text-xs text-gray-400">Nivel</span>
                <motion.span
                  className={`text-4xl font-bold ${toColor.text}`}
                  animate={{ 
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ 
                    delay: 0.6,
                    duration: 0.4,
                    times: [0, 0.5, 1]
                  }}
                >
                  {toLevel}
                </motion.span>
              </motion.div>
            </div>
            
            {/* Nombre del nuevo nivel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <span className="text-lg text-gray-300">
                ¡Ahora eres <span className={`font-bold ${toColor.text}`}>{toName}</span>!
              </span>
            </motion.div>
            
            {/* Leuros ganados */}
            <AnimatePresence>
              {coinsEarned > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-2"
                >
                  {/* Icono de Leuro */}
                  <motion.span
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-amber-400"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                      <text
                        x="12"
                        y="16"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="currentColor"
                      >
                        $
                      </text>
                    </svg>
                  </motion.span>
                  
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xl font-bold text-retro-green"
                  >
                    +{coinsEarned.toLocaleString('es-ES')}
                  </motion.span>
                  
                  <span className="text-amber-400/70 text-sm">Leuros</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Efecto de brillo en los bordes */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 1 
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LevelUpAnimation
