import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppointmentsService } from './appointmets.service.js'
import { AppointmentsRepository } from './appointments.repository.js'
import { DoctorsRepository } from '../doctors/doctors.repository.js'
import {
    createAppointmentSchema,
    updateAppointmentSchema,
    listAppointmentSchema
} from './appointments.schema.js'

const appointmentsRepository = new AppointmentsRepository()
const doctorsRepository = new DoctorsRepository ()
const appointmentsService = new AppointmentsService(appointmentsRepository, doctorsRepository)

export class AppointmentsController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const input = createAppointmentSchema.parse(request.body)

        const appointment = await appointmentsService.create(
            request.user.sub,
            request.user.role,
            input
        )

        return reply.status(201).send({ status: 'success', data: { appointment } })
    }

    async updateStatus(
        request: FastifyRequest<{ Params: { id: string }}>,
        reply: FastifyReply
    ){
        const input = updateAppointmentSchema.parse(request.body)

        const appointment = await appointmentsService.updateStatus(
            request.user.sub,
            request.user.role,
            request.params.id,
            input
        )

        return reply.status(200).send({ status: 'success', data: { appointment } })
    }

    async listMine(request: FastifyRequest, reply: FastifyReply) {
        const filters = listAppointmentSchema.parse(request.query)

        const result = await appointmentsService.listMyAppointments(
            request.user.sub,
            request.user.role,
            filters
        )

        return reply.status(200).send({ status: 'success', data: result })
    }
}