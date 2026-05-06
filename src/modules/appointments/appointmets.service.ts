// src/modules/appointments/appointments.service.ts
import { AppointmentsRepository } from './appointments.repository.js'
import { DoctorsRepository } from '@/modules/doctors/doctors.repository.js'
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/errors/AppError.js'
import type { CreateAppointmentInput, UpdateAppointmentInput, ListAppointmentInput } from './appointments.schema.js'
import { prisma } from '@/config/database.js'

export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly doctorsRepository: DoctorsRepository,
  ) {}

  async create(userId: string, userRole: string, input: CreateAppointmentInput) {
    // Regra 1: só PATIENT pode agendar
    if (userRole !== 'PATIENT') {
      throw new ForbiddenError('Apenas pacientes podem agendar consultas')
    }

    // Regra 2: paciente precisa ter perfil completo cadastrado
    // Um usuário com role PATIENT pode não ter preenchido CPF, telefone, etc.
    const patient = await prisma.patient.findUnique({ where: { userId } })
    if (!patient) {
      throw new ForbiddenError('Complete seu perfil de paciente antes de agendar')
    }

    // Regra 3: médico deve existir
    const doctor = await this.doctorsRepository.findById(input.doctorId)
    if (!doctor) {
      throw new NotFoundError('Medico')
    }

    // Regra 4: não pode agendar no passado
    const appointmentDate = new Date(input.date)
    if (appointmentDate < new Date()) {
      throw new ConflictError('Nao e possivel agendar consultas no passado')
    }

    // Regra 5: médico não pode ter duas consultas no mesmo horário
    const conflict = await this.appointmentsRepository.findConflict(
      input.doctorId,
      appointmentDate
    )
    if (conflict) {
      throw new ConflictError('Medico ja possui consulta neste horario')
    }

    return this.appointmentsRepository.create(patient.id, input)
  }

  async updateStatus(userId: string, userRole: string, appointmentId: string, input: UpdateAppointmentInput) {
    const appointment = await this.appointmentsRepository.findById(appointmentId)

    if (!appointment) {
      throw new NotFoundError('Consulta')
    }

    // Verifica se é o médico DESTA consulta ou o paciente DESTA consulta
    // Não pode ser qualquer médico ou qualquer paciente — tem que ser o dono
    const isDoctor = userRole === 'DOCTOR' && appointment.doctor.userId === userId
    const isPatient = userRole === 'PATIENT' && appointment.patient.userId === userId

    if (!isDoctor && !isPatient) {
      throw new ForbiddenError('Sem permissao para alterar esta consulta')
    }

    // Regra: paciente só pode CANCELAR, não confirmar
    // Quem confirma é o médico — faz sentido para o negócio
    if (isPatient && input.status === 'CONFIRMED') {
      throw new ForbiddenError('Apenas o medico pode confirmar consultas')
    }

    return this.appointmentsRepository.updateStatus(appointmentId, input.status)
  }

  async listMyAppointments(userId: string, userRole: string, filters: ListAppointmentInput) {
    // Comportamento diferente dependendo do role
    // Paciente vê SUAS consultas, médico vê consultas COM ELE
    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } })
      if (!patient) throw new NotFoundError('Perfil de paciente')
      return this.appointmentsRepository.findByPatient(patient.id, filters)
    }

    if (userRole === 'DOCTOR') {
      const doctor = await this.doctorsRepository.findByUserId(userId)
      if (!doctor) throw new NotFoundError('Perfil medico')
      return this.appointmentsRepository.findByDoctor(doctor.id, filters)
    }

    throw new ForbiddenError('Sem permissao')
  }
}