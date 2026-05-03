// src/app.ts
import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import { env } from '@/config/env.js'
import { AppError } from '@/shared/errors/AppError.js'
import { ZodError } from 'zod'
import { authRoutes } from '@/modules/auth/auth.routes.js'
import { usersRoutes } from '@/modules/users/users.routes.js'


export function buildApp() {
  const app = fastify({
    logger: {
      transport: env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  app.register(helmet)
  app.register(cors, {
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // Registra o plugin JWT com a chave secreta
  app.register(jwt, {
    secret: env.JWT_SECRET,
  })

  // Error handler global
  app.setErrorHandler((error, request, reply) => {
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

  // Rotas
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

app.register(authRoutes, { prefix: '/api/v1' })
app.register(usersRoutes, { prefix: '/api/v1' })

  return app
}