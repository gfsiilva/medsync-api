// src/modules/doctors/doctors.routes.ts
import type { FastifyInstance } from 'fastify'
import { DoctorsController } from './doctors.controller.js'
import { authenticate } from '@/shared/middlewares/authenticate.js'
import { authorize } from '@/shared/middlewares/authorize.js'

const doctorsController = new DoctorsController()

// Schema de segurança reutilizável — aplica o bearerAuth em rotas protegidas
const securedRoute = {
  security: [{ bearerAuth: [] }],
}

export async function doctorsRoutes(app: FastifyInstance) {
  app.get('/doctors', {
    schema: {
      tags: ['Doctors'],
      summary: 'Listar médicos disponíveis',
      querystring: {
        type: 'object',
        properties: {
          specialty: { type: 'string', example: 'Cardiologia' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
        },
      },
    },
  }, doctorsController.listDoctors.bind(doctorsController))

  app.get('/doctors/:id', {
    schema: {
      tags: ['Doctors'],
      summary: 'Ver perfil de um médico',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID do médico' },
        },
      },
    },
  }, doctorsController.getProfile.bind(doctorsController))

  app.post('/doctors/profile', {
    schema: {
      ...securedRoute,
      tags: ['Doctors'],
      summary: 'Criar perfil médico',
      description: 'Apenas usuários com role DOCTOR podem criar perfil',
      body: {
        type: 'object',
        required: ['crm', 'specialty', 'consultationFee'],
        properties: {
          crm: { type: 'string', example: '123456' },
          specialty: { type: 'string', example: 'Cardiologia' },
          bio: { type: 'string', example: 'Especialista com 10 anos de experiencia' },
          consultationFee: { type: 'number', example: 250 },
        },
      },
    },
    preHandler: [authenticate, authorize('DOCTOR')],
  }, doctorsController.createProfile.bind(doctorsController))

  app.patch('/doctors/profile', {
    schema: {
      ...securedRoute,
      tags: ['Doctors'],
      summary: 'Atualizar perfil médico',
      body: {
        type: 'object',
        properties: {
          specialty: { type: 'string' },
          bio: { type: 'string' },
          consultationFee: { type: 'number' },
        },
      },
    },
    preHandler: [authenticate, authorize('DOCTOR')],
  }, doctorsController.updateProfile.bind(doctorsController))
}