// src/modules/doctors/doctors.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { DoctorsService } from './doctors.service.js'
import { DoctorsRepository } from './doctors.repository.js'
import {
  createDoctorProfileSchema,
  updateDoctorProfileSchema,
  listDoctorsSchema,
} from './doctors.schema.js'

// Instanciamos aqui — em projetos maiores usaríamos um container de DI (inversify, tsyringe)
const doctorsRepository = new DoctorsRepository()
const doctorsService = new DoctorsService(doctorsRepository)

export class DoctorsController {
  async createProfile(request: FastifyRequest, reply: FastifyReply) {
    // parse() valida e lança ZodError se inválido
    // O error handler global no app.ts captura e formata o erro
    const input = createDoctorProfileSchema.parse(request.body)

    const doctor = await doctorsService.createProfile(
      request.user.sub,   // ID do usuário vindo do JWT
      request.user.role,  // Role vindo do JWT
      input
    )

    // 201 Created = recurso criado com sucesso
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

  // FastifyRequest genérico — tipamos os Params para ter autocomplete
  async getProfile(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const doctor = await doctorsService.getProfile(id)

    return reply.status(200).send({
      status: 'success',
      data: { doctor },
    })
  }

  async listDoctors(request: FastifyRequest, reply: FastifyReply) {
    // query = parâmetros da URL: /doctors?specialty=Cardio&page=1
    const input = listDoctorsSchema.parse(request.query)
    const result = await doctorsService.listDoctors(input)

    return reply.status(200).send({
      status: 'success',
      data: result,
    })
  }
}