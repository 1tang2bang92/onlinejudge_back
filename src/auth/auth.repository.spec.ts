import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../app.service';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let prismaService: PrismaService;

  const mockUser = {
    uid: 1,
    id: 'testuser',
    password: 'hashedpassword',
    nick_name: 'Test User',
    student_id: 12345,
    permission_t: 'student',
    create_at: new Date(),
    delete_at: null,
  };

  const mockPrismaService = {
    user_info: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    login: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      mockPrismaService.user_info.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findById('testuser');

      expect(mockPrismaService.user_info.findFirst).toHaveBeenCalledWith({
        where: { id: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user_info.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('checkExistingUser', () => {
    it('should return empty array if no duplicates', async () => {
      mockPrismaService.user_info.findFirst.mockResolvedValue(null);

      const result = await repository.checkExistingUser('newuser', 'New User', 54321);

      expect(mockPrismaService.user_info.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { id: 'newuser' },
            { nick_name: 'New User' },
            { student_id: 54321 },
          ],
        },
      });
      expect(result).toEqual([]);
    });

    it('should return duplicated id', async () => {
      const existingUser = { ...mockUser, id: 'newuser' };
      mockPrismaService.user_info.findFirst.mockResolvedValue(existingUser);

      const result = await repository.checkExistingUser('newuser', 'Different Name', 99999);

      expect(result).toEqual(['id']);
    });

    it('should return duplicated nickname', async () => {
      const existingUser = { ...mockUser, nick_name: 'New User' };
      mockPrismaService.user_info.findFirst.mockResolvedValue(existingUser);

      const result = await repository.checkExistingUser('differentuser', 'New User', 99999);

      expect(result).toEqual(['nickname']);
    });

    it('should return duplicated student_id', async () => {
      const existingUser = { ...mockUser, student_id: 54321 };
      mockPrismaService.user_info.findFirst.mockResolvedValue(existingUser);

      const result = await repository.checkExistingUser('differentuser', 'Different Name', 54321);

      expect(result).toEqual(['studentId']);
    });

    it('should return multiple duplicates', async () => {
      const existingUser = { ...mockUser, id: 'newuser', nick_name: 'New User', student_id: 54321 };
      mockPrismaService.user_info.findFirst.mockResolvedValue(existingUser);

      const result = await repository.checkExistingUser('newuser', 'New User', 54321);

      expect(result).toEqual(['id', 'nickname', 'studentId']);
    });
  });

  describe('createUser', () => {
    it('should create new user', async () => {
      mockPrismaService.user_info.create.mockResolvedValue(mockUser);

      await repository.createUser('newuser', 'hashedpassword', 'New User', 54321);

      expect(mockPrismaService.user_info.create).toHaveBeenCalledWith({
        data: {
          id: 'newuser',
          password: 'hashedpassword',
          nick_name: 'New User',
          student_id: 54321,
        },
      });
    });

    it('should handle creation errors', async () => {
      const createError = new Error('User creation failed');
      mockPrismaService.user_info.create.mockRejectedValue(createError);

      await expect(
        repository.createUser('newuser', 'hashedpassword', 'New User', 54321)
      ).rejects.toThrow('User creation failed');
    });
  });

  describe('saveToken', () => {
    it('should save token', async () => {
      const mockToken = 'jwt.token.here';
      const expectedExpiry = new Date(Date.now() + 1000 * 60 * 60);
      
      mockPrismaService.login.create.mockResolvedValue({});

      await repository.saveToken('testuser', mockToken);

      expect(mockPrismaService.login.create).toHaveBeenCalledWith({
        data: {
          user_id: 'testuser',
          token: mockToken,
          expire_at: expect.any(Date),
        },
      });

      const callArgs = mockPrismaService.login.create.mock.calls[0][0];
      const actualExpiry = callArgs.data.expire_at;
      const timeDiff = Math.abs(actualExpiry.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should handle token save errors', async () => {
      const saveError = new Error('Token save failed');
      mockPrismaService.login.create.mockRejectedValue(saveError);

      await expect(repository.saveToken('testuser', 'token')).rejects.toThrow('Token save failed');
    });
  });

  describe('deleteToken', () => {
    it('should delete token', async () => {
      mockPrismaService.login.deleteMany.mockResolvedValue({ count: 1 });

      await repository.deleteToken('testuser', 'token');

      expect(mockPrismaService.login.deleteMany).toHaveBeenCalledWith({
        where: {
          AND: ['testuser', 'token'],
        },
      });
    });

    it('should handle delete errors', async () => {
      const deleteError = new Error('Token delete failed');
      mockPrismaService.login.deleteMany.mockRejectedValue(deleteError);

      await expect(repository.deleteToken('testuser', 'token')).rejects.toThrow('Token delete failed');
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      mockPrismaService.user_info.updateMany.mockResolvedValue({ count: 1 });

      await repository.deleteUser('testuser');

      expect(mockPrismaService.user_info.updateMany).toHaveBeenCalledWith({
        where: { id: 'testuser' },
        data: { delete_at: expect.any(Date) },
      });
    });

    it('should handle user deletion errors', async () => {
      const deleteError = new Error('User deletion failed');
      mockPrismaService.user_info.updateMany.mockRejectedValue(deleteError);

      await expect(repository.deleteUser('testuser')).rejects.toThrow('User deletion failed');
    });
  });

  describe('findToken', () => {
    const mockTokenRecord = {
      uid: 1,
      user_id: 'testuser',
      token: 'jwt.token.here',
      create_at: new Date(),
      expire_at: new Date(Date.now() + 3600000),
    };

    it('should find valid token', async () => {
      mockPrismaService.login.findFirst.mockResolvedValue(mockTokenRecord);

      const result = await repository.findToken('testuser', 'jwt.token.here');

      expect(mockPrismaService.login.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 'testuser',
          AND: {
            expire_at: {
              gte: expect.any(Date),
            },
            token: 'jwt.token.here',
          },
        },
        orderBy: {
          create_at: 'desc',
        },
      });
      expect(result).toEqual(mockTokenRecord);
    });

    it('should find refresh token with different criteria', async () => {
      mockPrismaService.login.findFirst.mockResolvedValue(mockTokenRecord);

      const result = await repository.findToken('testuser', 'refresh.token.here', true);

      expect(mockPrismaService.login.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 'testuser',
          AND: {
            expire_at: {
              gte: expect.any(Date),
            },
          },
        },
        orderBy: {
          create_at: 'desc',
        },
      });
      expect(result).toEqual(mockTokenRecord);
    });

    it('should return null if token not found', async () => {
      mockPrismaService.login.findFirst.mockResolvedValue(null);

      const result = await repository.findToken('testuser', 'nonexistent.token');

      expect(result).toBeNull();
    });

    it('should handle token search errors', async () => {
      const searchError = new Error('Token search failed');
      mockPrismaService.login.findFirst.mockRejectedValue(searchError);

      await expect(
        repository.findToken('testuser', 'token')
      ).rejects.toThrow('Token search failed');
    });
  });
});