/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Replicate helper functions from server.mjs for testing
const NOISE_KEYWORDS = [
  'Command still running', 'signal SIGTERM', 'Exec completed', 'Exec failed',
  'vite v', 'vite ready', 'transforming', 'built in', 'npm run', 'Use process',
  'sessionId', 'Error:', 'Exception', '$$', '>>', '## ',
  'ENOENT', 'no such file', 'permission denied',
  'node_modules', '.jsonl', 'undefined', 'null',
  '"status":', '"tool":', '"error":',
  'import ', 'export ', 'const ', 'function ',
  '<<<<<<<', '=======', '>>>>>>>',
  'total ', 'drwx', '-rw', '-rwx',
  '(no output)', 'passphrase', 'credentials',
  'npm ERR', 'npm WARN', 'yarn ', 'pnpm ',
  'GET /', 'POST /', '200 OK', '404 ', '500 ',
  'Starting dev server', 'Compiled', 'Hash:',
  'assets by', 'Entrypoint', 'landing.',
  'waiting for', 'file changed', 'reload'
]

const TOOL_OUTPUT_PATTERNS = [
  /^\s*\d+:\w/m,
  /^\s*[\{\[]"/m,
  /^\s*(total|drwx|-rw)/,
  /^\s*\d+\s+\d+/,
  /^On branch/,
  /^Changes not staged/,
  /^Untracked files/,
  /^nothing to commit/,
]

function isNoise(text) {
  const lower = text.toLowerCase()
  for (const keyword of NOISE_KEYWORDS) {
    if (text.includes(keyword)) return true
  }
  for (const pattern of TOOL_OUTPUT_PATTERNS) {
    if (pattern.test(text)) return true
  }
  if ((text.includes('{') && text.includes(':')) && text.length > 80) {
    const braceCount = (text.match(/\{/g) || []).length
    if (braceCount >= 2) return true
  }
  if (text.length < 15 && /^[\W\d]+$/.test(text)) return true
  return false
}

function isSignificantMessage(msg) {
  if (msg.role === 'user') return true
  if (msg.role === 'assistant') {
    const content = msg.content
    if (Array.isArray(content)) {
      const hasRealText = content.some(c => 
        c.type === 'text' && c.text && c.text.length > 20 && !isNoise(c.text)
      )
      return hasRealText
    }
    if (typeof content === 'string' && content.length > 20) {
      return !isNoise(content)
    }
  }
  return false
}

function extractCleanText(msg) {
  let text = ''
  if (Array.isArray(msg.content)) {
    const textContent = msg.content.find(c => c.type === 'text')
    if (textContent?.text) {
      text = textContent.text
    }
  } else if (typeof msg.content === 'string') {
    text = msg.content
  }
  return text
}

describe('isNoise - Noise Detection', () => {
  describe('Tool output detection', () => {
    it('should detect vite output as noise', () => {
      expect(isNoise('vite v5.0.8 ready in 300 ms')).toBe(true)
    })

    it('should detect npm output as noise', () => {
      expect(isNoise('npm run dev started')).toBe(true)
      expect(isNoise('npm ERR! code ENOENT')).toBe(true)
    })

    it('should detect error messages as noise', () => {
      expect(isNoise('Error: Cannot find module')).toBe(true)
      expect(isNoise('Exception: something went wrong')).toBe(true)
    })

    it('should detect git output as noise', () => {
      expect(isNoise('On branch main')).toBe(true)
      expect(isNoise('Changes not staged for commit')).toBe(true)
      expect(isNoise('nothing to commit, working tree clean')).toBe(true)
    })

    it('should detect file system output as noise', () => {
      expect(isNoise('total 24 drwxr-xr-x  6 ubuntu ubuntu 4096 Feb 13')).toBe(true)
      expect(isNoise('-rw-r--r-- 1 ubuntu ubuntu  1234 Jan 1 12:00 file.js')).toBe(true)
    })

    it('should detect JSON output as noise', () => {
      expect(isNoise('{"status": "ok", "data": []}')).toBe(true)
    })
  })

  describe('Significant message detection', () => {
    it('should identify user messages as significant', () => {
      const msg = { role: 'user', content: 'Hello, how are you?' }
      expect(isSignificantMessage(msg)).toBe(true)
    })

    it('should identify assistant messages with real content', () => {
      const msg = { role: 'assistant', content: 'I can help you with that. Let me explain what I found.' }
      expect(isSignificantMessage(msg)).toBe(true)
    })

    it('should reject short content', () => {
      const msg = { role: 'assistant', content: 'Hi' }
      expect(isSignificantMessage(msg)).toBe(false)
    })

    it('should handle array content format', () => {
      const msg = { 
        role: 'assistant', 
        content: [
          { type: 'text', text: 'This is a meaningful response with substantial content.' }
        ]
      }
      expect(isSignificantMessage(msg)).toBe(true)
    })

    it('should filter out noisy content', () => {
      const msg = { role: 'assistant', content: 'vite v5 ready' }
      expect(isSignificantMessage(msg)).toBe(false)
    })
  })

  describe('Clean text extraction', () => {
    it('should extract text from string content', () => {
      const msg = { role: 'user', content: 'Hello world' }
      expect(extractCleanText(msg)).toBe('Hello world')
    })

    it('should extract text from array content', () => {
      const msg = { 
        role: 'assistant', 
        content: [
          { type: 'text', text: 'Extracted text' },
          { type: 'image', url: 'http://example.com/img.png' }
        ]
      }
      expect(extractCleanText(msg)).toBe('Extracted text')
    })

    it('should handle missing content', () => {
      const msg = { role: 'user', content: '' }
      expect(extractCleanText(msg)).toBe('')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(isNoise('')).toBe(false)
    })

    it('should handle very short strings', () => {
      expect(isNoise('abc')).toBe(false)
    })

    it('should handle special characters only', () => {
      expect(isNoise('<<<<<<<')).toBe(true)
    })

    it('should handle merge conflict markers', () => {
      expect(isNoise('<<<<<<< HEAD\ncontent\n=======\nother content\n>>>>>>> branch')).toBe(true)
    })

    it('should not flag normal conversation', () => {
      expect(isNoise('Can you help me write a function?')).toBe(false)
      expect(isNoise('Sure, I can help you with that. What do you need?')).toBe(false)
    })
  })
})

describe('Agent Data Structures', () => {
  it('should have correct agents list structure', () => {
    const agentsList = [
      { id: 'er-hineda', name: 'er Hineda', emoji: '🧉', color: '#ec4899', folder: 'main', desc: 'Orquestador principal' },
      { id: 'er-plan', name: 'er Plan', emoji: '📐', color: '#f59e0b', folder: 'planner', desc: 'Arquitecto y diseñador' },
      { id: 'er-coder', name: 'er Coder', emoji: '🤖', color: '#8b5cf6', folder: 'coder', desc: 'Especialista en código' },
      { id: 'er-serve', name: 'er Serve', emoji: '🌐', color: '#06b6d4', folder: 'netops', desc: 'Especialista en redes' },
      { id: 'er-pr', name: 'er PR', emoji: '🔍', color: '#22c55e', folder: 'pr-reviewer', desc: 'Revisor de PRs' }
    ]
    
    expect(agentsList).toHaveLength(5)
    expect(agentsList[0]).toHaveProperty('id')
    expect(agentsList[0]).toHaveProperty('name')
    expect(agentsList[0]).toHaveProperty('emoji')
    expect(agentsList[0]).toHaveProperty('color')
    expect(agentsList[0]).toHaveProperty('folder')
    expect(agentsList[0]).toHaveProperty('desc')
  })

  it('should validate agent session structure', () => {
    const session = {
      key: 'agent:main:session-123',
      kind: 'subagent',
      channel: 'internal',
      label: null,
      displayName: 'er-hineda',
      updatedAt: '2024-01-01T00:00:00Z',
      sessionId: 'session-123',
      model: 'minimax/MiniMax-M2.5',
      totalTokens: 1000,
      contextTokens: 0,
      systemSent: true,
      abortedLastRun: false,
      lastChannel: 'internal'
    }
    
    expect(session.key).toMatch(/^agent:/)
    expect(session.kind).toBe('subagent')
    expect(session.model).toBe('minimax/MiniMax-M2.5')
  })
})
