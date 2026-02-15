import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Tooltip component - Muestra información adicional al hacer hover
 */
export function Tooltip({ children, content, position = 'top', delay = 300, className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  const timeoutRef = useRef(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        let x = rect.left + rect.width / 2
        let y = rect.top

        if (position === 'bottom') {
          y = rect.bottom
        } else if (position === 'left') {
          x = rect.left
          y = rect.top + rect.height / 2
        } else if (position === 'right') {
          x = rect.right
          y = rect.top + rect.height / 2
        }

        setCoords({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
  }

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
            style={{ position: 'fixed', left: coords.x, top: coords.y }}
          >
            <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap max-w-xs">
              {content}
              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * HelpIcon - Muestra un tooltip de ayuda con información
 */
export function HelpIcon({ content, className = '' }) {
  return (
    <Tooltip content={content} position="right" className={className}>
      <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-500/20 text-gray-500 text-[10px] font-bold cursor-help hover:bg-gray-500/30 transition-colors">
        ?
      </div>
    </Tooltip>
  )
}

/**
 * InfoBadge - Muestra información contextual con tooltip
 */
export function InfoBadge({ icon: Icon, label, value, tooltip, color = 'retro-purple', className = '' }) {
  const colorClasses = {
    'retro-purple': 'text-retro-purple bg-retro-purple/10 border-retro-purple/30',
    'retro-cyan': 'text-retro-cyan bg-retro-cyan/10 border-retro-cyan/30',
    'retro-green': 'text-retro-green bg-retro-green/10 border-retro-green/30',
    'retro-yellow': 'text-retro-yellow bg-retro-yellow/10 border-retro-yellow/30',
    'retro-pink': 'text-retro-pink bg-retro-pink/10 border-retro-pink/30'
  }

  return (
    <Tooltip content={tooltip} position="bottom" delay={200}>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorClasses[color] || colorClasses['retro-purple']} ${className}`}>
        {Icon && <Icon size={14} />}
        <span className="text-xs font-medium">{label}:</span>
        <span className="text-xs font-bold">{value}</span>
      </div>
    </Tooltip>
  )
}
