import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme, ThemeToggle } from '../App'

// Test component that uses theme
function TestComponent() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-status">{isDark ? 'dark' : 'light'}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('provides dark theme by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme-status').textContent).toBe('dark')
  })

  it('toggles theme when toggleTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const toggleBtn = screen.getByTestId('toggle-btn')
    fireEvent.click(toggleBtn)
    
    expect(screen.getByTestId('theme-status').textContent).toBe('light')
  })

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const toggleBtn = screen.getByTestId('toggle-btn')
    fireEvent.click(toggleBtn)
    
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('loads theme from localStorage', () => {
    localStorage.setItem('theme', 'light')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme-status').textContent).toBe('light')
  })
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders button with accessible label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label')
  })

  it('shows correct text in dark mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    expect(screen.getByText('Oscuro')).toBeInTheDocument()
  })

  it('shows correct text in light mode', () => {
    localStorage.setItem('theme', 'light')
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    expect(screen.getByText('Claro')).toBeInTheDocument()
  })

  it('toggles theme on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // After click, should be in light mode
    expect(screen.getByText('Claro')).toBeInTheDocument()
  })
})
