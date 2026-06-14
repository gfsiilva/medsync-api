import { prisma } from '@/config/database.js'
import type { CreateDoctorProfileInput, UpdateDoctorProfileInput, ListDoctorsInput } from './doctors.schema.js'

export class DoctorsRepository {
  async findByUserId(userId: string) {
    return prisma.doctor.findUnique({
      where: { userId },
    })
  }

  async findById(id: string) {
    return prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        },
        availabilities: true,
      }
    })
  }

  async findByCrm(crm: string) {
    return prisma.doctor.findUnique({ where: { crm } })
  }

  async create(userId: string, data: CreateDoctorProfileInput) {
    return prisma.doctor.create({
      data: {
        userId,
        crm: data.crm,
        specialty: data.specialty,
        bio: data.bio,
        consultationFee: data.consultationFee,
      }
    })
  }

  async update(id: string, data: UpdateDoctorProfileInput) {
    return prisma.doctor.update({
      where: { id },
      data,
    })
  }

  async findMany(input: ListDoctorsInput) {
    const { specialty, page, limit } = input

    const skip = (page - 1) * limit

    const where = specialty
    ? {
        specialty: {
            contains: specialty,
            mode: 'insensitive' as const
        }
    }
 :{} 

 const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        select: {
            id: true,
            crm: true,
            specialty: true,
            bio: true,
            consultationFee: true,
            user: {
                select: { name: true, email: true }
            }
        },
        orderBy: { specialty: 'asc' }
    }),
    prisma.doctor.count({ where })
 ])

 return {
    doctors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
 }

}
}