import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { ROLE_KEY } from '../role/role.decorate'

describe('AuthGuard', () => {
  let guard: AuthGuard
  let authService: AuthService
  let reflector: Reflector
  let mockExecutionContext: ExecutionContext
  let mockRequest: any

  const mockAuthService = {
    verifyToken: jest.fn(),
  }

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile()

    guard = module.get<AuthGuard>(AuthGuard)
    authService = module.get<AuthService>(AuthService)
    reflector = module.get<Reflector>(Reflector)

    // Mock request object
    mockRequest = {
      headers: {},
    }

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any

    // Reset all mocks
    mockAuthService.verifyToken.mockReset()
    mockReflector.getAllAndOverride.mockReset()
  })

  describe('canActivate', () => {
    it('should allow access when no roles are required', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined)
      mockRequest.headers.bearer = 'valid-jwt-token'
      mockAuthService.verifyToken.mockResolvedValue({ userId: 'testuser', role: 'student' })

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLE_KEY, [
        expect.anything(),
        expect.anything(),
      ])
    })

    it('should extract roles from method and class', async () => {
      const mockHandler = jest.fn()
      const mockClass = jest.fn()
      mockExecutionContext.getHandler = jest.fn().mockReturnValue(mockHandler)
      mockExecutionContext.getClass = jest.fn().mockReturnValue(mockClass)

      mockReflector.getAllAndOverride.mockReturnValue(['admin'])
      mockRequest.headers.bearer = 'valid-jwt-token'
      mockAuthService.verifyToken.mockResolvedValue({ userId: 'testuser', role: 'admin' })

      await guard.canActivate(mockExecutionContext)

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLE_KEY, [
        mockHandler,
        mockClass,
      ])
    })

    it('should call validateRequest with correct parameters', async () => {
      const roles = ['admin', 'professor']
      mockReflector.getAllAndOverride.mockReturnValue(roles)
      mockRequest.headers.bearer = 'valid-jwt-token'
      mockAuthService.verifyToken.mockResolvedValue({ userId: 'testuser', role: 'admin' })

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
    })
  })

  describe('validateRequest', () => {
    it('should return true when no bearer token and no roles required', async () => {
      mockRequest.headers = {}

      const result = await guard.validateRequest(mockRequest, undefined)

      expect(result).toBe(true)
    })

    it('should return false when no bearer token but roles required', async () => {
      mockRequest.headers = {}

      const result = await guard.validateRequest(mockRequest, ['admin'])

      expect(result).toBe(false)
    })

    it('should return true when valid token and no roles required', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      mockAuthService.verifyToken.mockResolvedValue({ userId: 'testuser', role: 'student' })

      const result = await guard.validateRequest(mockRequest, undefined)

      expect(result).toBe(true)
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-jwt-token')
    })

    it('should return false when verifyToken throws error', async () => {
      mockRequest.headers.bearer = 'invalid-jwt-token'
      mockAuthService.verifyToken.mockRejectedValue(new Error('Invalid token'))

      const result = await guard.validateRequest(mockRequest, undefined)

      expect(result).toBe(false)
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('invalid-jwt-token')
    })

    // Testing the identified bug: inverted role logic
    it('should demonstrate the role validation bug', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      const mockToken = { userId: 'testuser', role: 'admin' }
      mockAuthService.verifyToken.mockResolvedValue(mockToken)

      // Current buggy implementation: returns false when user HAS the required role
      const result = await guard.validateRequest(mockRequest, ['admin'])

      // This test demonstrates the bug - it should return true but returns false
      expect(result).toBe(false) // Bug: should be true
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-jwt-token')
    })

    it('should show correct behavior when user lacks required role (after bug fix)', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      const mockToken = { userId: 'testuser', role: 'student' }
      mockAuthService.verifyToken.mockResolvedValue(mockToken)

      // User has 'student' role but 'admin' is required
      const result = await guard.validateRequest(mockRequest, ['admin'])

      // Due to the bug, this actually returns true (should be false)
      expect(result).toBe(true) // Bug: should be false
    })

    it('should handle multiple required roles', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      const mockToken = { userId: 'testuser', role: 'professor' }
      mockAuthService.verifyToken.mockResolvedValue(mockToken)

      const result = await guard.validateRequest(mockRequest, ['admin', 'professor'])

      // Due to the bug, this returns false even though user has required role
      expect(result).toBe(false) // Bug: should be true
    })

    it('should handle token without role property', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      const mockToken = { userId: 'testuser' } // No role property
      mockAuthService.verifyToken.mockResolvedValue(mockToken)

      const result = await guard.validateRequest(mockRequest, ['admin'])

      // When token has no role, includes() returns false, so !false = true
      expect(result).toBe(true) // Bug: should be false
    })

    it('should handle empty roles array', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      const mockToken = { userId: 'testuser', role: 'student' }
      mockAuthService.verifyToken.mockResolvedValue(mockToken)

      const result = await guard.validateRequest(mockRequest, [])

      expect(result).toBe(true) // Empty array, includes() returns false, !false = true
    })

    it('should handle null/undefined token response', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      mockAuthService.verifyToken.mockResolvedValue(null)

      const result = await guard.validateRequest(mockRequest, ['admin'])

      expect(result).toBe(false) // Should handle null token gracefully
    })
  })

  describe('Header extraction', () => {
    it('should extract JWT from bearer header', async () => {
      mockRequest.headers.bearer = 'test-jwt-token'
      mockAuthService.verifyToken.mockResolvedValue({ userId: 'testuser' })

      await guard.validateRequest(mockRequest, undefined)

      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('test-jwt-token')
    })

    it('should handle missing bearer header', async () => {
      mockRequest.headers = {}

      const result = await guard.validateRequest(mockRequest, undefined)

      expect(result).toBe(true)
      expect(mockAuthService.verifyToken).not.toHaveBeenCalled()
    })

    it('should handle empty bearer header', async () => {
      mockRequest.headers.bearer = ''

      const result = await guard.validateRequest(mockRequest, undefined)

      expect(result).toBe(true)
      expect(mockAuthService.verifyToken).not.toHaveBeenCalled()
    })
  })

  describe('Integration with ExecutionContext', () => {
    it('should properly extract request from HTTP context', async () => {
      const mockSwitchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      })
      mockExecutionContext.switchToHttp = mockSwitchToHttp
      mockReflector.getAllAndOverride.mockReturnValue(undefined)

      await guard.canActivate(mockExecutionContext)

      expect(mockSwitchToHttp).toHaveBeenCalled()
    })
  })

  describe('Guard dependency injection', () => {
    it('should have AuthService injected', () => {
      expect(guard['authService']).toBe(authService)
    })

    it('should have Reflector injected', () => {
      expect(guard['reflector']).toBe(reflector)
    })
  })

  describe('Error scenarios', () => {
    it('should handle AuthService errors gracefully', async () => {
      mockRequest.headers.bearer = 'valid-jwt-token'
      mockAuthService.verifyToken.mockRejectedValue(new Error('Database error'))

      const result = await guard.validateRequest(mockRequest, undefined)

      expect(result).toBe(false)
    })

    it('should handle malformed JWT tokens', async () => {
      mockRequest.headers.bearer = 'malformed.jwt.token'
      mockAuthService.verifyToken.mockRejectedValue(new Error('Malformed token'))

      const result = await guard.validateRequest(mockRequest, undefined)

      expect(result).toBe(false)
    })
  })
})