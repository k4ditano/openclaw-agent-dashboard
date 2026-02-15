import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Hook para persistencia de preferencias en localStorage
 * @param {string} key - Clave para localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[value, setValue]} - Valor actual y función para actualizar
 */
export function useLocalStorage(key, initialValue) {
  // useState con función de inicialización (lazy initialization)
  // Esto evita el error "Cannot access before initialization"
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Función para actualizar el valor
  const setValue = useCallback((value) => {
    try {
      // Permitir que value sea una función
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Escuchar cambios en otras pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

/**
 * Hook para persistencia de la última vista del agente seleccionado
 */
export function useLastSelectedAgent() {
  const [lastAgent, setLastAgent] = useLocalStorage('lastSelectedAgent', 'er-hineda')
  return [lastAgent, setLastAgent]
}

/**
 * Hook para persistencia de la pestaña activa
 */
export function useLastActiveTab() {
  const [lastTab, setLastTab] = useLocalStorage('lastActiveTab', 'metrics')
  return [lastTab, setLastTab]
}

/**
 * Hook para persistencia de la decoración activa
 */
export function useActiveDecoration() {
  const [decoration, setDecoration] = useLocalStorage('activeDecoration', null)
  return [decoration, setDecoration]
}

/**
 * Hook para persistencia de decoraciones compradas
 */
export function useOwnedDecorations() {
  const [decorations, setDecorations] = useLocalStorage('ownedDecorations', [])
  return [decorations, setDecorations]
}

/**
 * Hook para persistencia de preferencias de UI
 */
export function useUIPreferences() {
  const [preferences, setPreferences] = useLocalStorage('uiPreferences', {
    showTooltips: true,
    animationsEnabled: true,
    compactMode: false
  })

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }, [setPreferences])

  return { preferences, updatePreference }
}
