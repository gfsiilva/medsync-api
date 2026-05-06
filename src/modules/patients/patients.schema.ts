import { z } from 'zod'

export const createPatientProfileSchema = z.object({
    cpf: z.string()
    .length(11, 'CPF deve ter 11 digitos sem pontos ou traços'),
    phone: z.string()
    .min(10, 'Telefone inválido')
    .max(11, 'Telefone inválido'),
    
    birthDate: z.iso.datetime('Data inválida - use formato ISO 8601: 1990-01-15T00:00:00Z'),

    address: z.string().optional(),
})

export type CreatePatientProfileInput = z.infer<typeof createPatientProfileSchema>