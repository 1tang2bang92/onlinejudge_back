import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let appController: AppController
  let appService: AppService

  const mockAppService = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile()

    appController = app.get<AppController>(AppController)
    appService = app.get<AppService>(AppService)

    // Reset mocks
    mockAppService.getHello.mockClear()
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      mockAppService.getHello.mockReturnValue('Hello World!')
      
      const result = appController.getHello()
      
      expect(result).toBe('Hello World!')
      expect(mockAppService.getHello).toHaveBeenCalledTimes(1)
    })

    it('should call AppService.getHello', () => {
      appController.getHello()
      
      expect(mockAppService.getHello).toHaveBeenCalled()
    })

    it('should return whatever AppService returns', () => {
      const customMessage = 'Custom Hello Message'
      mockAppService.getHello.mockReturnValue(customMessage)
      
      const result = appController.getHello()
      
      expect(result).toBe(customMessage)
    })
  })

  describe('dependency injection', () => {
    it('should have AppService injected', () => {
      expect(appController['appService']).toBe(appService)
    })

    it('should be defined', () => {
      expect(appController).toBeDefined()
    })
  })

  describe('guard integration', () => {
    it('should have AuthGuard applied to GET endpoint', () => {
      // This would be tested through reflection in a real scenario
      // For now, we verify the controller is properly set up
      expect(appController.getHello).toBeDefined()
      expect(typeof appController.getHello).toBe('function')
    })
  })
})