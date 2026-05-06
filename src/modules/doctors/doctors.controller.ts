import type { FastifyRequest, FastifyReply } from 'fastify'
import { DoctorsService } from './doctors.service.js'
import { DoctorsRepository } from './doctors.repository.js'
import {
  createDoctorProfileSchema,
  updateDoctorProfileSchema,
  listDoctorsSchema,
} from './doctors.schema.js'

const doctorsRepository = new DoctorsRepository()
const doctorsService = new DoctorsService(doctorsRepository)

export class DoctorsController {
  async createProfile(request: FastifyRequest, reply: FastifyReply) {
    const input = createDoctorProfileSchema.parse(request.body)

    const doctor = await doctorsService.createProfile(
      request.user.sub,
      request.user.role,
      input
    )

    return reply.status(201).send({
      status: 'success',
      data: { doctor },
    })
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const input = updateDoctorProfileSchema.parse(request.body)
    const doctor = await doctorsService.updateProfile(request.user.sub, input)

    return reply.status(200).send({
      status: 'success',
      data: { doctor },
    })
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const doctor = await doctorsService.getProfile(id)

    return reply.status(200).send({
      status: 'success',
      data: { doctor },
    })
  }

  async listDoctors(request: FastifyRequest, reply: FastifyReply) {
    const input = listDoctorsSchema.parse(request.query)
    const result = await doctorsService.listDoctors(input)

    return reply.status(200).send({
      status: 'success',
      data: result,
    })
  }
}