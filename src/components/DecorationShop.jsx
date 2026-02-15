import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, Lock, Crown, Star, Gem, Zap, Shield, Flame, Snowflake, CloudLightning, Heart, Moon, Sun, Target, Rocket, Crown as CrownIcon } from 'lucide-react'

// Catálogo de decoraciones disponibles
export const DECORATIONS_CATALOG = [
  {
    id: 'glow_cyan',
    name: 'Brillo Cían',
    description: 'Un aura brillante de color cían',
    price: 50,
    type: 'glow',
    value: '0 0 20px #06b6d4',
    borderColor: '#06b6d4',
    icon: Zap,
    rarity: 'common'
  },
  {
    id: 'glow_pink',
    name: 'Brillo Rosa',
    description: 'Un aura brillante de color rosa',
    price: 50,
    type: 'glow',
    value: '0 0 20px #ec4899',
    borderColor: '#ec4899',
    icon: Heart,
    rarity: 'common'
  },
  {
    id: 'glow_purple',
    name: 'Brillo Púrpura',
    description: 'Un aura brillante de color púrpura',
    price: 75,
    type: 'glow',
    value: '0 0 25px #8b5cf6',
    borderColor: '#8b5cf6',
    icon: Star,
    rarity: 'uncommon'
  },
  {
    id: 'glow_gold',
    name: 'Brillo Dorado',
    description: 'Un aura real de color dorado',
    price: 150,
    type: 'glow',
    value: '0 0 30px #fbbf24',
    borderColor: '#fbbf24',
    icon: Crown,
    rarity: 'rare'
  },
  {
    id: 'border_fire',
    name: 'Borde de Fuego',
    description: 'Borde con efecto de llamas',
    price: 100,
    type: 'border',
    value: '2px solid #ef4444',
    borderColor: '#ef4444',
    icon: Flame,
    rarity: 'uncommon'
  },
  {
    id: 'border_ice',
    name: 'Borde de Hielo',
    description: 'Borde congelado de hielo azul',
    price: 100,
    type: 'border',
    value: '2px solid #3b82f6',
    borderColor: '#3b82f6',
    icon: Snowflake,
    rarity: 'uncommon'
  },
  {
    id: 'border_shield',
    name: 'Borde de Escudo',
    description: 'Borde protector plateado',
    price: 125,
    type: 'border',
    value: '3px solid #6b7280',
    borderColor: '#9ca3af',
    icon: Shield,
    rarity: 'rare'
  },
  {
    id: 'border_lightning',
    name: 'Borde de Trueno',
    description: 'Borde con energía eléctrica',
    price: 175,
    type: 'border',
    value: '3px solid #fbbf24',
    borderColor: '#fbbf24',
    icon: CloudLightning,
    rarity: 'epic'
  },
  {
    id: 'icon_crown',
    name: 'Corona Real',
    description: 'Icono de corona sobre el agente',
    price: 200,
    type: 'icon',
    value: 'crown',
    borderColor: '#fbbf24',
    icon: CrownIcon,
    rarity: 'epic'
  },
  {
    id: 'icon_rocket',
    name: 'Cohete',
    description: 'Icono de cohete sobre el agente',
    price: 100,
    type: 'icon',
    value: 'rocket',
    borderColor: '#ef4444',
    icon: Rocket,
    rarity: 'uncommon'
  },
  {
    id: 'icon_target',
    name: 'Diana',
    description: 'Icono de diana sobre el agente',
    price: 75,
    type: 'icon',
    value: 'target',
    borderColor: '#ec4899',
    icon: Target,
    rarity: 'common'
  },
  {
    id: 'icon_sun',
    name: 'Sol',
    description: 'Icono de sol radiante',
    price: 125,
    type: 'icon',
    value: 'sun',
    borderColor: '#fbbf24',
    icon: Sun,
    rarity: 'rare'
  },
  {
    id: 'icon_moon',
    name: 'Luna',
    description: 'Icono de luna creciente',
    price: 125,
    type: 'icon',
    value: 'moon',
    borderColor: '#8b5cf6',
    icon: Moon,
    rarity: 'rare'
  },
  {
    id: 'icon_gem',
    name: 'Gema',
    description: 'Icono de gema brillante',
    price: 250,
    type: 'icon',
    value: 'gem',
    borderColor: '#10b981',
    icon: Gem,
    rarity: 'legendary'
  },
  {
    id: 'premium_pack',
    name: 'Pack Premium',
    description: 'Paquete con los mejores efectos',
    price: 500,
    type: 'bundle',
    value: ['glow_gold', 'border_lightning', 'icon_gem'],
    borderColor: '#fbbf24',
    icon: Sparkles,
    rarity: 'legendary'
  }
]

// Obtener color de rareza
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common': return 'text-gray-400 border-gray-400'
    case 'uncommon': return 'text-retro-green border-retro-green'
    case 'rare': return 'text-retro-cyan border-retro-cyan'
    case 'epic': return 'text-retro-purple border-retro-purple'
    case 'legendary': return 'text-retro-yellow border-retro-yellow'
    default: return 'text-gray-400 border-gray-400'
  }
}

export function DecorationShop({ 
  isOpen, 
  onClose, 
  coins, 
  ownedDecorations = [], 
  onBuyDecoration,
  activeDecoration,
  onSetActiveDecoration
}) {
  const [previewDecoration, setPreviewDecoration] = useState(null)
  
  if (!isOpen) return null
  
  const handleBuy = (decoration) => {
    if (coins >= decoration.price && !ownedDecorations.includes(decoration.id)) {
      onBuyDecoration(decoration)
    }
  }
  
  const isOwned = (decorationId) => ownedDecorations.includes(decorationId)
  
  const handlePreview = (decoration) => {
    if (isOwned(decoration.id)) {
      if (activeDecoration === decoration.id) {
        onSetActiveDecoration(null)
      } else {
        onSetActiveDecoration(decoration.id)
      }
    } else {
      setPreviewDecoration(decoration.id)
      setTimeout(() => setPreviewDecoration(null), 2000)
    }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-xl border-2 border-retro-purple max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-retro-purple/20 to-retro-pink/20">
            <div className="flex items-center gap-3">
              <Sparkles className="text-retro-purple" size={24} />
              <h2 className="text-xl font-bold text-retro-purple">Tienda de Decoraciones</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-retro-yellow/20 px-3 py-1.5 rounded-lg border border-retro-yellow">
                <span className="text-retro-yellow font-bold">{coins}</span>
                <span className="text-xs text-retro-yellow">LEUROS</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Grid de decoraciones */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {DECORATIONS_CATALOG.map((decoration) => {
                const owned = isOwned(decoration.id)
                const canAfford = coins >= decoration.price
                const isActive = activeDecoration === decoration.id
                const isPreviewing = previewDecoration === decoration.id
                const IconComponent = decoration.icon
                
                return (
                  <motion.div
                    key={decoration.id}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${owned 
                        ? isActive 
                          ? 'bg-retro-purple/20 border-retro-purple' 
                          : 'bg-white/10 border-white/20 hover:border-white/40'
                        : canAfford 
                          ? 'bg-white/10 border-gray-300 dark:border-gray-600 hover:border-retro-purple'
                          : 'bg-gray-100 dark:bg-black/30 border-gray-200 dark:border-gray-700 opacity-60'
                      }
                    `}
                    onClick={() => handlePreview(decoration)}
                    style={{
                      boxShadow: owned && isActive ? decoration.value : 'none'
                    }}
                  >
                    {/* Badge de rareza */}
                    <div className={`absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border ${getRarityColor(decoration.rarity)}`}>
                      {decoration.rarity.toUpperCase()}
                    </div>
                    
                    {/* Icono de la decoración */}
                    <div 
                      className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${decoration.borderColor}20`,
                        color: decoration.borderColor
                      }}
                    >
                      <IconComponent size={24} />
                    </div>
                    
                    {/* Nombre */}
                    <h3 className="text-sm font-bold text-center mb-1" style={{ color: decoration.borderColor }}>
                      {decoration.name}
                    </h3>
                    
                    {/* Descripción */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                      {decoration.description}
                    </p>
                    
                    {/* Estado */}
                    {owned ? (
                      <div className="flex items-center justify-center gap-1">
                        {isActive ? (
                          <span className="text-xs text-retro-purple font-bold flex items-center gap-1">
                            <Check size={12} /> ACTIVO
                          </span>
                        ) : (
                          <span className="text-xs text-retro-green font-bold flex items-center gap-1">
                            <Check size={12} /> COMPRADO
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {canAfford ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBuy(decoration)
                            }}
                            className="text-xs bg-retro-yellow text-black font-bold px-3 py-1 rounded-full hover:bg-retro-yellow/80 transition-colors"
                          >
                            {decoration.price} 🪙
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Lock size={10} /> {decoration.price} 🪙
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Preview animation */}
                    {isPreviewing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
                      >
                        <span className="text-xs text-white font-bold">Vista previa</span>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Función para obtener los datos de una decoración por ID
export function getDecorationById(id) {
  return DECORATIONS_CATALOG.find(d => d.id === id)
}

// Hook para gestionar el estado de decoraciones del usuario
export function useDecorations(initialDecorations = []) {
  const [ownedDecorations, setOwnedDecorations] = useState(initialDecorations)
  const [activeDecoration, setActiveDecoration] = useState(null)
  
  const buyDecoration = (decoration) => {
    if (!ownedDecorations.includes(decoration.id)) {
      setOwnedDecorations(prev => [...prev, decoration.id])
    }
  }
  
  const activateDecoration = (decorationId) => {
    if (ownedDecorations.includes(decorationId)) {
      setActiveDecoration(decorationId)
    }
  }
  
  const deactivateDecoration = () => {
    setActiveDecoration(null)
  }
  
  return {
    ownedDecorations,
    activeDecoration,
    buyDecoration,
    activateDecoration,
    deactivateDecoration,
    setOwnedDecorations,
    setActiveDecoration
  }
}
