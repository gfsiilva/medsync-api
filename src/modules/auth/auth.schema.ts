import { type } from 'node:os'
import { email, z } from 'zod'

export const registerSchema = z.object({
    email: z.email('Email Inválido'),
   

    password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),

    name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),

    role: z.enum(['PATIENT', 'DOCTOR']).default('PATIENT'),
})

export const loginSchema = z.object({
    email: z.email('Email inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
