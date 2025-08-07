import { Test, TestingModule } from '@nestjs/testing'
import { ConsoleLogger } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthRepository } from './auth.repository'
import { AuthLoginDto, AuthRegisterDto } from './auth.dto'
import * as bcrypt from 'bcryptjs'
import * as jsonwebtoken from 'jsonwebtoken'

// Mock external dependencies
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockedJwt = jsonwebtoken as jest.Mocked<typeof jsonwebtoken>

describe('AuthService', () => {
  let service: AuthService
  let authRepository: AuthRepository
  let consoleLogSpy: jest.SpyInstance

  const mockUser = {
    uid: 1,
    id: 'testuser',
    password: 'hashedpassword',
    nick_name: 'Test User',
    student_id: 12345,
    permission_t: 'student',
    create_at: new Date(),
    delete_at: null,
  }

  const mockAuthRepository = {
    findById: jest.fn(),
    checkExistingUser: jest.fn(),
    createUser: jest.fn(),
    saveToken: jest.fn(),
    deleteToken: jest.fn(),
    deleteUser: jest.fn(),
    findToken: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    authRepository = module.get<AuthRepository>(AuthRepository)
    
    // Mock console methods
    consoleLogSpy = jest.spyOn(service, 'warn').mockImplementation()
    
    // Reset all mocks
    Object.values(mockAuthRepository).forEach(mock => mock.mockReset())
    mockedBcrypt.compare.mockReset()
    mockedBcrypt.hash.mockReset()
    mockedJwt.sign.mockReset()
    mockedJwt.verify.mockReset()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  describe('login', () => {
    const loginDto: AuthLoginDto = {
      role: 'student',
      id: 'testuser',
      password: 'testpassword',
    }

    it('should return JWT token for valid credentials', async () => {
      const expectedToken = 'jwt-token-123'
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockedBcrypt.compare.mockResolvedValue(true)
      mockedJwt.sign.mockReturnValue(expectedToken)
      mockAuthRepository.saveToken.mockResolvedValue(undefined)

      const result = await service.login(loginDto)

      expect(result).toBe(expectedToken)
      expect(mockAuthRepository.findById).toHaveBeenCalledWith('testuser')
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword')
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        {
          userId: 'testuser',
          nick_name: 'Test User',
          student_id: 12345,
          role: 'student',
        },
        'test',
        { expiresIn: '1h' }
      )
      expect(mockAuthRepository.saveToken).toHaveBeenCalledWith('testuser', expectedToken)
    })

    it('should throw error when user does not exist', async () => {
      mockAuthRepository.findById.mockResolvedValue(null)

      await expect(service.login(loginDto)).rejects.toThrow('해당 유저가 존재하지 않습니다.')
      expect(mockAuthRepository.findById).toHaveBeenCalledWith('testuser')
    })

    it('should throw error when password does not match', async () => {
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockedBcrypt.compare.mockResolvedValue(false)

      await expect(service.login(loginDto)).rejects.toThrow('비밀번호가 일치하지 않습니다.')
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword')
    })

    it('should use JWT_SECRET from environment or fallback to test', async () => {
      const originalEnv = process.env.JWT_SECRET
      delete process.env.JWT_SECRET
      
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockedBcrypt.compare.mockResolvedValue(true)
      mockedJwt.sign.mockReturnValue('token')
      mockAuthRepository.saveToken.mockResolvedValue(undefined)

      await service.login(loginDto)

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'test',
        expect.any(Object)
      )

      process.env.JWT_SECRET = originalEnv
    })
  })

  describe('register', () => {
    const registerDto: AuthRegisterDto = {
      id: 'newuser',
      password: 'newpassword',
      nick_name: 'New User',
      student_id: 54321,
    }

    it('should create user successfully with valid data', async () => {
      mockAuthRepository.checkExistingUser.mockResolvedValue([])
      mockedBcrypt.hash.mockResolvedValue('hashedpassword')
      mockAuthRepository.createUser.mockResolvedValue(undefined)

      await service.register(registerDto)

      expect(mockAuthRepository.checkExistingUser).toHaveBeenCalledWith(
        'newuser',
        'New User',
        54321
      )
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10)
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
        'newuser',
        'hashedpassword',
        'New User',
        54321
      )
    })

    it('should throw error for duplicate user', async () => {
      mockAuthRepository.checkExistingUser.mockResolvedValue(['id', 'nickname'])

      await expect(service.register(registerDto)).rejects.toThrow(
        'Existing user. Duplicated elements: [ id, nickname ]'
      )
      expect(mockAuthRepository.checkExistingUser).toHaveBeenCalledWith(
        'newuser',
        'New User',
        54321
      )
    })

    it('should handle single duplicate element', async () => {
      mockAuthRepository.checkExistingUser.mockResolvedValue(['id'])

      await expect(service.register(registerDto)).rejects.toThrow(
        'Existing user. Duplicated elements: [ id ]'
      )
    })
  })

  describe('refresh', () => {
    const refreshToken = 'refresh-token-123'
    const decodedToken = {
      userId: 'testuser',
      nick_name: 'Test User',
      student_id: 12345,
      role: 'student',
    }

    it('should return new token for valid refresh token', async () => {
      const newToken = 'new-token-456'
      const mockTokenHistory = { token: refreshToken }
      
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.findToken.mockResolvedValue(mockTokenHistory)
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockedJwt.sign.mockReturnValue(newToken)
      mockAuthRepository.saveToken.mockResolvedValue(undefined)

      const result = await service.refresh(refreshToken)

      expect(result).toBe(newToken)
      expect(mockedJwt.verify).toHaveBeenCalledWith(refreshToken, 'test')
      expect(mockAuthRepository.findToken).toHaveBeenCalledWith('testuser', refreshToken, true)
      expect(mockAuthRepository.saveToken).toHaveBeenCalledWith('testuser', newToken)
    })

    it('should throw error for invalid JWT token', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(service.refresh(refreshToken)).rejects.toThrow('유효하지 않은 토큰입니다.')
    })

    it('should throw error when token not found in database', async () => {
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.findToken.mockResolvedValue(null)

      await expect(service.refresh(refreshToken)).rejects.toThrow('유효하지 않은 토큰입니다.')
    })

    it('should throw error when token mismatch', async () => {
      const mockTokenHistory = { token: 'different-token' }
      
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.findToken.mockResolvedValue(mockTokenHistory)

      await expect(service.refresh(refreshToken)).rejects.toThrow('유효하지 않은 토큰입니다.')
    })
  })

  describe('logout', () => {
    const token = 'logout-token'
    const decodedToken = { userId: 'testuser' }

    it('should logout successfully with valid token', async () => {
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.deleteToken.mockResolvedValue(undefined)

      const result = await service.logout(token)

      expect(result).toBe(true)
      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test')
      expect(mockAuthRepository.deleteToken).toHaveBeenCalledWith('testuser', token)
    })

    it('should throw error for invalid token', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(service.logout(token)).rejects.toThrow('유효하지 않은 토큰입니다.')
    })
  })

  describe('withdraw', () => {
    it('should delete user successfully', async () => {
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockAuthRepository.deleteUser.mockResolvedValue(undefined)

      await service.withdraw('testuser')

      expect(mockAuthRepository.findById).toHaveBeenCalledWith('testuser')
      expect(mockAuthRepository.deleteUser).toHaveBeenCalledWith('testuser')
    })

    it('should throw error when user not found', async () => {
      mockAuthRepository.findById.mockResolvedValue(null)

      await expect(service.withdraw('testuser')).rejects.toThrow('해당 유저가 존재하지 않습니다.')
      expect(mockAuthRepository.findById).toHaveBeenCalledWith('testuser')
    })
  })

  describe('verifyToken', () => {
    const jwt = 'verify-token'
    const decodedToken = { userId: 'testuser' }
    const mockTokenHistory = { token: jwt }

    it('should verify token successfully', async () => {
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockAuthRepository.findToken.mockResolvedValue(mockTokenHistory)

      const result = await service.verifyToken(jwt)

      expect(result).toBe(decodedToken)
      expect(mockedJwt.verify).toHaveBeenCalledWith(jwt, 'test')
      expect(mockAuthRepository.findById).toHaveBeenCalledWith('testuser')
      expect(mockAuthRepository.findToken).toHaveBeenCalledWith('testuser', jwt)
    })

    it('should throw error for invalid JWT', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(service.verifyToken(jwt)).rejects.toThrow('유효하지 않은 토큰입니다.')
    })

    it('should log warnings and throw error when user not found', async () => {
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.findById.mockResolvedValue(null)

      await expect(service.verifyToken(jwt)).rejects.toThrow('해당 유저가 존재하지 않습니다.')
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(3)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '해당 유저가 존재하지 않습니다. (key가 유출되었을 수 있음)'
      )
    })

    it('should throw error when token not found in database', async () => {
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockAuthRepository.findToken.mockResolvedValue(null)

      await expect(service.verifyToken(jwt)).rejects.toThrow('유효하지 않은 토큰입니다.')
    })

    it('should throw error when token mismatch', async () => {
      const mismatchTokenHistory = { token: 'different-token' }
      
      mockedJwt.verify.mockReturnValue(decodedToken)
      mockAuthRepository.findById.mockResolvedValue(mockUser)
      mockAuthRepository.findToken.mockResolvedValue(mismatchTokenHistory)

      await expect(service.verifyToken(jwt)).rejects.toThrow('유효하지 않은 토큰입니다.')
    })
  })

  describe('AuthService inheritance', () => {
    it('should extend ConsoleLogger', () => {
      expect(service).toBeInstanceOf(ConsoleLogger)
    })

    it('should have access to logger methods', () => {
      expect(typeof service.log).toBe('function')
      expect(typeof service.error).toBe('function')
      expect(typeof service.warn).toBe('function')
    })
  })
})