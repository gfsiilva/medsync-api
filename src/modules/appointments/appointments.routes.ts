// src/modules/appointments/appointments.routes.ts
import type { FastifyInstance } from 'fastify'
import { AppointmentsController } from './appointments.controller.js'
import { authenticate } from '@/shared/middlewares/authenticate.js'

const appointmentsController = new AppointmentsController()
const securedRoute = { security: [{ bearerAuth: [] }] }

export async function appointmentsRoutes(app: FastifyInstance) {

  // GET estático primeiro — evita conflito com /:id
  app.get('/appointments/mine', {
    schema: {
      ...securedRoute,
      tags: ['Appointments'],
      summary: 'Listar minhas consultas',
      description: 'Pacientes veem suas consultas. Medicos veem consultas com eles.',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
          status: {
            type: 'string',
            enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
          },
        },
      },
    },
    preHandler: [authenticate],
  }, appointmentsController.listMine.bind(appointmentsController))

  app.post('/appointments', {
    schema: {
      ...securedRoute,
      tags: ['Appointments'],
      summary: 'Agendar consulta',
      description: 'Apenas pacientes com perfil completo podem agendar',
      body: {
        type: 'object',
        required: ['doctorId', 'date'],
        properties: {
          doctorId: { type: 'string', format: 'uuid' },
          date: { type: 'string', format: 'date-time', example: '2025-06-15T10:00:00Z' },
          notes: { type: 'string', example: 'Consulta de rotina' },
        },
      },
      response: {
        201: { description: 'Consulta agendada com sucesso' },
        409: { description: 'Médico ja possui consulta neste horario' },
      },
    },
    preHandler: [authenticate],
  }, appointmentsController.create.bind(appointmentsController))

  app.patch('/appointments/:id/status', {
    schema: {
      ...securedRoute,
      tags: ['Appointments'],
      summary: 'Atualizar status da consulta',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID da consulta' },
        },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'] },
        },
      },
    },
    preHandler: [authenticate],
  }, appointmentsController.updateStatus.bind(appointmentsController))

}