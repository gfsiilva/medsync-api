// tests/integration/auth.routes.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../src/app.js'

describe('Auth Routes', () => {
  const app = buildApp()

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/v1/auth/register', () => {
    it('deve retornar 201 ao criar usuário válido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: `test-${Date.now()}@email.com`,
          password: 'Senha123',
          name: 'Test User',
          role: 'PATIENT',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = response.json()
      expect(body.status).toBe('success')
      expect(body.data.user).not.toHaveProperty('password')
    })

    it('deve retornar 400 com email inválido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'email-invalido',
          password: 'Senha123',
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body.code).toBe('VALIDATION_ERROR')
    })

    it('deve retornar 400 com senha fraca', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@email.com',
          password: '123',
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('deve retornar 409 com email duplicado', async () => {
      const email = `duplicate-${Date.now()}@email.com`

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: { email, password: 'Senha123', name: 'Test User' },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: { email, password: 'Senha123', name: 'Test User' },
      })

      expect(response.statusCode).toBe(409)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('deve retornar 200 e token com credenciais válidas', async () => {
      const email = `login-${Date.now()}@email.com`

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: { email, password: 'Senha123', name: 'Test User' },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email, password: 'Senha123' },
      })
      

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.data.token).toBeDefined()
      expect(body.data.token.split('.')).toHaveLength(3)
    })

    it('deve retornar 401 com senha errada', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'admin@medsync.com',
          password: 'SenhaErrada999',
        },
      })

      expect(response.statusCode).toBe(401)
    })
  })
})