import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/config/database.js";
import { NotFoundError } from "@/shared/errors/AppError.js";

export class UsersController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        doctor: {
          select: {
            crm: true,
            specialty: true,
            bio: true,
            consultationFee: true,
          }
        },
        patient: {
          select: {
            cpf: true,
            phone: true,
            birthDate: true,
          }
        }
      }
    })

    // ✅ throw o ERRO quando não encontrar
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    // ✅ send o SUCESSO quando encontrar
    return reply.status(200).send({
      status: 'success',
      data: { user },
    })
  }
}