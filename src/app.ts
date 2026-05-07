// src/app.ts
import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import rateLimit from '@fastify/rate-limit'
import { env } from '@/config/env.js'
import { AppError } from '@/shared/errors/AppError.js'
import { ZodError } from 'zod'
import { authRoutes } from '@/modules/auth/auth.routes.js'
import { usersRoutes } from '@/modules/users/users.routes.js'
import { doctorsRoutes } from '@/modules/doctors/doctors.routes.js'
import { patientsRoutes } from '@/modules/patients/patients.routes.js'
import { appointmentsRoutes } from '@/modules/appointments/appointments.routes.js'

export function buildApp() {
  const app = fastify({
    logger: {
      transport: env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
    ajv: {
      customOptions: {
        strict: false,
      },
    },
  })

  // Rate limiting global — registrado antes de tudo
  app.register(rateLimit, {
    timeWindow: '1 minute',
    max: 100,
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
  })

  app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'MedSync API',
        description: `
# MedSync API

Sistema de gerenciamento de clínica médica.

## Autenticação
A API usa **JWT Bearer Token**. Para acessar rotas protegidas:
1. Faça login em \`POST /api/v1/auth/login\`
2. Copie o token retornado
3. Clique em **Authorize** e cole o token

## Roles
- **PATIENT** — pode agendar e ver suas consultas
- **DOCTOR** — pode ver e confirmar suas consultas
- **ADMIN** — acesso total ao sistema
        `,
        version: '1.0.0',
        contact: {
          name: 'MedSync Team',
          email: 'contato@medsync.com',
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Cole o token JWT obtido no login',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Autenticação e registro' },
        { name: 'Users', description: 'Gerenciamento de usuários' },
        { name: 'Doctors', description: 'Perfis e listagem de médicos' },
        { name: 'Patients', description: 'Perfis de pacientes' },
        { name: 'Appointments', description: 'Agendamento de consultas' },
      ],
    },
  })

  app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
    staticCSP: true,
  })

  app.register(helmet, {
    contentSecurityPolicy: false,
  })

  app.register(cors, {
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  app.register(jwt, {
    secret: env.JWT_SECRET,
  })

  // Error handler global
  app.setErrorHandler((error: any, request, reply) => {
    // Rate limit atingido
    if (error.statusCode === 429) {
      return reply.status(429).send({
        status: 'error',
        code: 'TOO_MANY_REQUESTS',
        message: error.message,
      })
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        errors: error.flatten().fieldErrors,
      })
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        status: 'error',
        code: error.code,
        message: error.message,
      })
    }

    app.log.error(error)
    return reply.status(500).send({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor',
    })
  })

  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Verifica se a API está online',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  }, async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  app.register(authRoutes, { prefix: '/api/v1' })
  app.register(usersRoutes, { prefix: '/api/v1' })
  app.register(doctorsRoutes, { prefix: '/api/v1' })
  app.register(patientsRoutes, { prefix: '/api/v1' })
  app.register(appointmentsRoutes, { prefix: '/api/v1' })

  return app
}