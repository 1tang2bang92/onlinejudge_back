import { permission_t_t, result_t_t, mode_t } from '@prisma/client';

/**
 * Mock factory for generating test data
 * Provides consistent mock data for users, tokens, and database responses
 */

// Counter for generating unique IDs
let userIdCounter = 1;
let courseIdCounter = 1;
let problemIdCounter = 1;
let solutionIdCounter = 1;

/**
 * User Info Mock Factory
 */
export const mockUserFactory = {
  /**
   * Create a basic user with default values
   */
  create: (overrides: Partial<any> = {}) => ({
    uid: userIdCounter++,
    id: `testuser${userIdCounter}`,
    password: '$2a$10$hashedPassword',
    permission_t: permission_t_t.student,
    student_id: 2024000 + userIdCounter,
    nick_name: `TestUser${userIdCounter}`,
    create_at: new Date('2024-01-01T00:00:00Z'),
    delete_at: null,
    ...overrides,
  }),

  /**
   * Create a student user
   */
  createStudent: (overrides: Partial<any> = {}) =>
    mockUserFactory.create({
      permission_t: permission_t_t.student,
      student_id: 2024000 + userIdCounter,
      ...overrides,
    }),

  /**
   * Create a professor user
   */
  createProfessor: (overrides: Partial<any> = {}) =>
    mockUserFactory.create({
      permission_t: permission_t_t.professor,
      student_id: null,
      ...overrides,
    }),

  /**
   * Create an admin user
   */
  createAdmin: (overrides: Partial<any> = {}) =>
    mockUserFactory.create({
      permission_t: permission_t_t.admin,
      student_id: null,
      ...overrides,
    }),

  /**
   * Create multiple users
   */
  createMany: (count: number, overrides: Partial<any> = {}) =>
    Array.from({ length: count }, () => mockUserFactory.create(overrides)),

  /**
   * Reset counter for consistent testing
   */
  resetCounter: () => {
    userIdCounter = 1;
  },
};

/**
 * Login/Token Mock Factory
 */
export const mockTokenFactory = {
  /**
   * Create a login token record
   */
  create: (overrides: Partial<any> = {}) => ({
    uid: Math.floor(Math.random() * 1000),
    user_id: `testuser${userIdCounter}`,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0dXNlcjEiLCJuaWNrX25hbWUiOiJUZXN0VXNlcjEiLCJzdHVkZW50X2lkIjoyMDI0MDAxLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQwOTk4ODAwfQ.test-signature',
    create_at: new Date(),
    expire_at: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    ...overrides,
  }),

  /**
   * Create an expired token
   */
  createExpired: (overrides: Partial<any> = {}) =>
    mockTokenFactory.create({
      expire_at: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      ...overrides,
    }),

  /**
   * Create a valid JWT payload
   */
  createJwtPayload: (overrides: Partial<any> = {}) => ({
    userId: 'testuser1',
    nick_name: 'TestUser1',
    student_id: 2024001,
    role: permission_t_t.student,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  }),
};

/**
 * Course Mock Factory
 */
export const mockCourseFactory = {
  /**
   * Create a basic course
   */
  create: (overrides: Partial<any> = {}) => ({
    uid: courseIdCounter++,
    board: 1,
    open: new Date('2024-01-01T00:00:00Z'),
    close: new Date('2024-12-31T23:59:59Z'),
    create_at: new Date('2024-01-01T00:00:00Z'),
    delete_at: null,
    ...overrides,
  }),

  /**
   * Create an open course
   */
  createOpen: (overrides: Partial<any> = {}) =>
    mockCourseFactory.create({
      open: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      close: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ...overrides,
    }),

  /**
   * Create a closed course
   */
  createClosed: (overrides: Partial<any> = {}) =>
    mockCourseFactory.create({
      open: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      close: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      ...overrides,
    }),

  /**
   * Reset counter
   */
  resetCounter: () => {
    courseIdCounter = 1;
  },
};

/**
 * Problem Set Mock Factory
 */
export const mockProblemFactory = {
  /**
   * Create a basic problem
   */
  create: (overrides: Partial<any> = {}) => ({
    uid: problemIdCounter++,
    cuid: 1,
    title: `Test Problem ${problemIdCounter}`,
    body: {
      description: 'This is a test problem description',
      input: 'Input description',
      output: 'Output description',
      examples: [
        { input: '1 2', output: '3' },
        { input: '5 10', output: '15' },
      ],
    },
    create_at: new Date('2024-01-01T00:00:00Z'),
    delete_at: null,
    ...overrides,
  }),

  /**
   * Create multiple problems
   */
  createMany: (count: number, courseId: number = 1, overrides: Partial<any> = {}) =>
    Array.from({ length: count }, () =>
      mockProblemFactory.create({ cuid: courseId, ...overrides }),
    ),

  /**
   * Reset counter
   */
  resetCounter: () => {
    problemIdCounter = 1;
  },
};

/**
 * Answer Set Mock Factory
 */
export const mockAnswerFactory = {
  /**
   * Create a test case answer
   */
  create: (overrides: Partial<any> = {}) => ({
    uid: Math.floor(Math.random() * 1000),
    puid: 1,
    mode: mode_t.test_case,
    input: '1 2',
    output: '3',
    answer_code: null,
    ...overrides,
  }),

  /**
   * Create a special judge answer
   */
  createSpecial: (overrides: Partial<any> = {}) =>
    mockAnswerFactory.create({
      mode: mode_t.special,
      answer_code: 'special_judge_code',
      ...overrides,
    }),

  /**
   * Create multiple test cases for a problem
   */
  createTestCases: (problemId: number, count: number = 3) =>
    Array.from({ length: count }, (_, i) =>
      mockAnswerFactory.create({
        puid: problemId,
        input: `test_input_${i + 1}`,
        output: `test_output_${i + 1}`,
      }),
    ),
};

/**
 * Solution History Mock Factory
 */
export const mockSolutionFactory = {
  /**
   * Create a solution history entry
   */
  create: (overrides: Partial<any> = {}) => ({
    uid: solutionIdCounter++,
    puid: 1,
    source: 'console.log("Hello World");',
    create_at: new Date(),
    runtime: 100,
    memory: 1024,
    result_t: result_t_t.correct,
    user_id: 1,
    ...overrides,
  }),

  /**
   * Create a correct solution
   */
  createCorrect: (overrides: Partial<any> = {}) =>
    mockSolutionFactory.create({
      result_t: result_t_t.correct,
      runtime: 50,
      memory: 512,
      ...overrides,
    }),

  /**
   * Create a failed solution
   */
  createFailed: (overrides: Partial<any> = {}) =>
    mockSolutionFactory.create({
      result_t: result_t_t.fail,
      runtime: null,
      memory: null,
      ...overrides,
    }),

  /**
   * Create a compile error solution
   */
  createCompileError: (overrides: Partial<any> = {}) =>
    mockSolutionFactory.create({
      result_t: result_t_t.compile_error,
      runtime: null,
      memory: null,
      source: 'invalid syntax code',
      ...overrides,
    }),

  /**
   * Create a runtime error solution
   */
  createRuntimeError: (overrides: Partial<any> = {}) =>
    mockSolutionFactory.create({
      result_t: result_t_t.runtime_error,
      runtime: null,
      memory: null,
      ...overrides,
    }),

  /**
   * Reset counter
   */
  resetCounter: () => {
    solutionIdCounter = 1;
  },
};

/**
 * Database Mock Responses
 */
export const mockDatabaseResponses = {
  /**
   * Mock Prisma client responses
   */
  prisma: {
    /**
     * Mock successful database operations
     */
    success: {
      findUnique: (data: any) => Promise.resolve(data),
      findMany: (data: any[]) => Promise.resolve(data),
      create: (data: any) => Promise.resolve(data),
      update: (data: any) => Promise.resolve(data),
      delete: (data: any) => Promise.resolve(data),
      count: (count: number = 1) => Promise.resolve(count),
    },

    /**
     * Mock failed database operations
     */
    error: {
      findUnique: () => Promise.reject(new Error('Database connection error')),
      findMany: () => Promise.reject(new Error('Database connection error')),
      create: () => Promise.reject(new Error('Database connection error')),
      update: () => Promise.reject(new Error('Database connection error')),
      delete: () => Promise.reject(new Error('Database connection error')),
      count: () => Promise.reject(new Error('Database connection error')),
    },

    /**
     * Mock empty responses
     */
    empty: {
      findUnique: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
      count: () => Promise.resolve(0),
    },
  },

  /**
   * Mock authentication repository responses
   */
  auth: {
    findById: (user?: any) => Promise.resolve(user || mockUserFactory.create()),
    checkExistingUser: (duplicates: string[] = []) => Promise.resolve(duplicates),
    createUser: () => Promise.resolve(undefined),
    deleteUser: () => Promise.resolve(undefined),
    saveToken: () => Promise.resolve(undefined),
    findToken: (token?: any) => Promise.resolve(token || mockTokenFactory.create()),
    deleteToken: () => Promise.resolve(undefined),
  },
};

/**
 * DTOs and Request Mock Factory
 */
export const mockDtoFactory = {
  /**
   * Create login DTO
   */
  createLoginDto: (overrides: Partial<any> = {}) => ({
    role: 'student',
    id: 'testuser1',
    password: 'testpassword',
    ...overrides,
  }),

  /**
   * Create register DTO
   */
  createRegisterDto: (overrides: Partial<any> = {}) => ({
    id: 'testuser1',
    password: 'testpassword',
    nick_name: 'TestUser1',
    student_id: 2024001,
    ...overrides,
  }),

  /**
   * Create HTTP request mock
   */
  createHttpRequest: (overrides: Partial<any> = {}) => ({
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      'content-type': 'application/json',
    },
    body: {},
    params: {},
    query: {},
    ...overrides,
  }),

  /**
   * Create HTTP response mock
   */
  createHttpResponse: () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
  }),
};

/**
 * Reset all factory counters
 * Useful for ensuring consistent test data between test suites
 */
export const resetAllFactoryCounters = () => {
  mockUserFactory.resetCounter();
  mockCourseFactory.resetCounter();
  mockProblemFactory.resetCounter();
  mockSolutionFactory.resetCounter();
};

/**
 * Environment variable mocks
 */
export const mockEnvironment = {
  JWT_SECRET: 'test-jwt-secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  NODE_ENV: 'test',
};