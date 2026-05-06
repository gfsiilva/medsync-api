// src/app.ts
import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from '@/config/env.js'
import { AppError } from '@/shared/errors/AppError.js'
import { ZodError } from 'zod'
import { authRoutes } from '@/modules/auth/auth.routes.js'
import { usersRoutes } from '@/modules/users/users.routes.js'
import { doctorsRoutes } from '@/modules/doctors/doctors.routes.js'
import { appointmentsRoutes } from '@/modules/appointments/appointments.routes.js'
import { patientsRoutes } from '@/modules/patients/patients.routes.js'





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

  // === SWAGGER — deve ser registrado ANTES das rotas ===
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
      // Define o esquema de autenticação JWT
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

  // Interface visual do Swagger
  app.register(swaggerUi, {
    routePrefix: '/docs',  // Acesse em http://localhost:3333/docs
    uiConfig: {
      docExpansion: 'list',      // Mostra as rotas colapsadas por padrão
      deepLinking: true,         // Permite linkar para rotas específicas
      persistAuthorization: true, // Mantém o token ao navegar
    },
    staticCSP: true,
  })

  app.register(helmet, {
    contentSecurityPolicy: false, // Desativa CSP para o Swagger UI funcionar
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
app.register(doctorsRoutes, { prefix: '/api/v1' })
app.register(appointmentsRoutes, { prefix: '/api/v1' })
app.register(patientsRoutes, { prefix: '/api/v1' })




  return app
}