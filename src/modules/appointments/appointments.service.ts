import { AppointmentsRepository } from './appointments.repository.js'
import { DoctorsRepository } from '@/modules/doctors/doctors.repository.js'
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/errors/AppError.js'
import type { CreateAppointmentInput, UpdateAppointmentInput, ListAppointmentInput } from './appointments.schema.js'
import { prisma } from '@/config/database.js'
import { emailQueue } from '@/infra/queue/email.queue.js'

export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly doctorsRepository: DoctorsRepository,
  ) {}

  async create(userId: string, userRole: string, input: CreateAppointmentInput) {
    if (userRole !== 'PATIENT') {
      throw new ForbiddenError('Apenas pacientes podem agendar consultas')
    }

    const patient = await prisma.patient.findUnique({ where: { userId } })
    if (!patient) {
      throw new ForbiddenError('Complete seu perfil de paciente antes de agendar')
    }

    const doctor = await this.doctorsRepository.findById(input.doctorId)
    if (!doctor) {
      throw new NotFoundError('Medico')
    }

    const appointmentDate = new Date(input.date)
    if (appointmentDate < new Date()) {
      throw new ConflictError('Não é possível agendar consultas no passado')
    }

    const conflict = await this.appointmentsRepository.findConflict(
      input.doctorId,
      appointmentDate
    )
    if (conflict) {
      throw new ConflictError('Médico já possui consulta neste horário')
    }

    return this.appointmentsRepository.create(patient.id, input)
  }

  async updateStatus(userId: string, userRole: string, appointmentId: string, input: UpdateAppointmentInput) {
    const appointment = await this.appointmentsRepository.findById(appointmentId)

    if (!appointment) {
      throw new NotFoundError('Consulta')
    }

    const isDoctor = userRole === 'DOCTOR' && appointment.doctor.userId === userId
    const isPatient = userRole === 'PATIENT' && appointment.patient.userId === userId

    if (!isDoctor && !isPatient) {
      throw new ForbiddenError('Sem permissão para alterar consulta')
    }

    if (isPatient && input.status === 'CONFIRMED') {
      throw new ForbiddenError('Apenas o médico pode confirmar consultas')
    }

    const updated = await this.appointmentsRepository.updateStatus(appointmentId, input.status)

    // Dispara o job de email quando consulta for confirmada
    if (input.status === 'CONFIRMED') {
      await emailQueue.add('send-confirmation', {
        to: appointment.patient.user.email,
        patientName: appointment.patient.user.email, // substitua por nome quando tiver no schema
        doctorName: appointment.doctor.user.email,   // substitua por nome quando tiver no schema
        date: appointment.date,
      })

      console.log(`📬 Job de email enfileirado para consulta ${appointmentId}`)
    }

    return updated
  }

  async listMyAppointments(userId: string, userRole: string, filters: ListAppointmentInput) {
    const { page, limit } = filters

    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } })
      if (!patient) {
        return { appointments: [], total: 0, page, totalPages: 0 }
      }
      return this.appointmentsRepository.findByPatient(patient.id, filters)
    }

    if (userRole === 'DOCTOR') {
      const doctor = await this.doctorsRepository.findByUserId(userId)
      if (!doctor) {
        return { appointments: [], total: 0, page, totalPages: 0 }
      }
      return this.appointmentsRepository.findByDoctor(doctor.id, filters)
    }

    throw new ForbiddenError('Sem permissão')
  }
}