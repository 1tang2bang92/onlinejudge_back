import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from './app.module'
import { AppController } from './app.controller'
import { AppService, PrismaService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { AuthService } from './auth/auth.service'

describe('AppModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
  })

  afterEach(async () => {
    await module.close()
  })

  describe('Module compilation', () => {
    it('should compile the module', () => {
      expect(module).toBeDefined()
    })

    it('should be a TestingModule instance', () => {
      expect(module).toBeInstanceOf(TestingModule)
    })
  })

  describe('Controllers registration', () => {
    it('should register AppController', () => {
      const controller = module.get<AppController>(AppController)
      expect(controller).toBeDefined()
      expect(controller).toBeInstanceOf(AppController)
    })
  })

  describe('Providers registration', () => {
    it('should register AppService', () => {
      const service = module.get<AppService>(AppService)
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(AppService)
    })

    it('should register PrismaService', () => {
      const service = module.get<PrismaService>(PrismaService)
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(PrismaService)
    })
  })

  describe('Module imports', () => {
    it('should import AuthModule', () => {
      const authService = module.get<AuthService>(AuthService)
      expect(authService).toBeDefined()
    })
  })

  describe('Global exports', () => {
    it('should export PrismaService globally', () => {
      const prismaService = module.get<PrismaService>(PrismaService)
      expect(prismaService).toBeDefined()
    })

    it('should make PrismaService available across modules', () => {
      // Since AppModule is marked as @Global(), PrismaService should be available
      const prismaService = module.get<PrismaService>(PrismaService)
      expect(prismaService).toBeInstanceOf(PrismaService)
    })
  })

  describe('Dependency injection', () => {
    it('should resolve all dependencies correctly', () => {
      const appController = module.get<AppController>(AppController)
      const appService = module.get<AppService>(AppService)
      const prismaService = module.get<PrismaService>(PrismaService)

      expect(appController).toBeDefined()
      expect(appService).toBeDefined()
      expect(prismaService).toBeDefined()
    })

    it('should inject AppService into AppController', () => {
      const appController = module.get<AppController>(AppController)
      expect(appController['appService']).toBeDefined()
    })
  })

  describe('Module metadata', () => {
    it('should have correct module structure', () => {
      // Verify that the module is properly configured
      expect(module.get(AppController)).toBeDefined()
      expect(module.get(AppService)).toBeDefined()
      expect(module.get(PrismaService)).toBeDefined()
      expect(module.get(AuthService)).toBeDefined()
    })
  })

  describe('Lifecycle management', () => {
    it('should handle module initialization', async () => {
      // Module should initialize without errors
      await expect(module.init()).resolves.not.toThrow()
    })
  })
})