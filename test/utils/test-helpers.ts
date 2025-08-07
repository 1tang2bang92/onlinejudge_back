import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import * as jsonwebtoken from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import {
  mockUserFactory,
  mockTokenFactory,
  mockDtoFactory,
  mockEnvironment,
  resetAllFactoryCounters,
} from './mock-factories';

/**
 * Test utilities for common testing operations
 * Provides helpers for auth, database operations, and HTTP testing
 */

/**
 * Authentication Test Helpers
 */
export class AuthTestHelpers {
  /**
   * Generate a valid JWT token for testing
   */
  static generateValidToken(payload?: any): string {
    const defaultPayload = mockTokenFactory.createJwtPayload();
    const finalPayload = { ...defaultPayload, ...payload };
    
    return jsonwebtoken.sign(
      finalPayload,
      mockEnvironment.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Generate an expired JWT token for testing
   */
  static generateExpiredToken(payload?: any): string {
    const defaultPayload = mockTokenFactory.createJwtPayload({
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    });
    const finalPayload = { ...defaultPayload, ...payload };
    
    return jsonwebtoken.sign(
      finalPayload,
      mockEnvironment.JWT_SECRET
    );
  }

  /**
   * Generate an invalid JWT token (wrong secret)
   */
  static generateInvalidToken(payload?: any): string {
    const defaultPayload = mockTokenFactory.createJwtPayload();
    const finalPayload = { ...defaultPayload, ...payload };
    
    return jsonwebtoken.sign(
      finalPayload,
      'wrong-secret',
      { expiresIn: '1h' }
    );
  }

  /**
   * Hash a password for testing
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Create authorization header for HTTP requests
   */
  static createAuthHeader(token?: string): { authorization: string } {
    const authToken = token || this.generateValidToken();
    return { authorization: `Bearer ${authToken}` };
  }

  /**
   * Mock AuthRepository with common methods
   */
  static createMockAuthRepository() {
    return {
      findById: jest.fn(),
      checkExistingUser: jest.fn(),
      createUser: jest.fn(),
      deleteUser: jest.fn(),
      saveToken: jest.fn(),
      findToken: jest.fn(),
      deleteToken: jest.fn(),
    };
  }

  /**
   * Setup auth repository mocks for successful operations
   */
  static setupSuccessfulAuthMocks(mockRepository: any, user?: any) {
    const testUser = user || mockUserFactory.create();
    const testToken = mockTokenFactory.create();

    mockRepository.findById.mockResolvedValue(testUser);
    mockRepository.checkExistingUser.mockResolvedValue([]);
    mockRepository.createUser.mockResolvedValue(undefined);
    mockRepository.deleteUser.mockResolvedValue(undefined);
    mockRepository.saveToken.mockResolvedValue(undefined);
    mockRepository.findToken.mockResolvedValue(testToken);
    mockRepository.deleteToken.mockResolvedValue(undefined);

    return { testUser, testToken };
  }

  /**
   * Setup auth repository mocks for failure scenarios
   */
  static setupFailedAuthMocks(mockRepository: any, scenario: 'user-not-found' | 'duplicate-user' | 'token-not-found') {
    switch (scenario) {
      case 'user-not-found':
        mockRepository.findById.mockResolvedValue(null);
        break;
      case 'duplicate-user':
        mockRepository.checkExistingUser.mockResolvedValue(['id', 'nick_name']);
        break;
      case 'token-not-found':
        mockRepository.findToken.mockResolvedValue(null);
        break;
    }
  }
}

/**
 * Database Test Helpers
 */
export class DatabaseTestHelpers {
  /**
   * Create a mock Prisma client
   */
  static createMockPrismaClient() {
    return {
      user_info: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      login: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      course: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      problem_set: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      solution_history: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      answer_set: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      course_owner: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      whitelist_entries: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    } as unknown as PrismaClient;
  }

  /**
   * Setup successful database operations
   */
  static setupSuccessfulDbOperations(mockPrisma: any) {
    // User operations
    mockPrisma.user_info.findUnique.mockResolvedValue(mockUserFactory.create());
    mockPrisma.user_info.findMany.mockResolvedValue(mockUserFactory.createMany(3));
    mockPrisma.user_info.create.mockResolvedValue(mockUserFactory.create());
    mockPrisma.user_info.update.mockResolvedValue(mockUserFactory.create());
    mockPrisma.user_info.delete.mockResolvedValue(mockUserFactory.create());
    mockPrisma.user_info.count.mockResolvedValue(5);

    // Login operations
    mockPrisma.login.findFirst.mockResolvedValue(mockTokenFactory.create());
    mockPrisma.login.create.mockResolvedValue(mockTokenFactory.create());
    mockPrisma.login.delete.mockResolvedValue(mockTokenFactory.create());

    // Transaction support
    mockPrisma.$transaction.mockImplementation((callback: any) => callback(mockPrisma));
  }

  /**
   * Setup database operation failures
   */
  static setupFailedDbOperations(mockPrisma: any, errorMessage: string = 'Database error') {
    const error = new Error(errorMessage);
    
    Object.values(mockPrisma).forEach((model: any) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach((method: any) => {
          if (jest.isMockFunction(method)) {
            method.mockRejectedValue(error);
          }
        });
      }
    });
  }

  /**
   * Clear all database mocks
   */
  static clearAllDbMocks(mockPrisma: any) {
    Object.values(mockPrisma).forEach((model: any) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach((method: any) => {
          if (jest.isMockFunction(method)) {
            method.mockClear();
          }
        });
      }
    });
  }
}

/**
 * HTTP Test Helpers
 */
export class HttpTestHelpers {
  /**
   * Create a test app instance
   */
  static async createTestApp(moduleClass: any, providers: any[] = []): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [moduleClass],
      providers,
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  }

  /**
   * Create a test module with custom providers
   */
  static async createTestModule(imports: any[] = [], providers: any[] = []): Promise<TestingModule> {
    return Test.createTestingModule({
      imports,
      providers,
    }).compile();
  }

  /**
   * Make authenticated GET request
   */
  static async authenticatedGet(
    app: INestApplication,
    url: string,
    token?: string,
    expectedStatus: number = 200
  ) {
    const headers = AuthTestHelpers.createAuthHeader(token);
    return request(app.getHttpServer())
      .get(url)
      .set(headers)
      .expect(expectedStatus);
  }

  /**
   * Make authenticated POST request
   */
  static async authenticatedPost(
    app: INestApplication,
    url: string,
    data: any,
    token?: string,
    expectedStatus: number = 201
  ) {
    const headers = AuthTestHelpers.createAuthHeader(token);
    return request(app.getHttpServer())
      .post(url)
      .set(headers)
      .send(data)
      .expect(expectedStatus);
  }

  /**
   * Make authenticated PUT request
   */
  static async authenticatedPut(
    app: INestApplication,
    url: string,
    data: any,
    token?: string,
    expectedStatus: number = 200
  ) {
    const headers = AuthTestHelpers.createAuthHeader(token);
    return request(app.getHttpServer())
      .put(url)
      .set(headers)
      .send(data)
      .expect(expectedStatus);
  }

  /**
   * Make authenticated DELETE request
   */
  static async authenticatedDelete(
    app: INestApplication,
    url: string,
    token?: string,
    expectedStatus: number = 200
  ) {
    const headers = AuthTestHelpers.createAuthHeader(token);
    return request(app.getHttpServer())
      .delete(url)
      .set(headers)
      .expect(expectedStatus);
  }

  /**
   * Test authentication middleware
   */
  static async testAuthenticationRequired(app: INestApplication, url: string, method: 'get' | 'post' | 'put' | 'delete' = 'get') {
    // Test without token
    await request(app.getHttpServer())[method](url).expect(401);

    // Test with invalid token
    const invalidHeaders = { authorization: 'Bearer invalid-token' };
    await request(app.getHttpServer())[method](url).set(invalidHeaders).expect(401);

    // Test with expired token
    const expiredToken = AuthTestHelpers.generateExpiredToken();
    const expiredHeaders = { authorization: `Bearer ${expiredToken}` };
    await request(app.getHttpServer())[method](url).set(expiredHeaders).expect(401);
  }

  /**
   * Test authorization (role-based access)
   */
  static async testAuthorization(
    app: INestApplication,
    url: string,
    allowedRoles: string[],
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    data?: any
  ) {
    const roles = ['student', 'professor', 'admin'];
    
    for (const role of roles) {
      const token = AuthTestHelpers.generateValidToken({ role });
      const headers = { authorization: `Bearer ${token}` };
      
      const expectedStatus = allowedRoles.includes(role) ? 200 : 403;
      
      const req = request(app.getHttpServer())[method](url).set(headers);
      if (data && (method === 'post' || method === 'put')) {
        req.send(data);
      }
      await req.expect(expectedStatus);
    }
  }
}

/**
 * Common Test Utilities
 */
export class CommonTestHelpers {
  /**
   * Setup environment variables for testing
   */
  static setupTestEnvironment() {
    Object.entries(mockEnvironment).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  /**
   * Clean up environment variables after testing
   */
  static cleanupTestEnvironment() {
    Object.keys(mockEnvironment).forEach((key) => {
      delete process.env[key];
    });
  }

  /**
   * Wait for a specified time (useful for async operations)
   */
  static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate random string for testing
   */
  static generateRandomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Deep clone an object for testing
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Assert that an array contains specific items
   */
  static expectArrayToContain<T>(actual: T[], expected: Partial<T>[]): void {
    expected.forEach((expectedItem) => {
      const found = actual.some((actualItem) =>
        Object.entries(expectedItem).every(([key, value]) =>
          actualItem[key as keyof T] === value
        )
      );
      expect(found).toBe(true);
    });
  }

  /**
   * Reset all test data and counters
   */
  static resetTestData(): void {
    resetAllFactoryCounters();
    jest.clearAllMocks();
  }

  /**
   * Create a spy on console methods for testing
   */
  static spyOnConsole() {
    const consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {}),
    };

    return {
      ...consoleSpy,
      restore: () => {
        Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
      },
    };
  }
}

/**
 * Performance Test Helpers
 */
export class PerformanceTestHelpers {
  /**
   * Measure execution time of a function
   */
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Test that a function executes within a time limit
   */
  static async expectExecutionWithinTime<T>(fn: () => Promise<T>, maxMs: number): Promise<T> {
    const { result, duration } = await this.measureExecutionTime(fn);
    expect(duration).toBeLessThan(maxMs);
    return result;
  }

  /**
   * Run a function multiple times and get average execution time
   */
  static async getAverageExecutionTime<T>(fn: () => Promise<T>, iterations: number = 10): Promise<number> {
    const durations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureExecutionTime(fn);
      durations.push(duration);
    }
    
    return durations.reduce((sum, duration) => sum + duration, 0) / iterations;
  }
}

/**
 * Error Test Helpers
 */
export class ErrorTestHelpers {
  /**
   * Test that a function throws a specific error
   */
  static async expectAsyncError(fn: () => Promise<any>, expectedError: string | RegExp): Promise<void> {
    await expect(fn()).rejects.toThrow(expectedError);
  }

  /**
   * Test that a function throws any error
   */
  static async expectAsyncThrow(fn: () => Promise<any>): Promise<void> {
    await expect(fn()).rejects.toThrow();
  }

  /**
   * Create a mock that throws an error
   */
  static createThrowingMock(error: Error): jest.Mock {
    return jest.fn().mockRejectedValue(error);
  }

  /**
   * Create a mock that throws different errors on consecutive calls
   */
  static createSequentialThrowingMock(errors: Error[]): jest.Mock {
    const mock = jest.fn();
    errors.forEach((error, index) => {
      mock.mockRejectedValueOnce(error);
    });
    return mock;
  }
}