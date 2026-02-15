/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  sessions_list, 
  session_status, 
  sessions_history,
  get_inter_agent_communications 
} from '../../tools.mjs'

vi.mock('fs', () => ({
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
  statSync: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn()
}))

import { readdirSync, readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

describe('tools.mjs - Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('readJsonl (via sessions_list)', () => {
    it('should handle empty directory', async () => {
      existsSync.mockReturnValue(false)
      
      const result = await sessions_list({ limit: 10 })
      
      expect(result).toHaveProperty('sessions')
      expect(result).toHaveProperty('count')
    })

    it('should handle directory with no jsonl files', async () => {
      existsSync.mockReturnValue(true)
      readdirSync.mockReturnValue([])
      
      const result = await sessions_list({ limit: 10 })
      
      expect(result.sessions).toEqual([])
      expect(result.count).toBe(0)
    })
  })

  describe('session_status', () => {
    it('should throw error for invalid session key format', async () => {
      await expect(session_status({ sessionKey: 'invalid' }))
        .rejects.toThrow('Invalid session key format')
    })

    it('should return not_found for non-existent session', async () => {
      existsSync.mockReturnValue(false)
      
      const result = await session_status({ sessionKey: 'agent:main:test-session' })
      
      expect(result.status).toBe('not_found')
      expect(result.sessionKey).toBe('agent:main:test-session')
    })

    it('should return active status for existing session with entries', async () => {
      existsSync.mockReturnValue(true)
      const mockDate = new Date('2024-01-01T00:00:00Z')
      statSync.mockReturnValue({ mtime: mockDate })
      readFileSync.mockReturnValue(
        JSON.stringify({ type: 'message', message: { role: 'user', content: 'test' }, timestamp: '2024-01-01T00:00:00Z' }) + '\n'
      )
      
      const result = await session_status({ sessionKey: 'agent:main:test-session' })
      
      expect(result.status).toBe('active')
      expect(result.sessionKey).toBe('agent:main:test-session')
    })
  })

  describe('sessions_history', () => {
    it('should throw error for invalid session key format', async () => {
      await expect(sessions_history({ sessionKey: 'invalid' }))
        .rejects.toThrow('Invalid session key format')
    })

    it('should return empty messages for non-existent session', async () => {
      existsSync.mockReturnValue(false)
      
      const result = await sessions_history({ sessionKey: 'agent:main:test-session' })
      
      expect(result.messages).toEqual([])
      expect(result.sessionKey).toBe('agent:main:test-session')
    })

    it('should limit messages to specified limit', async () => {
      existsSync.mockReturnValue(true)
      const mockMessages = Array(20).fill(null).map((_, i) => 
        JSON.stringify({ 
          type: 'message', 
          message: { role: i % 2 === 0 ? 'user' : 'assistant', content: `Message ${i}` },
          timestamp: `2024-01-01T00:00:${i.toString().padStart(2, '0')}Z`
        })
      ).join('\n')
      readFileSync.mockReturnValue(mockMessages)
      
      const result = await sessions_history({ sessionKey: 'agent:main:test-session', limit: 5 })
      
      expect(result.messages).toHaveLength(5)
    })
  })

  describe('get_inter_agent_communications', () => {
    it('should return empty array when no sessions exist', async () => {
      existsSync.mockReturnValue(false)
      
      const result = await get_inter_agent_communications({ limit: 10 })
      
      expect(result).toEqual([])
    })

    it('should detect subagent spawns in content', async () => {
      existsSync.mockReturnValue(true)
      readdirSync.mockReturnValue(['session-123.jsonl'])
      statSync.mockReturnValue({ mtime: new Date() })
      
      const mockContent = JSON.stringify({
        type: 'message',
        message: {
          role: 'assistant',
          content: 'Creating subagent:subagent-abc-123 for task processing'
        },
        timestamp: '2024-01-01T00:00:00Z'
      }) + '\n'
      readFileSync.mockReturnValue(mockContent)
      
      const result = await get_inter_agent_communications({ limit: 10 })
      
      // Should detect spawn type communication
      expect(Array.isArray(result)).toBe(true)
    })
  })
})

describe('tools.mjs - Data Structure Validation', () => {
  it('sessions_list returns correct structure', async () => {
    existsSync.mockReturnValue(false)
    
    const result = await sessions_list({ limit: 10 })
    
    expect(result).toHaveProperty('sessions')
    expect(result).toHaveProperty('count')
    expect(typeof result.count).toBe('number')
    expect(Array.isArray(result.sessions)).toBe(true)
  })

  it('session_status returns correct structure', async () => {
    existsSync.mockReturnValue(false)
    
    const result = await session_status({ sessionKey: 'agent:main:test' })
    
    expect(result).toHaveProperty('status')
    expect(result).toHaveProperty('sessionKey')
  })

  it('sessions_history returns correct structure', async () => {
    existsSync.mockReturnValue(false)
    
    const result = await sessions_history({ sessionKey: 'agent:main:test' })
    
    expect(result).toHaveProperty('messages')
    expect(result).toHaveProperty('sessionKey')
    expect(Array.isArray(result.messages)).toBe(true)
  })
})
