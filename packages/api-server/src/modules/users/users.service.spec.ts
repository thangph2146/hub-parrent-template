/**
 * BaseUsersService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { ForbiddenException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { BaseUsersService } from './users.service';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('BaseUsersService', () => {
  let service: BaseUsersService;
  let em: Partial<EntityManager>;

  // Mock entities
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    bio: null,
    avatar: null,
    emailVerified: null,
    phone: null,
    address: null,
    citizenId: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    password: 'hashed-password',
    userRoles: [],
  };

  const mockRole = {
    id: 1,
    name: 'admin',
    displayName: 'Admin',
    isActive: true,
    deletedAt: null,
  };

  const mockUserRole = {
    id: 1,
    user: mockUser,
    role: mockRole,
  };

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      getRepository: jest.fn(),
    };

    // Create a concrete implementation of BaseUsersService for testing
    class TestUsersService extends BaseUsersService {
      protected getEm(): EntityManager {
        return em as EntityManager;
      }
      protected getUserEntity(): unknown {
        return mockUser.constructor;
      }
      protected getRoleEntity(): unknown {
        return mockRole.constructor;
      }
      protected getUserRoleEntity(): unknown {
        return mockUserRole.constructor;
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [TestUsersService],
    }).compile();

    service = module.get(TestUsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated users with roles', async () => {
      const userWithRoles = { ...mockUser, userRoles: [mockUserRole] };
      (em.find as jest.Mock).mockResolvedValueOnce([userWithRoles]);
      (em.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('test@example.com');
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should apply search filter', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, search: 'test' });

      expect(em.find).toHaveBeenCalled();
    });

    it('should filter by deleted status', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, status: 'deleted' });

      expect(em.find).toHaveBeenCalled();
    });

    it('should enforce max limit', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({ page: 1, limit: 5000 });

      const findCall = (em.find as jest.Mock).mock.calls[0];
      expect(findCall[2].limit).toBeLessThanOrEqual(1000);
    });
  });

  describe('getById', () => {
    it('should return user with roles', async () => {
      const userWithRoles = { ...mockUser, userRoles: [mockUserRole] };
      (em.findOne as jest.Mock).mockResolvedValue(userWithRoles);

      const result = await service.getById('1');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const createdUser = {
        ...mockUser,
        id: 2,
        email: 'new@example.com',
      };

      (em.persist as jest.Mock).mockImplementation((entity) => {
        if (entity && !entity.id) {
          (entity as Record<string, unknown>).id = 2;
        }
        return Promise.resolve(undefined);
      });
      (em.flush as jest.Mock).mockResolvedValue(undefined);
      // 1: Setting lookup (null), 2: refetch created user with roles
      (em.findOne as jest.Mock).mockImplementation((_entity: unknown, filter: unknown) => {
        if (filter && typeof filter === 'object' && 'id' in filter) {
          return Promise.resolve({ ...createdUser, userRoles: [] });
        }
        return Promise.resolve(null);
      });

      const result = await service.create({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
      expect(hash).toHaveBeenCalledWith('password123', 10);
      expect(result.email).toBe('new@example.com');
    });

    it('should create user with specified roles', async () => {
      const createdUser = {
        ...mockUser,
        id: 2,
        email: 'new@example.com',
      };

      (em.persist as jest.Mock).mockImplementation((entity) => {
        if (entity && !entity.id) {
          (entity as Record<string, unknown>).id = 2;
        }
        return Promise.resolve(undefined);
      });
      (em.flush as jest.Mock).mockResolvedValue(undefined);
      (em.findOne as jest.Mock).mockImplementation((_entity: unknown, filter: unknown) => {
        if (filter && typeof filter === 'object' && 'id' in filter) {
          return Promise.resolve({ ...createdUser, userRoles: [mockUserRole] });
        }
        return Promise.resolve(null);
      });

      const result = await service.create({
        email: 'new@example.com',
        password: 'password123',
        roleIds: ['1'],
      });

      expect(em.persist).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const existingUser = { ...mockUser };
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce({
          ...existingUser,
          email: 'updated@example.com',
          userRoles: [mockUserRole],
        });

      const result = await service.update('1', {
        email: 'updated@example.com',
      }, 'other@email.com');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('updated@example.com');
    });

    it('should return null when user not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.update('nonexistent', {
        email: 'new@test.com',
      });

      expect(result).toBeNull();
    });

    it('should throw ForbiddenException for protected admin', async () => {
      const adminUser = { ...mockUser, email: 'admin@localhost' };
      (em.findOne as jest.Mock).mockResolvedValue(adminUser);

      await expect(
        service.update('1', { email: 'hack@example.com' }, 'attacker@email.com'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should hash password when provided', async () => {
      const existingUser = { ...mockUser };
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce({
          ...existingUser,
          userRoles: [mockUserRole],
        });

      await service.update('1', { password: 'newpassword' }, 'test@example.com');

      expect(hash).toHaveBeenCalledWith('newpassword', 10);
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      const user = { ...mockUser, deletedAt: null };
      (em.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.softDelete('1');

      expect(result).toBe(true);
      expect(user.deletedAt).not.toBeNull();
    });

    it('should return false when user not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.softDelete('nonexistent');

      expect(result).toBe(false);
    });

    it('should return false when user already deleted', async () => {
      const user = { ...mockUser, deletedAt: new Date() };
      (em.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.softDelete('1');

      expect(result).toBe(false);
    });

    it('should throw ForbiddenException for protected admin', async () => {
      const adminUser = { ...mockUser, email: 'admin@localhost' };
      (em.findOne as jest.Mock).mockResolvedValue(adminUser);

      await expect(service.softDelete('1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('restore', () => {
    it('should restore deleted user', async () => {
      const user = { ...mockUser, deletedAt: new Date() };
      (em.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.restore('1');

      expect(result).toBe(true);
      expect(user.deletedAt).toBeNull();
    });

    it('should return false when user not deleted', async () => {
      const user = { ...mockUser, deletedAt: null };
      (em.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.restore('1');

      expect(result).toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete user', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.hardDelete('1');

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
    });

    it('should return false when user not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.hardDelete('nonexistent');

      expect(result).toBe(false);
    });

    it('should throw ForbiddenException for protected admin', async () => {
      const adminUser = { ...mockUser, email: 'admin@localhost' };
      (em.findOne as jest.Mock).mockResolvedValue(adminUser);

      await expect(service.hardDelete('1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('bulk', () => {
    it('should bulk delete users', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockUser]);
      (em.nativeUpdate as jest.Mock).mockResolvedValue(1);

      const result = await service.bulk('delete', ['1']);

      expect(result.affected).toBe(1);
      expect(result.message).toContain('1 người dùng');
    });

    it('should bulk restore users', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(2);

      const result = await service.bulk('restore', ['1', '2']);

      expect(result.affected).toBe(2);
      expect(result.message).toContain('2 người dùng');
    });

    it('should bulk activate users', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(2);

      const result = await service.bulk('active', ['1', '2']);

      expect(result.affected).toBe(2);
      expect(result.message).toContain('2 người dùng');
    });

    it('should bulk deactivate users excluding super_admin', async () => {
      const superAdminUserRole = {
        user: { id: 2 },
        role: { name: 'super_admin' },
      };
      (em.find as jest.Mock).mockResolvedValue([superAdminUserRole]);
      (em.nativeUpdate as jest.Mock).mockResolvedValue(1);

      const result = await service.bulk('unactive', ['1', '2']);

      expect(result.affected).toBe(1);
    });

    it('should return 0 when ids are empty', async () => {
      const result = await service.bulk('delete', []);

      expect(result.affected).toBe(0);
      expect(result.message).toContain('Không có bản ghi');
    });

    it('should skip protected admin accounts in bulk delete', async () => {
      const adminUser = { ...mockUser, email: 'admin@localhost' };
      (em.find as jest.Mock).mockResolvedValue([adminUser]);

      const result = await service.bulk('delete', ['1']);

      expect(result.affected).toBe(0);
      expect(result.message).toContain('bỏ qua');
    });
  });

  describe('getOptions', () => {
    it('should return user options', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([
        { id: 1, email: 'test@example.com', name: 'Test User' },
      ]);

      const result = await service.getOptions('email', 'test', 10);

      expect(result).toHaveLength(1);
    });
  });

  describe('listDevelopmentLoginOptions', () => {
    it('should return development login options', async () => {
      const userWithRoles = {
        ...mockUser,
        userRoles: [mockUserRole],
      };
      (em.find as jest.Mock).mockResolvedValue([userWithRoles]);

      const result = await service.listDevelopmentLoginOptions();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('test@example.com');
      expect(result[0].roleNames).toContain('admin');
    });

    it('should filter out users without email', async () => {
      const userWithoutEmail = { ...mockUser, email: '', userRoles: [] };
      (em.find as jest.Mock).mockResolvedValue([userWithoutEmail]);

      const result = await service.listDevelopmentLoginOptions();

      expect(result).toHaveLength(0);
    });

    it('should filter by role', async () => {
      const userWithRoles = {
        ...mockUser,
        userRoles: [mockUserRole],
      };
      (em.find as jest.Mock).mockResolvedValue([userWithRoles]);

      const result = await service.listDevelopmentLoginOptions({ role: 'admin' });

      expect(result).toHaveLength(1);
    });

    it('should filter by search term', async () => {
      const userWithRoles = {
        ...mockUser,
        userRoles: [mockUserRole],
      };
      (em.find as jest.Mock).mockResolvedValue([userWithRoles]);

      const result = await service.listDevelopmentLoginOptions({ search: 'test' });

      expect(result).toHaveLength(1);
    });
  });

  describe('resolveActorEmail', () => {
    it('should return user email', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.resolveActorEmail('1');

      expect(result).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.resolveActorEmail('nonexistent');

      expect(result).toBeNull();
    });
  });
});
