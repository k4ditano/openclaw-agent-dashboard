import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HelpIcon } from './Tooltip'

// Colores por nivel (verde lvl1 → dorado lvl10)
const levelColors = {
  1: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', glow: '#10b981' },
  2: { bg: 'bg-emerald-400/20', border: 'border-emerald-400', text: 'text-emerald-300', glow: '#34d399' },
  3: { bg: 'bg-teal-500/20', border: 'border-teal-500', text: 'text-teal-400', glow: '#14b8a6' },
  4: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', glow: '#06b6d4' },
  5: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', glow: '#3b82f6' },
  6: { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-400', glow: '#6366f1' },
  7: { bg: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-400', glow: '#8b5cf6' },
  8: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400', glow: '#a855f7' },
  9: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', glow: '#f59e0b' },
  10: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', glow: '#eab308' },
}

// Nombres de nivel
const levelNames = {
  1: 'Novato',
  2: 'Aprendiz',
  3: 'Explorador',
  4: 'Investigador',
  5: 'Especialista',
  6: 'Experto',
  7: 'Maestro',
  8: 'Veterano',
  9: 'Élite',
  10: 'Legendario',
}

export function getLevelColor(level) {
  return levelColors[Math.min(Math.max(level, 1), 10)] || levelColors[1]
}

export function getLevelName(level) {
  return levelNames[Math.min(Math.max(level, 1), 10)] || levelNames[1]
}

/**
 * LevelBadge - Muestra el número de nivel con estilo visual (badge/chip)
 * Colores por nivel (verde lvl1 → dorado lvl10)
 * Optimizado con useMemo para evitar recálculos
 */
export const LevelBadge = React.memo(function LevelBadge({ level = 1, showName = false, size = 'md', showTooltip = true }) {
  // Memoizar el cálculo de color y nombre
  const { color, name, isMaxLevel, isHighLevel } = useMemo(() => {
    const lvl = Math.min(Math.max(level, 1), 10)
    return {
      color: levelColors[lvl],
      name: levelNames[lvl],
      isMaxLevel: lvl === 10,
      isHighLevel: lvl >= 8
    }
  }, [level])
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }
  
  const tooltipContent = isMaxLevel 
    ? '¡Nivel Máximo! Eres Legendario 👑'
    : isHighLevel
      ? `Nivel ${level} - ${name}. ¡Casi llegas a Legendario!`
      : `Nivel ${level} - ${name}`
  
  // Si es nivel máximo, agregar efectos especiales
  if (isMaxLevel) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          inline-flex items-center gap-1.5 rounded-full relative
          ${color.bg} ${color.border} border-2
          ${sizeClasses[size]}
        `}
        style={{
          boxShadow: `0 0 15px ${color.glow}50, 0 0 30px ${color.glow}30`,
        }}
      >
        {/* Corona para nivel máximo */}
        <motion.span
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
        >
          👑
        </motion.span>
        
        {/* Brillo dorado animado */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        
        <span className={`font-bold ${color.text}`}>Nvl</span>
        <span className={`font-bold ${color.text}`}>{level}</span>
        {showName && (
          <span className="text-gray-400 text-xs ml-1 hidden sm:inline">• {name}</span>
        )}
      </motion.div>
    )
  }
  
  // Badge normal con tooltip opcional
  const badge = (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full
        ${color.bg} ${color.border} border
        ${sizeClasses[size]}
        ${isHighLevel ? 'relative' : ''}
      `}
      style={{
        boxShadow: isHighLevel 
          ? `0 0 10px ${color.glow}30, 0 0 20px ${color.glow}20`
          : `0 0 10px ${color.glow}30`,
      }}
    >
      {/* Efecto de partículas para niveles altos */}
      {isHighLevel && (
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: color.glow }}
              animate={{
                y: [-5, -15, -5],
                x: [i * 8 - 8, (i * 8 - 8) + 4, i * 8 - 8],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </motion.div>
      )}
      
      <span className={`font-bold ${color.text}`}>Nvl</span>
      <span className={`font-bold ${color.text}`}>{level}</span>
      {showName && (
        <span className="text-gray-400 text-xs ml-1 hidden sm:inline">• {name}</span>
      )}
    </motion.div>
  )
  
  if (showTooltip) {
    return (
      <HelpIcon content={tooltipContent} className="inline-flex">
        {badge}
      </HelpIcon>
    )
  }
  
  return badge
})

export default LevelBadge
