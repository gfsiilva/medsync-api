import { z } from 'zod'

export const createDoctorProfileSchema = z.object({
    crm: z.string()
    .min(4, 'CRM inválido')
    .max(20, 'CRM inválido'),
    // CRM tem formato variável por estado. 

    specialty: z.string()
    .min(3, 'Especialidade inválida'),

    bio: z.string()
    .max(500, 'Bio muito longa')
    .optional(),
    //optional() = o campo pode não vir na request

    consultationFee: z.coerce.number()
    .positive('Valor da consulta deve ser positivo'),
})

export const updateDoctorProfileSchema = createDoctorProfileSchema.partial()

export const listDoctorsSchema = z.object({
    specialty: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
})

export type CreateDoctorProfileInput = z.infer<typeof createDoctorProfileSchema>
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>
export type ListDoctorsInput = z.infer<typeof listDoctorsSchema>