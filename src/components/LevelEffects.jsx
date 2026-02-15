import { motion } from 'framer-motion'
import { useMemo } from 'react'

/**
 * IdleAnimation - Animación de "idle" para agentes de alto nivel (nivel 8+)
 * Muestra partículas flotantes y efectos de respiración
 */
export function IdleAnimation({ level, agentColor = '#8b5cf6', isActive = false, children }) {
  // Solo mostrar animaciones para niveles 8+
  const showIdleEffects = level >= 8
  
  // Generar partículas flotantes
  const particles = useMemo(() => {
    if (!showIdleEffects) return []
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      delay: i * 0.5,
      duration: 3 + Math.random() * 2,
      size: 4 + Math.random() * 4,
      xOffset: Math.random() * 40 - 20
    }))
  }, [showIdleEffects])

  if (!showIdleEffects) return <>{children}</>

  return (
    <div className="relative inline-block">
      {/* Partículas flotantes */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.6 : 0.3 }}
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: agentColor,
              width: particle.size,
              height: particle.size,
              left: '50%',
              top: '50%'
            }}
            animate={{
              y: [-20, -40, -20],
              x: [0, particle.xOffset, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
      
      {/* Efecto de respiración/brillo */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${agentColor}20 0%, transparent 70%)`
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {children}
    </div>
  )
}

/**
 * MaxLevelEffects - Efectos visuales exclusivos para nivel máximo (10)
 * Corona dorada, partículas legendarias, resplandor
 */
export function MaxLevelEffects({ level, children }) {
  const isMaxLevel = level === 10
  
  if (!isMaxLevel) return <>{children}</>

  return (
    <div className="relative">
      {/* Corona legendaria */}
      <motion.div
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="relative">
          {/* Corona emoji con brillo */}
          <motion.span
            className="text-2xl filter drop-shadow-lg"
            style={{
              filter: 'drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 16px #f59e0b)'
            }}
            animate={{
              y: [0, -3, 0],
              textShadow: [
                '0 0 8px #fbbf24',
                '0 0 16px #fbbf24, 0 0 24px #f59e0b',
                '0 0 8px #fbbf24'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            👑
          </motion.span>
          
          {/* Corona de partículas doradas */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-retro-yellow"
              style={{
                left: `${20 + i * 15}%`,
                top: '-4px'
              }}
              animate={{
                y: [-2, -6, -2],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Resplandor dorado */}
      <motion.div
        className="absolute inset-0 -m-2 rounded-xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
          zIndex: -1
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Borde dorado animado */}
      <motion.div
        className="absolute inset-0 -m-0.5 rounded-xl pointer-events-none border-2 border-retro-yellow/50"
        animate={{
          borderColor: [
            'rgba(251, 191, 36, 0.3)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(251, 191, 36, 0.3)'
          ],
          boxShadow: [
            '0 0 10px rgba(251, 191, 36, 0.2)',
            '0 0 20px rgba(251, 191, 36, 0.5)',
            '0 0 10px rgba(251, 191, 36, 0.2)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Estrellas brillantes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 45
        return (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1.5 h-1.5"
            style={{
              left: '50%',
              top: '50%',
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5 + Math.random(),
              delay: i * 0.15,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <span className="text-xs">⭐</span>
          </motion.div>
        )
      })}
      
      {children}
    </div>
  )
}

/**
 * LevelProgressGlow - Efecto de brillo en la barra de progreso según nivel
 */
export function LevelProgressGlow({ level, children }) {
  const glowIntensity = useMemo(() => {
    if (level >= 10) return { opacity: 0.8, blur: 12, color: '#fbbf24' }
    if (level >= 8) return { opacity: 0.6, blur: 8, color: '#a855f7' }
    if (level >= 5) return { opacity: 0.4, blur: 6, color: '#6366f1' }
    return { opacity: 0, blur: 0, color: '#10b981' }
  }, [level])

  if (glowIntensity.opacity === 0) return <>{children}</>

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-full blur-md"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowIntensity.color}, transparent)`,
          opacity: glowIntensity.opacity * 0.5
        }}
        animate={{
          opacity: [glowIntensity.opacity * 0.3, glowIntensity.opacity * 0.6, glowIntensity.opacity * 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      {children}
    </div>
  )
}

/**
 * XPParticleEffect - Efecto de partículas al ganar XP
 */
export function XPParticleEffect({ isActive, color = '#fbbf24', children }) {
  if (!isActive) return <>{children}</>

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * Math.PI * 2,
    speed: 50 + Math.random() * 30
  }))

  return (
    <div className="relative">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: color,
            left: '50%',
            top: '50%'
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(particle.angle) * particle.speed,
            y: Math.sin(particle.angle) * particle.speed,
            opacity: 0,
            scale: 0
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut'
          }}
        />
      ))}
      {children}
    </div>
  )
}
