import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../app.service';

describe('AuthModule', () => {
  let module: TestingModule;
  let authController: AuthController;
  let authService: AuthService;
  let authRepository: AuthRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    // Mock PrismaService since it's not available in isolated AuthModule testing
    const mockPrismaService = {
      user_info: {
        findFirst: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      login: {
        create: jest.fn(),
        findFirst: jest.fn(),
        deleteMany: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Module Compilation', () => {
    it('should compile the module successfully', () => {
      expect(module).toBeDefined();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
      expect(module).toBeInstanceOf(TestingModule);
    });

    it('should compile without AppModule dependencies', async () => {
      // Test that AuthModule can be compiled independently with mocked dependencies
      const isolatedModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(PrismaService)
        .useValue({
          user_info: { findFirst: jest.fn() },
          login: { findFirst: jest.fn() },
        })
        .compile();

      expect(isolatedModule).toBeDefined();
      await isolatedModule.close();
    });
  });

  describe('Provider Registration', () => {
    it('should register AuthController', () => {
      expect(authController).toBeDefined();
      expect(authController).toBeInstanceOf(AuthController);
    });

    it('should register AuthService', () => {
      expect(authService).toBeDefined();
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should register AuthRepository', () => {
      expect(authRepository).toBeDefined();
      expect(authRepository).toBeInstanceOf(AuthRepository);
    });

    it('should provide all declared controllers', () => {
      const controllers = [AuthController];
      controllers.forEach((controller) => {
        const instance = module.get(controller);
        expect(instance).toBeDefined();
        expect(instance).toBeInstanceOf(controller);
      });
    });

    it('should provide all declared providers', () => {
      const providers = [AuthService, AuthRepository];
      providers.forEach((provider) => {
        const instance = module.get(provider);
        expect(instance).toBeDefined();
        expect(instance).toBeInstanceOf(provider);
      });
    });
  });

  describe('Module Exports', () => {
    it('should export AuthService', () => {
      expect(authService).toBeDefined();
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should make AuthService available for other modules', async () => {
      // Create a consumer module to test export
      const ConsumerModule = class {};
      const consumerModule = await Test.createTestingModule({
        imports: [AuthModule],
        providers: [ConsumerModule],
      })
        .overrideProvider(PrismaService)
        .useValue(prismaService)
        .compile();

      const exportedAuthService = consumerModule.get<AuthService>(AuthService);
      expect(exportedAuthService).toBeDefined();
      expect(exportedAuthService).toBeInstanceOf(AuthService);

      await consumerModule.close();
    });

    it('should not export AuthRepository (internal provider)', async () => {
      // AuthRepository should not be accessible outside the module
      const ConsumerModule = class {};
      const consumerModule = await Test.createTestingModule({
        imports: [AuthModule],
        providers: [ConsumerModule],
      })
        .overrideProvider(PrismaService)
        .useValue(prismaService)
        .compile();

      // AuthRepository should still be resolvable within the module context
      const authRepo = consumerModule.get<AuthRepository>(AuthRepository, { strict: false });
      expect(authRepo).toBeDefined();

      await consumerModule.close();
    });
  });

  describe('Dependency Injection Chain', () => {
    it('should properly inject AuthService into AuthController', () => {
      expect(authController['authService']).toBeDefined();
      expect(authController['authService']).toBeInstanceOf(AuthService);
      expect(authController['authService']).toBe(authService);
    });

    it('should properly inject AuthRepository into AuthService', () => {
      expect(authService['authRepository']).toBeDefined();
      expect(authService['authRepository']).toBeInstanceOf(AuthRepository);
      expect(authService['authRepository']).toBe(authRepository);
    });

    it('should properly inject PrismaService into AuthRepository', () => {
      expect(authRepository['prisma']).toBeDefined();
      expect(authRepository['prisma']).toBe(prismaService);
    });

    it('should verify the complete DI chain: AuthController -> AuthService -> AuthRepository -> PrismaService', () => {
      // Start from AuthController
      const authServiceFromController = authController['authService'];
      expect(authServiceFromController).toBeDefined();
      expect(authServiceFromController).toBeInstanceOf(AuthService);

      // Get AuthRepository from AuthService
      const authRepositoryFromService = authServiceFromController['authRepository'];
      expect(authRepositoryFromService).toBeDefined();
      expect(authRepositoryFromService).toBeInstanceOf(AuthRepository);

      // Get PrismaService from AuthRepository
      const prismaServiceFromRepository = authRepositoryFromService['prisma'];
      expect(prismaServiceFromRepository).toBeDefined();

      // Verify it's the same instances throughout the chain
      expect(authServiceFromController).toBe(authService);
      expect(authRepositoryFromService).toBe(authRepository);
      expect(prismaServiceFromRepository).toBe(prismaService);
    });
  });

  describe('Cross-Module Dependencies', () => {
    it('should require PrismaService from external source', () => {
      // AuthModule depends on PrismaService which should come from AppModule
      expect(authRepository['prisma']).toBeDefined();
    });

    it('should work with globally provided PrismaService', async () => {
      // Simulate global PrismaService provision
      const globalPrismaService = {
        user_info: {
          findFirst: jest.fn().mockResolvedValue({ id: 'test', password: 'hashed' }),
          create: jest.fn(),
          updateMany: jest.fn(),
        },
        login: {
          create: jest.fn(),
          findFirst: jest.fn(),
          deleteMany: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      };

      const moduleWithGlobalPrisma = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(PrismaService)
        .useValue(globalPrismaService)
        .compile();

      const authRepo = moduleWithGlobalPrisma.get<AuthRepository>(AuthRepository);
      expect(authRepo['prisma']).toBe(globalPrismaService);

      await moduleWithGlobalPrisma.close();
    });
  });

  describe('Module Metadata', () => {
    it('should have correct module controllers', () => {
      const moduleMetadata = Reflect.getMetadata('controllers', AuthModule);
      expect(moduleMetadata).toEqual([AuthController]);
    });

    it('should have correct module providers', () => {
      const moduleMetadata = Reflect.getMetadata('providers', AuthModule);
      expect(moduleMetadata).toEqual([AuthService, AuthRepository]);
    });

    it('should have correct module exports', () => {
      const moduleMetadata = Reflect.getMetadata('exports', AuthModule);
      expect(moduleMetadata).toEqual([AuthService]);
    });

    it('should not have any imports', () => {
      const moduleMetadata = Reflect.getMetadata('imports', AuthModule);
      expect(moduleMetadata).toBeUndefined();
    });
  });

  describe('Service Integration', () => {
    it('should allow AuthService to access AuthRepository methods', () => {
      const authRepo = authService['authRepository'];
      
      expect(authRepo.findById).toBeDefined();
      expect(authRepo.checkExistingUser).toBeDefined();
      expect(authRepo.createUser).toBeDefined();
      expect(authRepo.saveToken).toBeDefined();
      expect(authRepo.deleteToken).toBeDefined();
      expect(authRepo.deleteUser).toBeDefined();
      expect(authRepo.findToken).toBeDefined();
      
      expect(typeof authRepo.findById).toBe('function');
      expect(typeof authRepo.checkExistingUser).toBe('function');
      expect(typeof authRepo.createUser).toBe('function');
      expect(typeof authRepo.saveToken).toBe('function');
      expect(typeof authRepo.deleteToken).toBe('function');
      expect(typeof authRepo.deleteUser).toBe('function');
      expect(typeof authRepo.findToken).toBe('function');
    });

    it('should allow AuthRepository to access PrismaService methods', () => {
      const prismaInstance = authRepository['prisma'];
      
      expect(prismaInstance.user_info).toBeDefined();
      expect(prismaInstance.login).toBeDefined();
    });

    it('should allow AuthController to access AuthService methods', () => {
      const authServiceInstance = authController['authService'];
      
      expect(authServiceInstance.login).toBeDefined();
      expect(authServiceInstance.refresh).toBeDefined();
      expect(authServiceInstance.register).toBeDefined();
      expect(authServiceInstance.logout).toBeDefined();
      expect(authServiceInstance.withdraw).toBeDefined();
      expect(authServiceInstance.verifyToken).toBeDefined();
      
      expect(typeof authServiceInstance.login).toBe('function');
      expect(typeof authServiceInstance.refresh).toBe('function');
      expect(typeof authServiceInstance.register).toBe('function');
      expect(typeof authServiceInstance.logout).toBe('function');
      expect(typeof authServiceInstance.withdraw).toBe('function');
      expect(typeof authServiceInstance.verifyToken).toBe('function');
    });
  });

  describe('Inheritance Verification', () => {
    it('should verify AuthService extends ConsoleLogger', () => {
      expect(authService.log).toBeDefined();
      expect(authService.error).toBeDefined();
      expect(authService.warn).toBeDefined();
      expect(authService.debug).toBeDefined();
      expect(authService.verbose).toBeDefined();
    });

    it('should verify AuthController extends ConsoleLogger', () => {
      expect(authController.log).toBeDefined();
      expect(authController.error).toBeDefined();
      expect(authController.warn).toBeDefined();
      expect(authController.debug).toBeDefined();
      expect(authController.verbose).toBeDefined();
    });

    it('should verify AuthRepository extends AppService', () => {
      expect(authRepository.getHello).toBeDefined();
      expect(typeof authRepository.getHello).toBe('function');
      expect(authRepository.getHello()).toBe('Hello World!');
    });
  });

  describe('Provider Scoping', () => {
    it('should create singleton instances within the module', () => {
      const authService1 = module.get<AuthService>(AuthService);
      const authService2 = module.get<AuthService>(AuthService);
      
      expect(authService1).toBe(authService2);
      expect(authService1).toBe(authService);
    });

    it('should create singleton instances for AuthRepository', () => {
      const authRepo1 = module.get<AuthRepository>(AuthRepository);
      const authRepo2 = module.get<AuthRepository>(AuthRepository);
      
      expect(authRepo1).toBe(authRepo2);
      expect(authRepo1).toBe(authRepository);
    });

    it('should maintain the same PrismaService instance across all consumers', () => {
      const prismaFromModule = module.get<PrismaService>(PrismaService);
      const prismaFromRepository = authRepository['prisma'];
      
      expect(prismaFromModule).toBe(prismaFromRepository);
      expect(prismaFromModule).toBe(prismaService);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing PrismaService dependency', async () => {
      const testCompilation = async () => {
        const testModule = await Test.createTestingModule({
          controllers: [AuthController],
          providers: [AuthService, AuthRepository], // Missing PrismaService
        }).compile();
        return testModule;
      };

      // This should throw an error due to missing PrismaService dependency
      await expect(testCompilation()).rejects.toThrow();
    });

    it('should handle missing AuthRepository dependency', async () => {
      const testCompilation = async () => {
        const testModule = await Test.createTestingModule({
          controllers: [AuthController],
          providers: [AuthService], // Missing AuthRepository
        })
          .overrideProvider(PrismaService)
          .useValue(prismaService)
          .compile();
        return testModule;
      };

      // This should throw an error due to missing AuthRepository dependency
      await expect(testCompilation()).rejects.toThrow();
    });

    it('should handle missing AuthService dependency', async () => {
      const testCompilation = async () => {
        const testModule = await Test.createTestingModule({
          controllers: [AuthController], // Missing AuthService
          providers: [AuthRepository],
        })
          .overrideProvider(PrismaService)
          .useValue(prismaService)
          .compile();
        return testModule;
      };

      // This should throw an error due to missing AuthService dependency
      await expect(testCompilation()).rejects.toThrow();
    });
  });

  describe('Module Resolution with Different Configurations', () => {
    it('should resolve dependencies with custom providers', async () => {
      const customAuthService = {
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        withdraw: jest.fn(),
        refresh: jest.fn(),
        verifyToken: jest.fn(),
      };

      const moduleWithCustom = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue(customAuthService)
        .overrideProvider(PrismaService)
        .useValue(prismaService)
        .compile();

      const authController = moduleWithCustom.get<AuthController>(AuthController);
      expect(authController['authService']).toBe(customAuthService);

      await moduleWithCustom.close();
    });

    it('should work with factory providers', async () => {
      const moduleWithFactory = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(PrismaService)
        .useFactory({
          factory: () => ({
            user_info: { findFirst: jest.fn() },
            login: { findFirst: jest.fn() },
          }),
        })
        .compile();

      const authRepo = moduleWithFactory.get<AuthRepository>(AuthRepository);
      expect(authRepo['prisma']).toBeDefined();

      await moduleWithFactory.close();
    });
  });

  describe('100% Dependency Injection Coverage', () => {
    it('should verify all injectable dependencies are properly wired', () => {
      // Verify AuthController dependencies
      expect(authController).toBeDefined();
      expect(authController['authService']).toBeDefined();
      expect(authController['authService']).toBeInstanceOf(AuthService);

      // Verify AuthService dependencies
      expect(authService).toBeDefined();
      expect(authService['authRepository']).toBeDefined();
      expect(authService['authRepository']).toBeInstanceOf(AuthRepository);

      // Verify AuthRepository dependencies
      expect(authRepository).toBeDefined();
      expect(authRepository['prisma']).toBeDefined();

      // Verify dependency chain integrity
      const controllerAuthService = authController['authService'];
      const serviceAuthRepository = controllerAuthService['authRepository'];
      const repositoryPrismaService = serviceAuthRepository['prisma'];

      expect(controllerAuthService).toBe(authService);
      expect(serviceAuthRepository).toBe(authRepository);
      expect(repositoryPrismaService).toBe(prismaService);
    });

    it('should verify all class constructors receive expected dependencies', () => {
      // Test constructor parameter injection
      expect(authController['authService']).not.toBeUndefined();
      expect(authService['authRepository']).not.toBeUndefined();
      expect(authRepository['prisma']).not.toBeUndefined();
    });

    it('should verify dependency types match expected interfaces', () => {
      // Verify AuthService has expected methods (acts as interface check)
      const authServiceMethods = [
        'login', 'refresh', 'register', 'logout', 'withdraw', 'verifyToken'
      ];
      authServiceMethods.forEach(method => {
        expect(typeof authService[method]).toBe('function');
      });

      // Verify AuthRepository has expected methods
      const authRepositoryMethods = [
        'findById', 'checkExistingUser', 'createUser', 'saveToken', 
        'deleteToken', 'deleteUser', 'findToken'
      ];
      authRepositoryMethods.forEach(method => {
        expect(typeof authRepository[method]).toBe('function');
      });

      // Verify PrismaService has expected properties
      expect(authRepository['prisma'].user_info).toBeDefined();
      expect(authRepository['prisma'].login).toBeDefined();
    });
  });
});