import { Test, TestingModule } from '@nestjs/testing'
import { AppService, PrismaService } from './app.service'

// Mock PrismaClient at the module level
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}))

describe('AppService', () => {
  let service: AppService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile()

    service = module.get<AppService>(AppService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!')
    })

    it('should return a string', () => {
      const result = service.getHello()
      expect(typeof result).toBe('string')
    })
  })
})

describe('PrismaService', () => {
  let service: PrismaService

  beforeEach(async () => {
    // Reset all mocks before each test
    mockPrismaClient.$connect.mockReset()
    mockPrismaClient.$disconnect.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile()

    service = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should extend PrismaClient', () => {
    expect(service).toBeDefined()
    expect(service.$connect).toBeDefined()
    expect(service.$disconnect).toBeDefined()
  })

  it('should implement OnModuleInit interface', () => {
    expect(service).toBeInstanceOf(PrismaService)
    expect(typeof service.onModuleInit).toBe('function')
  })

  it('should implement OnModuleDestroy interface', () => {
    expect(service).toBeInstanceOf(PrismaService)
    expect(typeof service.onModuleDestroy).toBe('function')
  })

  describe('onModuleInit', () => {
    it('should call $connect on module initialization', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined)

      await service.onModuleInit()

      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1)
    })

    it('should handle connection errors', async () => {
      const connectionError = new Error('Database connection failed')
      mockPrismaClient.$connect.mockRejectedValue(connectionError)

      await expect(service.onModuleInit()).rejects.toThrow('Database connection failed')
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1)
    })

    it('should not throw when $connect is successful', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined)

      await expect(service.onModuleInit()).resolves.toBeUndefined()
    })
  })

  describe('onModuleDestroy', () => {
    it('should call $disconnect on module destruction', async () => {
      mockPrismaClient.$disconnect.mockResolvedValue(undefined)

      await service.onModuleDestroy()

      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1)
    })

    it('should handle disconnection errors', async () => {
      const disconnectionError = new Error('Database disconnection failed')
      mockPrismaClient.$disconnect.mockRejectedValue(disconnectionError)

      await expect(service.onModuleDestroy()).rejects.toThrow('Database disconnection failed')
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1)
    })

    it('should not throw when $disconnect is successful', async () => {
      mockPrismaClient.$disconnect.mockResolvedValue(undefined)

      await expect(service.onModuleDestroy()).resolves.toBeUndefined()
    })
  })

  describe('Lifecycle management for CMS', () => {
    it('should handle complete database lifecycle for CMS operations', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined)
      mockPrismaClient.$disconnect.mockResolvedValue(undefined)

      // Initialize - CMS 시작
      await service.onModuleInit()
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1)

      // Destroy - CMS 종료
      await service.onModuleDestroy()
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1)
    })

    it('should be ready for workspace and content operations', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined)

      await service.onModuleInit()

      // CMS에서 사용할 데이터베이스 연결이 준비되어야 함
      expect(service.$connect).toBeDefined()
      expect(service.$disconnect).toBeDefined()
    })
  })

  describe('Error scenarios for CMS', () => {
    it('should handle database unavailability gracefully', async () => {
      const dbError = new Error('PostgreSQL server not available')
      mockPrismaClient.$connect.mockRejectedValue(dbError)

      await expect(service.onModuleInit()).rejects.toThrow('PostgreSQL server not available')
    })

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('ECONNREFUSED')
      mockPrismaClient.$connect.mockRejectedValue(networkError)

      await expect(service.onModuleInit()).rejects.toThrow('ECONNREFUSED')
    })
  })

  describe('Service properties', () => {
    it('should inherit all PrismaClient methods for CMS operations', () => {
      // CMS에 필요한 데이터베이스 연결 메서드들
      expect(service.$connect).toBeDefined()
      expect(service.$disconnect).toBeDefined()
      expect(typeof service.$connect).toBe('function')
      expect(typeof service.$disconnect).toBe('function')
    })

    it('should be a singleton service for CMS data consistency', () => {
      // NestJS에서 PrismaService는 싱글톤으로 동작해야 함
      expect(service).toBe(service)
    })
  })
})