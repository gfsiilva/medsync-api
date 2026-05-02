import { prisma } from '@/config/database.js'
import type {RegisterInput} from './auth.schema.js'

export class AuthRepository {

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        })
    }

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
        })
    }

 async create(data: { email: string; password: string; role: RegisterInput['role'] }) {
    return prisma.user.create({
      data,
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    })
}
}