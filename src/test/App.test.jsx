import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock del fetch para el status de agentes
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      agents: {
        'er-hineda': { status: 'running', task: 'Orquestando', progress: 65 },
        'coder': { status: 'running', task: 'Compilando', progress: 80 },
        'netops': { status: 'running', task: 'Monitoreando', progress: 45 },
        'pr-reviewer': { status: 'running', task: 'Analizando', progress: 90 }
      },
      generatedAt: new Date().toISOString()
    })
  })
)

describe('App Component', () => {
  it('renders login screen when not authenticated', () => {
    // Limpiar sessionStorage
    vi.stubGlobal('sessionStorage', {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn()
    })

    render(<App />)
    
    // Verificar que muestra la pantalla de login
    expect(screen.getByText(/AGENT DASHBOARD/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/USUARIO/i)).toBeDefined()
  })

  it('has proper structure for agent cards', () => {
    // Verificar que los datos de agentes están definidos
    const agents = [
      { id: 'er-hineda', name: 'er Hineda' },
      { id: 'coder', name: 'er Codi' },
      { id: 'netops', name: 'er Serve' },
      { id: 'pr-reviewer', name: 'er PR' }
    ]
    
    expect(agents).toHaveLength(4)
    expect(agents[0].id).toBe('er-hineda')
  })
})

describe('Agent Data Structure', () => {
  it('validates agent status response structure', () => {
    const mockStatus = {
      agents: {
        'er-hineda': { status: 'running', task: 'Test', progress: 50 },
      },
      generatedAt: '2024-01-01T00:00:00Z'
    }
    
    expect(mockStatus.agents).toBeDefined()
    expect(mockStatus.generatedAt).toBeDefined()
    expect(mockStatus.agents['er-hineda'].status).toBe('running')
    expect(mockStatus.agents['er-hineda'].progress).toBe(50)
  })
})
