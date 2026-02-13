import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock EventSource for SSE
class MockEventSource {
  constructor() {
    this.readyState = 1
    this.onopen = null
    this.onmessage = null
    this.onerror = null
  }
  close() {}
}

window.EventSource = MockEventSource

// Mock fetch
global.fetch = vi.fn()
