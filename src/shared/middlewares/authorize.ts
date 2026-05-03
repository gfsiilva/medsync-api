import type { FastifyRequest, FastifyReply } from "fastify";
import { ForbiddenError } from "../errors/AppError.js";

export function authorize(...roles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const userRole = request.user.role

        if(!roles.includes(userRole)) {
            throw new ForbiddenError(
            `Àcesso negado. Requer perfil: ${roles.join('ou')}`
            )
        }
    }
}