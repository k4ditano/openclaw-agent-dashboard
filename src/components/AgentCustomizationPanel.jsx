import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Eye, EyeOff, Sparkles, Zap, Crown, Star, Gem, Rocket, Target, Sun, Moon, Flame, Snowflake, CloudLightning, Shield, Heart } from 'lucide-react'
import { DECORATIONS_CATALOG, getDecorationById } from './DecorationShop'

// Mapeo de iconos
const iconMap = {
  Zap, Crown, Star, Gem, Rocket, Target, Sun, Moon, Flame, Snowflake, Shield, CloudLightning, Heart, Sparkles
}

export function AgentCustomizationPanel({ 
  ownedDecorations = [], 
  activeDecoration, 
  onActivateDecoration,
  onDeactivateDecoration,
  agentName = 'Agente',
  agentColor = '#8b5cf6'
}) {
  // Filtrar solo las decoraciones que el usuario posee
  const owned = DECORATIONS_CATALOG.filter(d => ownedDecorations.includes(d.id))
  
  // Si no hay decoraciones compradas
  if (owned.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-purple p-4">
        <h3 className="text-retro-purple font-mono text-sm mb-3 flex items-center gap-2">
          <Sparkles size={16} />
          PERSONALIZACIÓN
        </h3>
        <div className="text-center py-6">
          <Sparkles className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-500">Aún no tienes decoraciones</p>
          <p className="text-xs text-gray-400 mt-1">Visita la tienda para comprar</p>
        </div>
      </div>
    )
  }
  
  // Agrupar por tipo
  const glows = owned.filter(d => d.type === 'glow')
  const borders = owned.filter(d => d.type === 'border')
  const icons = owned.filter(d => d.type === 'icon')
  
  const renderDecorationItem = (decoration) => {
    const isActive = activeDecoration === decoration.id
    const IconComponent = iconMap[decoration.icon.name] || Sparkles
    
    return (
      <motion.button
        key={decoration.id}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => isActive ? onDeactivateDecoration() : onActivateDecoration(decoration.id)}
        className={`
          relative p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1
          ${isActive 
            ? 'bg-retro-purple/20 border-retro-purple shadow-lg' 
            : 'bg-white/10 border-white/20 hover:border-white/40'
          }
        `}
        style={{
          boxShadow: isActive ? decoration.value : 'none'
        }}
        title={decoration.description}
      >
        {/* Indicador activo */}
        {isActive && (
          <div className="absolute -top-1 -right-1 bg-retro-purple rounded-full p-0.5">
            <Check size={10} className="text-white" />
          </div>
        )}
        
        {/* Icono */}
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: `${decoration.borderColor}20`,
            color: decoration.borderColor
          }}
        >
          <IconComponent size={16} />
        </div>
        
        {/* Nombre */}
        <span className="text-[10px] font-medium" style={{ color: decoration.borderColor }}>
          {decoration.name}
        </span>
      </motion.button>
    )
  }
  
  return (
    <div className="bg-white/60 dark:bg-black/60 rounded-lg border-2 border-retro-purple p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-retro-purple font-mono text-sm flex items-center gap-2">
          <Sparkles size={16} />
          PERSONALIZACIÓN
        </h3>
        
        {/* Mostrardecoración activa actual */}
        {activeDecoration && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Activa:</span>
            <span 
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${getDecorationById(activeDecoration)?.borderColor}20`,
                color: getDecorationById(activeDecoration)?.borderColor
              }}
            >
              {getDecorationById(activeDecoration)?.name}
            </span>
            <button
              onClick={onDeactivateDecoration}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Desactivar"
            >
              <X size={12} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>
      
      {/* GLOW */}
      {glows.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Brillos</h4>
          <div className="flex flex-wrap gap-2">
            {glows.map(renderDecorationItem)}
          </div>
        </div>
      )}
      
      {/* BORDERS */}
      {borders.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Bordes</h4>
          <div className="flex flex-wrap gap-2">
            {borders.map(renderDecorationItem)}
          </div>
        </div>
      )}
      
      {/* ICONS */}
      {icons.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Iconos</h4>
          <div className="flex flex-wrap gap-2">
            {icons.map(renderDecorationItem)}
          </div>
        </div>
      )}
    </div>
  )
}

// Preview de decoración aplicado a un agente
export function DecorationPreview({ decorationId, children }) {
  const decoration = getDecorationById(decorationId)
  
  if (!decoration) return children
  
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
      style={{
        boxShadow: decoration.value
      }}
    >
      {decoration.type === 'icon' && (
        <div className="absolute -top-2 -right-2 z-10">
          {(() => {
            const IconComponent = iconMap[decoration.icon.name] || Sparkles
            return (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: decoration.borderColor,
                  boxShadow: `0 0 10px ${decoration.borderColor}`
                }}
              >
                <IconComponent size={12} className="text-white" />
              </div>
            )
          })()}
        </div>
      )}
      {children}
    </motion.div>
  )
}
