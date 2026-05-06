import type { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate.js";
import { authorize } from "@/shared/middlewares/authorize.js";
import { createPatientProfileSchema } from "./patients.schema.js";
import { prisma } from "@/config/database.js";
import { ConflictError } from "@/shared/errors/AppError.js";
import { request } from "node:http";
import { REPLServer } from "node:repl";

export async function patientsRoutes(app: FastifyInstance) {

    app.post(
        '/patients/profile',
        { preHandler: [authenticate, authorize('PATIENT')]},
        async (request,reply) => {
            const input = createPatientProfileSchema.parse(request.body)
            const userId = request.user.sub

            const existing = await prisma.patient.findUnique({ where: { userId } })
            if (existing) {
                throw new ConflictError ('Perfil de paciente já cadastrado')
            }

            const existingCpf = await prisma.patient.findUnique({ where: { cpf: input.cpf} })
            if (existingCpf) {
                throw new ConflictError('CPF já cadastrado')
            }

            const patient = await prisma.patient.create({
                data: {
                    userId,
                    cpf: input.cpf,
                    phone: input.phone,
                    birthDate: new Date(input.birthDate),
                    address: input.address,
                }
            })

            return reply.status(201).send({
                status: 'success',
                data: { patient },
            })
        }
    )
}