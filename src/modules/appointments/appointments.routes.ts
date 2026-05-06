// src/modules/appointments/appointments.routes.ts
import type { FastifyInstance } from 'fastify'
import { AppointmentsController } from './appointments.controller.js'
import { authenticate } from '@/shared/middlewares/authenticate.js'

const appointmentsController = new AppointmentsController()

export async function appointmentsRoutes(app: FastifyInstance) {
  // Todas as rotas de agendamento exigem autenticação
  // Não faz sentido agendar sem saber quem é o paciente

  // Criar consulta — só PATIENT (validado no service)
  app.post(
    '/appointments',
    { preHandler: [authenticate] },
    appointmentsController.create.bind(appointmentsController)
  )

  // Atualizar status — médico confirma, paciente ou médico cancela
  app.patch<{ Params: { id: string } }>(
  '/appointments/:id/status',
  { preHandler: [authenticate] },
  appointmentsController.updateStatus.bind(appointmentsController)
)

  // Listar minhas consultas — comportamento diferente por role
  app.get(
    '/appointments/mine',
    { preHandler: [authenticate] },
    appointmentsController.listMine.bind(appointmentsController)
  )
}