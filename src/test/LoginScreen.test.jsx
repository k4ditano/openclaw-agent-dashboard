import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginScreen } from '../App'

// Mock fetch
global.fetch = vi.fn()

describe('LoginScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    global.fetch.mockReset()
  })

  it('renders login form', () => {
    render(<LoginScreen onLogin={() => {}} />)
    
    expect(screen.getByPlaceholderText('USUARIO')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('PASSWORD')).toBeInTheDocument()
    expect(screen.getByText('ACCEDER')).toBeInTheDocument()
  })

  it('shows JWT Authentication text', () => {
    render(<LoginScreen onLogin={() => {}} />)
    
    expect(screen.getByText('JWT Authentication')).toBeInTheDocument()
  })

  it('updates username state on input', () => {
    render(<LoginScreen onLogin={() => {}} />)
    
    const usernameInput = screen.getByPlaceholderText('USUARIO')
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    expect(usernameInput.value).toBe('testuser')
  })

  it('updates password state on input', () => {
    render(<LoginScreen onLogin={() => {}} />)
    
    const passwordInput = screen.getByPlaceholderText('PASSWORD')
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    
    expect(passwordInput.value).toBe('testpass')
  })

  it('calls onLogin on successful authentication', async () => {
    const onLogin = vi.fn()
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-jwt-token' })
    })
    
    render(<LoginScreen onLogin={onLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('USUARIO'), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByPlaceholderText('PASSWORD'), { target: { value: 'testpass' } })
    fireEvent.click(screen.getByText('ACCEDER'))
    
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalled()
    })
  })

  it('stores JWT token in localStorage on success', async () => {
    const onLogin = vi.fn()
    const testToken = 'test-jwt-token-12345'
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: testToken })
    })
    
    render(<LoginScreen onLogin={onLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText('USUARIO'), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByPlaceholderText('PASSWORD'), { target: { value: 'testpass' } })
    fireEvent.click(screen.getByText('ACCEDER'))
    
    await waitFor(() => {
      expect(localStorage.getItem('jwt_token')).toBe(testToken)
    })
  })
})
