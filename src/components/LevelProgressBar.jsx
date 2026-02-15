import { motion, AnimatePresence } from 'framer-motion'

/**
 * LevelProgressBar - Barra de progreso visual hacia el siguiente nivel
 * Animación de progreso con Framer Motion
 */
export function LevelProgressBar({ 
  currentXP = 0, 
  xpForNextLevel = 100, 
  level = 1,
  showLabel = true,
  height = 'md'
}) {
  // Calcular porcentaje de progreso
  const progressPercent = Math.min((currentXP / xpForNextLevel) * 100, 100)
  
  // Determinar color según nivel
  const getProgressColor = (lvl) => {
    if (lvl >= 10) return '#eab308' // Dorado para nivel 10+
    if (lvl >= 7) return '#a855f7'  // Púrpura para niveles 7-9
    if (lvl >= 4) return '#3b82f6'  // Azul para niveles 4-6
    return '#10b981'                // Verde para niveles 1-3
  }
  
  const progressColor = getProgressColor(level)
  
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Progreso</span>
          <span className="text-xs font-mono text-gray-500">
            {currentXP} / {xpForNextLevel} XP
          </span>
        </div>
      )}
      
      <div className={`
        w-full bg-gray-700/50 rounded-full overflow-hidden
        ${heightClasses[height]}
      `}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ 
            duration: 1, 
            ease: 'easeOut',
            delay: 0.2
          }}
          className="h-full rounded-full relative"
          style={{ backgroundColor: progressColor }}
        >
          {/* Efecto de brillo */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: 'linear'
            }}
          />
        </motion.div>
      </div>
      
      {/* Indicador de siguiente nivel */}
      <AnimatePresence>
        {progressPercent >= 100 && level < 10 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-xs text-center mt-1 text-retro-yellow"
          >
            🎉 ¡Nivel {level + 1} unlocked!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LevelProgressBar
