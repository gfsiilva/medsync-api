import { DoctorsRepository } from "./doctors.repository.js"
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/errors/AppError.js"
import type { CreateDoctorProfileInput, UpdateDoctorProfileInput, ListDoctorsInput } from "./doctors.schema.js"

export class DoctorsService {
  constructor(private readonly doctorsRepository: DoctorsRepository) {}

  async createProfile(userId: string, userRole: string, input: CreateDoctorProfileInput) {
    if (userRole !== 'DOCTOR') {
      throw new ForbiddenError('Apenas médicos podem criar perfil médico')
    }

    const existingProfile = await this.doctorsRepository.findByUserId(userId)
    if (existingProfile) {
      throw new ConflictError('Perfil médico já cadastrado')
    }

    const existingCrm = await this.doctorsRepository.findByCrm(input.crm)
    if (existingCrm) {
      throw new ConflictError('CRM já cadastrado')
    }

    return this.doctorsRepository.create(userId, input)
  }

  async updateProfile(userId: string, input: UpdateDoctorProfileInput) {
    const doctor = await this.doctorsRepository.findByUserId(userId)
    if (!doctor) {
      throw new NotFoundError('Perfil médico')
    }
    return this.doctorsRepository.update(doctor.id, input)
  }

  async getProfile(id: string) {
    const doctor = await this.doctorsRepository.findById(id)
    if (!doctor) {
      throw new NotFoundError('Médico')
    }
    return doctor
  }

  async listDoctors(input: ListDoctorsInput) {
    return this.doctorsRepository.findMany(input)
  }
}