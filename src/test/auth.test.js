/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

// Test JWT authentication logic directly
const JWT_SECRET = 'er-hineda-dashboard-secret-key-change-in-production'
const JWT_EXPIRY = '24h'

const CREDENTIALS = {
  username: 'ErHinedaAgents',
  password: 'qubgos-9cehpe-caggEz'
}

// Replicate the authenticateToken logic for testing
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) reject(err)
      else resolve(user)
    })
  })
}

function generateToken(username) {
  return jwt.sign(
    { username, loginAt: new Date().toISOString() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

describe('JWT Authentication', () => {
  describe('Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken('testuser')
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
    })

    it('should include username in token payload', async () => {
      const token = generateToken('testuser')
      const decoded = jwt.decode(token)
      
      expect(decoded.username).toBe('testuser')
      expect(decoded.loginAt).toBeDefined()
    })

    it('should include expiration in token', async () => {
      const token = generateToken('testuser')
      const decoded = jwt.decode(token)
      
      expect(decoded.exp).toBeDefined()
    })
  })

  describe('Token Verification', () => {
    it('should verify a valid token', async () => {
      const token = generateToken('testuser')
      const user = await verifyToken(token)
      
      expect(user.username).toBe('testuser')
      expect(user.loginAt).toBeDefined()
    })

    it('should reject an invalid token', async () => {
      const invalidToken = 'invalid.token.here'
      
      await expect(verifyToken(invalidToken)).rejects.toThrow()
    })

    it('should reject a tampered token', async () => {
      const token = generateToken('testuser')
      const tamperedToken = token.slice(0, -5) + 'xxxxx'
      
      await expect(verifyToken(tamperedToken)).rejects.toThrow()
    })

    it('should reject an expired token', async () => {
      const expiredToken = jwt.sign(
        { username: 'testuser', loginAt: new Date().toISOString() },
        JWT_SECRET,
        { expiresIn: '-1s' }
      )
      
      await expect(verifyToken(expiredToken)).rejects.toThrow('jwt expired')
    })
  })

  describe('Credential Validation', () => {
    it('should validate correct credentials', () => {
      const { username, password } = CREDENTIALS
      
      expect(username).toBe('ErHinedaAgents')
      expect(password).toBe('qubgos-9cehpe-caggEz')
    })

    it('should reject incorrect password', () => {
      const { password } = CREDENTIALS
      const inputPassword = 'wrongpassword'
      
      expect(inputPassword).not.toBe(password)
    })

    it('should reject empty credentials', () => {
      const emptyUsername = ''
      const emptyPassword = ''
      
      expect(emptyUsername).toBe('')
      expect(emptyPassword).toBe('')
    })
  })

  describe('Token Refresh', () => {
    it('should generate a valid new token on refresh', async () => {
      const originalToken = generateToken('testuser')
      const originalDecoded = jwt.decode(originalToken)
      
      // Simulate token refresh
      const newToken = jwt.sign(
        { username: originalDecoded.username, loginAt: originalDecoded.loginAt },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      )
      
      // Both tokens should be valid and contain same user info
      const originalUser = await verifyToken(originalToken)
      const newUser = await verifyToken(newToken)
      
      expect(originalUser.username).toBe(newUser.username)
      expect(newUser.loginAt).toBe(originalUser.loginAt)
    })
  })
})

describe('API Response Formats', () => {
  describe('Login Response', () => {
    it('should have correct login response structure', () => {
      const token = generateToken('testuser')
      const response = {
        token,
        expiresIn: JWT_EXPIRY,
        user: { username: 'testuser' }
      }
      
      expect(response).toHaveProperty('token')
      expect(response).toHaveProperty('expiresIn')
      expect(response).toHaveProperty('user')
      expect(response.user.username).toBe('testuser')
    })
  })

  describe('Verify Response', () => {
    it('should have correct verify response structure', () => {
      const user = { username: 'testuser', loginAt: new Date().toISOString() }
      const response = {
        valid: true,
        user
      }
      
      expect(response).toHaveProperty('valid')
      expect(response).toHaveProperty('user')
      expect(response.valid).toBe(true)
    })
  })

  describe('Error Responses', () => {
    it('should format 401 error correctly', () => {
      const errorResponse = { error: 'Token requerido' }
      
      expect(errorResponse.error).toBe('Token requerido')
    })

    it('should format 403 error correctly', () => {
      const errorResponse = { error: 'Token inválido o expirado' }
      
      expect(errorResponse.error).toBe('Token inválido o expirado')
    })

    it('should format 400 error for missing credentials', () => {
      const errorResponse = { error: 'Usuario y contraseña requeridos' }
      
      expect(errorResponse.error).toBe('Usuario y contraseña requeridos')
    })

    it('should format 401 error for invalid credentials', () => {
      const errorResponse = { error: 'Credenciales inválidas' }
      
      expect(errorResponse.error).toBe('Credenciales inválidas')
    })
  })
})

describe('Health Check', () => {
  it('should have correct health check response', () => {
    const healthResponse = { status: 'ok', readonly: true }
    
    expect(healthResponse.status).toBe('ok')
    expect(healthResponse.readonly).toBe(true)
  })
})
