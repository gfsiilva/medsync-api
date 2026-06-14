import { prisma } from '@/config/database.js'
import type { CreateAppointmentInput } from './appointments.schema.js'

export class AppointmentsRepository {

  async findConflict(doctorId: string, date: Date) {
    return prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        status: { notIn: ['CANCELLED'] },
      }
    })
  }

  async create(patientId: string, data: CreateAppointmentInput) {
    return prisma.appointment.create({
      data: {
        patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        notes: data.notes,
      },
      include: {
        doctor: {
          select: { crm: true, specialty: true }
        }
      }
    })
  }

  async findById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: {
        select: {
          userId: true,
          crm: true,
          specialty: true,
          user: { select: { email: true } },
        }
      },
      patient: {
        select: {
          userId: true,
          cpf: true,
          user: { select: { email: true } },
        }
      },
    }
  })
}

  async updateStatus(id: string, status: string) {
    return prisma.appointment.update({
      where: { id },
      data: { status: status as any },
    })
  }

  async findByPatient(patientId: string, filters: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = filters
    const skip = (page - 1) * limit

    const where = {
      patientId,
      ...(status ? { status: status as any } : {}),
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          doctor: { select: { crm: true, specialty: true } }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.appointment.count({ where })
    ])

    return { appointments, total, page, totalPages: Math.ceil(total / limit) }
  }

  async findByDoctor(doctorId: string, filters: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = filters
    const skip = (page - 1) * limit

    const where = {
      doctorId,
      ...(status ? { status: status as any } : {}),
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { cpf: true, phone: true } }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.appointment.count({ where })
    ])

    return { appointments, total, page, totalPages: Math.ceil(total / limit) }
  }
}