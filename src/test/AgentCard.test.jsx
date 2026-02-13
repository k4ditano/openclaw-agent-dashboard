import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PixelCreature, AgentCard, agents } from '../App'

describe('PixelCreature', () => {
  it('renders without crashing', () => {
    const { container } = render(<PixelCreature type="coder" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders different creature types', () => {
    const creatures = ['er-hineda', 'coder', 'netops', 'pr-reviewer']
    
    creatures.forEach(type => {
      const { container } = render(<PixelCreature type={type} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('accepts size prop', () => {
    const { container } = render(<PixelCreature type="coder" size={100} />)
    const div = container.firstChild
    expect(div).toHaveStyle({ width: '100px', height: '100px' })
  })

  it('renders with default size', () => {
    const { container } = render(<PixelCreature type="coder" />)
    const div = container.firstChild
    expect(div).toHaveStyle({ width: '80px', height: '80px' })
  })
})

describe('AgentCard', () => {
  const mockAgent = agents[0] // er-hineda

  const mockAgentData = {
    'er-hineda': {
      status: 'running',
      task: 'Building something',
      progress: 75
    }
  }

  it('renders agent name', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        isSelected={false} 
        onClick={() => {}} 
        agentData={mockAgentData}
      />
    )
    
    expect(screen.getByText('er Hineda')).toBeInTheDocument()
  })

  it('displays agent status', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        isSelected={false} 
        onClick={() => {}} 
        agentData={mockAgentData}
      />
    )
    
    expect(screen.getByText('RUNNING')).toBeInTheDocument()
  })

  it('displays progress percentage', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        isSelected={false} 
        onClick={() => {}} 
        agentData={mockAgentData}
      />
    )
    
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows "Sin actividad" when no task', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        isSelected={false} 
        onClick={() => {}} 
        agentData={{ 'er-hineda': { status: 'idle', progress: 0 } }}
      />
    )
    
    expect(screen.getByText('Sin actividad')).toBeInTheDocument()
  })

  it('shows OFFLINE when no data', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        isSelected={false} 
        onClick={() => {}} 
        agentData={{}}
      />
    )
    
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('is clickable', () => {
    const { container } = render(
      <AgentCard 
        agent={mockAgent} 
        isSelected={false} 
        onClick={() => {}} 
        agentData={mockAgentData}
      />
    )
    
    const card = container.querySelector('.cursor-pointer')
    expect(card).toBeInTheDocument()
  })
})

describe('agents data', () => {
  it('has correct number of agents', () => {
    expect(agents).toHaveLength(5)
  })

  it('each agent has required properties', () => {
    agents.forEach(agent => {
      expect(agent).toHaveProperty('id')
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('emoji')
      expect(agent).toHaveProperty('color')
      expect(agent).toHaveProperty('borderColor')
      expect(agent).toHaveProperty('glowColor')
    })
  })
})
