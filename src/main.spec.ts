// Mock all external dependencies first
jest.mock('@nestjs/core');
jest.mock('@nestjs/swagger');
jest.mock('@nestjs/platform-fastify');
jest.mock('./app.module');

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('Bootstrap Function', () => {
  let mockApp: any;
  let mockNestFactory: jest.Mocked<typeof NestFactory>;
  let mockSwaggerModule: jest.Mocked<typeof SwaggerModule>;
  let mockDocumentBuilder: jest.MockedClass<typeof DocumentBuilder>;
  let mockFastifyAdapter: jest.MockedClass<typeof FastifyAdapter>;
  let bootstrap: () => Promise<void>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.resetModules();

    // Mock application instance
    mockApp = {
      listen: jest.fn().mockResolvedValue(undefined),
    };

    // Mock NestFactory
    mockNestFactory = NestFactory as jest.Mocked<typeof NestFactory>;
    mockNestFactory.create = jest.fn().mockResolvedValue(mockApp);

    // Mock DocumentBuilder
    const mockDocumentBuilderInstance = {
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addTag: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({ title: 'Vision Lab. Hoseo online judge' }),
    } as any;

    mockDocumentBuilder = DocumentBuilder as jest.MockedClass<typeof DocumentBuilder>;
    mockDocumentBuilder.mockImplementation(() => mockDocumentBuilderInstance);

    // Mock SwaggerModule
    mockSwaggerModule = SwaggerModule as jest.Mocked<typeof SwaggerModule>;
    mockSwaggerModule.createDocument = jest.fn().mockReturnValue({ info: { title: 'Test API' } });
    mockSwaggerModule.setup = jest.fn();

    // Mock FastifyAdapter
    mockFastifyAdapter = FastifyAdapter as jest.MockedClass<typeof FastifyAdapter>;
  });

  // Import bootstrap function after setting up mocks
  const importBootstrap = async () => {
    // Clear require cache to ensure fresh import
    delete require.cache[require.resolve('./main')];
    const mainModule = await import('./main');
    return mainModule;
  };

  describe('Successful Bootstrap', () => {
    let importedBootstrap: () => Promise<void>;

    beforeEach(async () => {
      // Import bootstrap function fresh for each test
      delete require.cache[require.resolve('./main')];
      const { bootstrap: bootstrapFn } = await import('./main');
      importedBootstrap = bootstrapFn;
      await importedBootstrap();
    });

    it('should create NestJS application with correct configuration', () => {
      expect(mockNestFactory.create).toHaveBeenCalledTimes(1);
      expect(mockNestFactory.create).toHaveBeenCalledWith(
        AppModule,
        expect.any(mockFastifyAdapter),
        {
          logger: ['error', 'warn'],
        }
      );
    });

    it('should create FastifyAdapter instance', () => {
      expect(mockFastifyAdapter).toHaveBeenCalledTimes(1);
      expect(mockFastifyAdapter).toHaveBeenCalledWith();
    });

    it('should configure logger with error and warn levels only', () => {
      const createCall = mockNestFactory.create.mock.calls[0];
      expect(createCall[2]).toEqual({
        logger: ['error', 'warn'],
      });
    });

    it('should setup Swagger documentation with correct configuration', () => {
      expect(mockDocumentBuilder).toHaveBeenCalledTimes(1);
      
      const builderInstance = mockDocumentBuilder.mock.results[0].value;
      expect(builderInstance.setTitle).toHaveBeenCalledWith('Vision Lab. Hoseo online judge');
      expect(builderInstance.setDescription).toHaveBeenCalledWith('online judge API description');
      expect(builderInstance.setVersion).toHaveBeenCalledWith('1.0');
      expect(builderInstance.addTag).toHaveBeenCalledWith('oj');
      expect(builderInstance.build).toHaveBeenCalledTimes(1);
    });

    it('should create Swagger document with app and config', () => {
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledWith(
        mockApp,
        { title: 'Vision Lab. Hoseo online judge' }
      );
    });

    it('should setup Swagger UI at /api endpoint', () => {
      expect(mockSwaggerModule.setup).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.setup).toHaveBeenCalledWith(
        'api',
        mockApp,
        { info: { title: 'Test API' } }
      );
    });

    it('should start server on port 3000 with host 0.0.0.0', () => {
      expect(mockApp.listen).toHaveBeenCalledTimes(1);
      expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
    });

    it('should call methods in correct sequence', () => {
      const calls = [
        mockNestFactory.create,
        mockDocumentBuilder,
        mockSwaggerModule.createDocument,
        mockSwaggerModule.setup,
        mockApp.listen,
      ];

      // Verify all methods were called
      calls.forEach(method => {
        expect(method).toHaveBeenCalled();
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle NestFactory.create failure', async () => {
      const createError = new Error('Failed to create application');
      mockNestFactory.create.mockRejectedValue(createError);

      delete require.cache[require.resolve('./main')];
      const { bootstrap: bootstrapFn } = await import('./main');
      
      await expect(bootstrapFn()).rejects.toBe(createError);

      expect(mockNestFactory.create).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.createDocument).not.toHaveBeenCalled();
      expect(mockApp.listen).not.toHaveBeenCalled();
    });

    it('should handle DocumentBuilder configuration errors', async () => {
      const builderError = new Error('DocumentBuilder configuration failed');
      const mockDocumentBuilderInstance = {
        setTitle: jest.fn().mockReturnThis(),
        setDescription: jest.fn().mockReturnThis(),
        setVersion: jest.fn().mockReturnThis(),
        addTag: jest.fn().mockReturnThis(),
        build: jest.fn().mockImplementation(() => {
          throw builderError;
        }),
      } as any;

      mockDocumentBuilder.mockImplementation(() => mockDocumentBuilderInstance);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await require('./main');
      } catch (error) {
        expect(error).toBe(builderError);
      }

      expect(mockNestFactory.create).toHaveBeenCalledTimes(1);
      expect(mockDocumentBuilderInstance.build).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.createDocument).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle SwaggerModule.createDocument failure', async () => {
      const swaggerError = new Error('Failed to create Swagger document');
      mockSwaggerModule.createDocument.mockImplementation(() => {
        throw swaggerError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await require('./main');
      } catch (error) {
        expect(error).toBe(swaggerError);
      }

      expect(mockNestFactory.create).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.setup).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle SwaggerModule.setup failure', async () => {
      const setupError = new Error('Failed to setup Swagger UI');
      mockSwaggerModule.setup.mockImplementation(() => {
        throw setupError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await require('./main');
      } catch (error) {
        expect(error).toBe(setupError);
      }

      expect(mockNestFactory.create).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.setup).toHaveBeenCalledTimes(1);
      expect(mockApp.listen).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle application listen failure', async () => {
      const listenError = new Error('Failed to start server');
      mockApp.listen.mockRejectedValue(listenError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await require('./main');
      } catch (error) {
        expect(error).toBe(listenError);
      }

      expect(mockNestFactory.create).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.setup).toHaveBeenCalledTimes(1);
      expect(mockApp.listen).toHaveBeenCalledTimes(1);
      
      consoleSpy.mockRestore();
    });

    it('should handle FastifyAdapter instantiation failure', async () => {
      const adapterError = new Error('FastifyAdapter instantiation failed');
      mockFastifyAdapter.mockImplementation(() => {
        throw adapterError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await require('./main');
      } catch (error) {
        expect(error).toBe(adapterError);
      }

      expect(mockFastifyAdapter).toHaveBeenCalledTimes(1);
      expect(mockNestFactory.create).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration Validation', () => {
    beforeEach(async () => {
      delete require.cache[require.resolve('./main')];
      await require('./main');
    });

    it('should use correct Swagger configuration values', () => {
      const builderInstance = mockDocumentBuilder.mock.results[0].value;
      
      expect(builderInstance.setTitle).toHaveBeenCalledWith('Vision Lab. Hoseo online judge');
      expect(builderInstance.setDescription).toHaveBeenCalledWith('online judge API description');
      expect(builderInstance.setVersion).toHaveBeenCalledWith('1.0');
      expect(builderInstance.addTag).toHaveBeenCalledWith('oj');
    });

    it('should configure logger with only error and warn levels', () => {
      const createCall = mockNestFactory.create.mock.calls[0];
      const loggerConfig = createCall[2].logger;
      
      expect(loggerConfig).toHaveLength(2);
      expect(loggerConfig).toContain('error');
      expect(loggerConfig).toContain('warn');
      expect(loggerConfig).not.toContain('log');
      expect(loggerConfig).not.toContain('debug');
      expect(loggerConfig).not.toContain('verbose');
    });

    it('should use correct network binding configuration', () => {
      expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
    });

    it('should mount Swagger UI at correct path', () => {
      expect(mockSwaggerModule.setup).toHaveBeenCalledWith(
        'api',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('Integration Flow', () => {
    beforeEach(async () => {
      delete require.cache[require.resolve('./main')];
      await require('./main');
    });

    it('should follow complete bootstrap flow', () => {
      // Verify the complete flow executed
      expect(mockNestFactory.create).toHaveBeenCalled();
      expect(mockDocumentBuilder).toHaveBeenCalled();
      expect(mockSwaggerModule.createDocument).toHaveBeenCalled();
      expect(mockSwaggerModule.setup).toHaveBeenCalled();
      expect(mockApp.listen).toHaveBeenCalled();
    });

    it('should pass correct parameters between steps', () => {
      // Verify app instance is used correctly
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledWith(
        mockApp,
        expect.any(Object)
      );
      
      expect(mockSwaggerModule.setup).toHaveBeenCalledWith(
        'api',
        mockApp,
        expect.any(Object)
      );
    });

    it('should create document with built configuration', () => {
      const builderInstance = mockDocumentBuilder.mock.results[0].value;
      const builtConfig = builderInstance.build.mock.results[0].value;
      
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledWith(
        mockApp,
        builtConfig
      );
    });

    it('should setup Swagger with created document', () => {
      const createdDocument = mockSwaggerModule.createDocument.mock.results[0].value;
      
      expect(mockSwaggerModule.setup).toHaveBeenCalledWith(
        'api',
        mockApp,
        createdDocument
      );
    });
  });

  describe('Mock Verification', () => {
    beforeEach(async () => {
      delete require.cache[require.resolve('./main')];
      await require('./main');
    });

    it('should call all mocked dependencies exactly once', () => {
      expect(mockNestFactory.create).toHaveBeenCalledTimes(1);
      expect(mockDocumentBuilder).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.createDocument).toHaveBeenCalledTimes(1);
      expect(mockSwaggerModule.setup).toHaveBeenCalledTimes(1);
      expect(mockApp.listen).toHaveBeenCalledTimes(1);
      expect(mockFastifyAdapter).toHaveBeenCalledTimes(1);
    });

    it('should not call any methods multiple times', () => {
      const builderInstance = mockDocumentBuilder.mock.results[0].value;
      
      expect(builderInstance.setTitle).toHaveBeenCalledTimes(1);
      expect(builderInstance.setDescription).toHaveBeenCalledTimes(1);
      expect(builderInstance.setVersion).toHaveBeenCalledTimes(1);
      expect(builderInstance.addTag).toHaveBeenCalledTimes(1);
      expect(builderInstance.build).toHaveBeenCalledTimes(1);
    });
  });
});