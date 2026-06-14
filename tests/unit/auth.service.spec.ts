// tests/unit/auth.service.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../src/modules/auth/auth.service.js'
import { ConflictError, UnauthorizedError } from '../../src/shared/errors/AppError.js'

describe('AuthService', () => {
  const mockRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  }

  const authService = new AuthService(mockRepository as any)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('deve criar um usuário com sucesso', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue({
        id: 'uuid-123',
        email: 'joao@email.com',
        role: 'PATIENT',
        createdAt: new Date(),
      })

      // Act
      const result = await authService.register({
        email: 'joao@email.com',
        password: 'Senha123',
        name: 'Joao Silva',
        role: 'PATIENT',
      })

      // Assert
      expect(result.email).toBe('joao@email.com')
      expect(mockRepository.create).toHaveBeenCalledOnce()
    })

    it('deve lançar ConflictError se email já existe', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue({
        id: 'uuid-123',
        email: 'joao@email.com',
      })

      // Act + Assert
      await expect(
        authService.register({
          email: 'joao@email.com',
          password: 'Senha123',
          name: 'Joao Silva',
          role: 'PATIENT',
        })
      ).rejects.toThrow(ConflictError)

      expect(mockRepository.create).not.toHaveBeenCalled()
    })

    it('deve salvar a senha como hash e nunca em texto puro', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue({
        id: 'uuid-123',
        email: 'joao@email.com',
        role: 'PATIENT',
        createdAt: new Date(),
      })

      // Act
      await authService.register({
        email: 'joao@email.com',
        password: 'Senha123',
        name: 'Joao Silva',
        role: 'PATIENT',
      })

      // Assert
      const createCall = mockRepository.create.mock.calls[0][0]
      expect(createCall.password).not.toBe('Senha123')
      expect(createCall.password).toMatch(/^\$2b\$/)
    })
  })

  describe('login', () => {
    it('deve lançar UnauthorizedError se email não existe', async () => {
      mockRepository.findByEmail.mockResolvedValue(null)

      await expect(
        authService.login({
          email: 'naoexiste@email.com',
          password: 'Senha123',
        })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('deve lançar UnauthorizedError se senha está errada', async () => {
      mockRepository.findByEmail.mockResolvedValue({
        id: 'uuid-123',
        email: 'joao@email.com',
        role: 'PATIENT',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uFDi',
      })

      await expect(
        authService.login({
          email: 'joao@email.com',
          password: 'SenhaErrada123',
        })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('deve retornar dados do usuário sem a senha', async () => {
      // Arrange
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('Senha123', 12)

      mockRepository.findByEmail.mockResolvedValue({
        id: 'uuid-123',
        email: 'joao@email.com',
        role: 'PATIENT',
        password: hashedPassword,
      })

      // Act
      const result = await authService.login({
        email: 'joao@email.com',
        password: 'Senha123',
      })

      // Assert
      expect(result.id).toBe('uuid-123')
      expect(result.email).toBe('joao@email.com')
      expect(result).not.toHaveProperty('password')
    })
  })
})