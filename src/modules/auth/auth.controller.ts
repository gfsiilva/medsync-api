import type { FastifyRequest, FastifyReply } from "fastify";
import fastifyJwt from '@fastify/jwt'
import { env } from '@/config/env.js'
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { registerSchema, loginSchema } from './auth.schema.js'

const authRepository = new AuthRepository()
const authService = new AuthService (authRepository)

export class AuthController {
    async register (request: FastifyRequest, reply: FastifyReply) {
        const input = registerSchema.parse(request.body)

        const user = await authService.register(input)

        return reply.status(201).send({
            status: 'success',
            data: { user },
        })
    }

     async login(request: FastifyRequest, reply: FastifyReply) {
        const input = loginSchema.parse(request.body)

        const user = await authService.login(input)

        const token = await reply.jwtSign(
            { sub: user.id, role: user.role},
            { expiresIn: '7d'}
        )
    return reply.status(200).send({
        status: 'success',
        data: { user, token },
    })
}
}