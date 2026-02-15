import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * CoinDisplay - Muestra el saldo de Leuros con animación
 * Icono de Leuro y animación al cambiar valor
 */
export function CoinDisplay({ 
  coins = 0, 
  showLabel = true,
  size = 'md',
  previousCoins = null
}) {
  const [displayCoins, setDisplayCoins] = useState(coins)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState(null) // 'increase' | 'decrease'
  
  // Detectar cambio y animate
  useEffect(() => {
    if (previousCoins !== null && coins !== previousCoins) {
      setIsAnimating(true)
      setAnimationType(coins > previousCoins ? 'increase' : 'decrease')
      
      // Animación de números
      const diff = coins - previousCoins
      const steps = Math.abs(diff)
      const stepTime = Math.max(200, Math.min(500, steps * 50))
      let current = previousCoins
      
      const interval = setInterval(() => {
        if (diff > 0) {
          current = Math.min(current + 1, coins)
        } else {
          current = Math.max(current - 1, coins)
        }
        setDisplayCoins(current)
        
        if (current === coins) {
          clearInterval(interval)
          setTimeout(() => setIsAnimating(false), 300)
        }
      }, stepTime / steps)
      
      return () => clearInterval(interval)
    } else {
      setDisplayCoins(coins)
    }
  }, [coins, previousCoins])
  
  const sizeClasses = {
    sm: { icon: 14, text: 'text-sm' },
    md: { icon: 18, text: 'text-base' },
    lg: { icon: 24, text: 'text-xl' },
  }
  
  const sizeConfig = sizeClasses[size]
  
  // Formatear número con separadores de miles
  const formattedCoins = displayCoins.toLocaleString('es-ES')
  
  return (
    <motion.div
      initial={false}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        inline-flex items-center gap-1.5 
        bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-1
        ${sizeConfig.text}
      `}
    >
      {/* Icono de Leuro */}
      <motion.span
        animate={isAnimating ? { 
          rotate: animationType === 'increase' ? 360 : -360,
          scale: [1, 1.3, 1]
        } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <svg
          width={sizeConfig.icon}
          height={sizeConfig.icon}
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
      
      {/* Valor de Leuros */}
      <AnimatePresence mode="wait">
        <motion.span
          key={displayCoins}
          initial={{ opacity: 0, y: animationType === 'increase' ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: animationType === 'increase' ? 10 : -10 }}
          className={`
            font-bold tabular-nums
            ${isAnimating 
              ? (animationType === 'increase' ? 'text-retro-green' : 'text-retro-red')
              : 'text-amber-400'
            }
          `}
        >
          {formattedCoins}
        </motion.span>
      </AnimatePresence>
      
      {showLabel && (
        <span className="text-gray-500 text-xs hidden sm:inline">Leuros</span>
      )}
    </motion.div>
  )
}

export default CoinDisplay
