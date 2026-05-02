import bcrypt from 'bcryptjs'
import { env } from '@/config/env.js'
import { AuthRepository } from './auth.repository.js'
import { ConflictError, UnauthorizedError } from '@/shared/errors/AppError.js'
import type { RegisterInput, LoginInput } from './auth.schema.js'

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput) {
    const existingUser = await this.authRepository.findByEmail(input.email)
    if (existingUser) {
      throw new ConflictError('Email já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(input.password, 12)

    const user = await this.authRepository.create({
      email: input.email,
      password: hashedPassword,
      role: input.role,
    })

    return user
  }

  async login(input: LoginInput) {
    const user = await this.authRepository.findByEmail(input.email)

    const passwordToCompare = user?.password ?? ''
    const passwordMatch = await bcrypt.compare(input.password, passwordToCompare)

    if (!user || !passwordMatch) {
      throw new UnauthorizedError('Email ou senha inválidos')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  }
}