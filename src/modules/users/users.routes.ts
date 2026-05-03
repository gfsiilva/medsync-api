import type { FastifyInstance } from "fastify"
import { UsersController } from "./users.controller.js"
import { authenticate } from "@/shared/middlewares/authenticate.js"
import { authorize } from "@/shared/middlewares/authorize.js"
import { prisma } from '@/config/database.js'

const usersController = new UsersController()

export async function usersRoutes(app: FastifyInstance) {

    app.get(
        '/users/me',
        { preHandler: [authenticate] },
        usersController.getProfile.bind(usersController)
    )

    app.get(
        '/users',
        { preHandler: [authenticate, authorize('ADMIN')] },
        async (request, reply) => {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc'}
            })

            return reply.send({
                status: 'success',
                data: { users, total: users.length}
            })
        }
    )
}