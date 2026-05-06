import { z } from 'zod'

export const createAppointmentSchema = z.object({
    doctorId: z.uuid('ID do médico inválido'),

    date: z.iso.datetime('Data inválida - use formado ISO 8601: 2025-01-15T10:00:00Z'),

    notes: z.string().max(500).optional(),
})

export const updateAppointmentSchema = z.object({
    status: z.enum(['CONFIRMED', 'CANCELED']),
})

export const listAppointmentSchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    status: z.enum(['SHEDULED', 'CONFIRMED', 'CANCELED', 'COMPLETED']).optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type ListAppointmentInput = z.infer<typeof listAppointmentSchema>