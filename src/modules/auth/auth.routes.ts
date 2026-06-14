// src/modules/auth/auth.routes.ts
import type { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller.js'
import { env } from '@/config/env.js'

const authController = new AuthController()

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', {
    config: {
      rateLimit: {
        max: env.NODE_ENV === 'test' ? 1000 : 3,
        timeWindow: '1 hour',
      },
    },
    schema: {
      tags: ['Auth'],
      summary: 'Cadastrar novo usuário',
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          password: { type: 'string', minLength: 8, example: 'Senha123' },
          name: { type: 'string', example: 'João Silva' },
          role: { type: 'string', enum: ['PATIENT', 'DOCTOR'], default: 'PATIENT' },
        },
      },
      response: {
        201: {
          description: 'Usuário criado com sucesso',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    createdAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        409: { description: 'Email já cadastrado' },
        429: { description: 'Muitos cadastros. Tente novamente em 1 hora' },
      },
    },
  }, authController.register.bind(authController))

  app.post('/auth/login', {
    config: {
      rateLimit: {
        max: env.NODE_ENV === 'test' ? 1000 : 5,
        timeWindow: '1 minute',
      },
    },
    schema: {
      tags: ['Auth'],
      summary: 'Fazer login',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          password: { type: 'string', example: 'Senha123' },
        },
      },
      response: {
        200: {
          description: 'Login realizado com sucesso',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
                token: { type: 'string', description: 'JWT Token' },
              },
            },
          },
        },
        401: { description: 'Email ou senha inválidos' },
        429: { description: 'Muitas tentativas. Tente novamente em 1 minuto' },
      },
    },
  }, authController.login.bind(authController))
}