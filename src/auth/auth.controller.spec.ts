import { Test, TestingModule } from '@nestjs/testing'
import { ConsoleLogger } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthLoginDto, AuthRegisterDto } from './auth.dto'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService
  let mockResponse: any

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    withdraw: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)

    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    }

    // Reset all mocks
    Object.values(mockAuthService).forEach(mock => mock.mockReset())
    mockResponse.status.mockClear()
    mockResponse.json.mockClear()
    mockResponse.setHeader.mockClear()
  })

  describe('login', () => {
    const loginDto: AuthLoginDto = {
      role: 'student',
      id: 'testuser',
      password: 'testpassword',
    }

    it('should return 200 and set bearer token on successful login', async () => {
      const mockToken = 'jwt-token-123'
      mockAuthService.login.mockResolvedValue(mockToken)

      await controller.login(loginDto, mockResponse)

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto)
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Authorization', `Bearer ${mockToken}`)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: true,
        message: 'Login successful',
        data: { token: mockToken }
      })
    })

    it('should return 401 on login failure', async () => {
      const errorMessage = '해당 유저가 존재하지 않습니다.'
      mockAuthService.login.mockRejectedValue(new Error(errorMessage))

      await controller.login(loginDto, mockResponse)

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto)
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: false, 
        message: errorMessage 
      })
    })
  })

  describe('refresh', () => {
    const refreshBody = { refreshToken: 'refresh-token-123' }

    it('should return 200 and new bearer token on successful refresh', async () => {
      const mockNewToken = 'new-jwt-token-456'
      mockAuthService.refresh.mockResolvedValue(mockNewToken)

      await controller.refresh(refreshBody, mockResponse)

      expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh-token-123')
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Authorization', `Bearer ${mockNewToken}`)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Token refreshed successfully',
        data: { token: mockNewToken }
      })
    })

    it('should return 401 on invalid refresh token', async () => {
      const errorMessage = '유효하지 않은 토큰입니다.'
      mockAuthService.refresh.mockRejectedValue(new Error(errorMessage))

      await controller.refresh(refreshBody, mockResponse)

      expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh-token-123')
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: false, 
        message: errorMessage 
      })
    })
  })

  describe('register', () => {
    const registerDto: AuthRegisterDto = {
      id: 'newuser',
      password: 'newpassword',
      nick_name: 'New User',
      student_id: 54321,
    }

    it('should return 201 on successful registration', async () => {
      mockAuthService.register.mockResolvedValue(undefined)

      await controller.register(registerDto, mockResponse)

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto)
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Registration successful' 
      })
    })

    it('should return 400 on registration failure', async () => {
      const errorMessage = 'Existing user. Duplicated elements: [ id ]'
      mockAuthService.register.mockRejectedValue(new Error(errorMessage))

      await controller.register(registerDto, mockResponse)

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: false, 
        message: errorMessage 
      })
    })
  })

  describe('logout', () => {
    const logoutBody = { token: 'logout-token-123' }

    it('should return 200 on successful logout', async () => {
      mockAuthService.logout.mockResolvedValue(true)

      await controller.logout(logoutBody, mockResponse)

      expect(mockAuthService.logout).toHaveBeenCalledWith('logout-token-123')
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Logout successful' 
      })
    })

    it('should return 401 on logout failure', async () => {
      const errorMessage = '유효하지 않은 토큰입니다.'
      mockAuthService.logout.mockRejectedValue(new Error(errorMessage))

      await controller.logout(logoutBody, mockResponse)

      expect(mockAuthService.logout).toHaveBeenCalledWith('logout-token-123')
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: false, 
        message: errorMessage 
      })
    })
  })

  describe('withdraw', () => {
    const withdrawBody = { id: 'testuser' }

    it('should return 200 on successful withdrawal', async () => {
      mockAuthService.withdraw.mockResolvedValue(undefined)

      await controller.withdraw(withdrawBody, mockResponse)

      expect(mockAuthService.withdraw).toHaveBeenCalledWith('testuser')
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Account withdrawal successful' 
      })
    })

    it('should return 401 on withdrawal failure', async () => {
      const errorMessage = '해당 유저가 존재하지 않습니다.'
      mockAuthService.withdraw.mockRejectedValue(new Error(errorMessage))

      await controller.withdraw(withdrawBody, mockResponse)

      expect(mockAuthService.withdraw).toHaveBeenCalledWith('testuser')
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: false, 
        message: errorMessage 
      })
    })
  })

  describe('AuthController inheritance and setup', () => {
    it('should extend ConsoleLogger', () => {
      expect(controller).toBeInstanceOf(ConsoleLogger)
    })

    it('should have AuthService dependency injected', () => {
      expect(controller['authService']).toBe(authService)
    })
  })
})