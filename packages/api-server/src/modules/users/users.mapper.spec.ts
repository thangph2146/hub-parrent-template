/**
 * Users Mapper Tests
 */
import {
  mapUserToRowDto,
  mapUserRoles,
  mapUserToDevLoginOption,
  buildSearchPattern,
  buildSearchConditions,
} from './users.mapper';

describe('users.mapper', () => {
  describe('mapUserToRowDto', () => {
    it('should map user entity to UserRowDto', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
        avatar: 'avatar.png',
        emailVerified: new Date('2024-01-01'),
        phone: '123456789',
        address: 'Test Address',
        citizenId: '123456789',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
        userRoles: [
          {
            role: { id: 1, name: 'admin', displayName: 'Admin' },
          },
        ],
      };

      const result = mapUserToRowDto(user);

      expect(result.id).toBe(123);
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.bio).toBe('Test bio');
      expect(result.avatar).toBe('avatar.png');
      expect(result.isActive).toBe(true);
      expect(result.roles).toHaveLength(1);
      expect(result.roles[0].name).toBe('admin');
    });

    it('should handle null/undefined fields', () => {
      const user = {
        id: 1,
        email: null,
        name: null,
        bio: null,
        avatar: null,
        emailVerified: null,
        phone: null,
        address: null,
        citizenId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        userRoles: [],
      };

      const result = mapUserToRowDto(user);

      expect(result.email).toBe('');
      expect(result.name).toBeNull();
      expect(result.bio).toBeNull();
      expect(result.roles).toHaveLength(0);
    });

    it('should handle string dates', () => {
      const user = {
        id: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        deletedAt: undefined,
        userRoles: [],
        isActive: true,
      };

      const result = mapUserToRowDto(user);

      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).toBe('2024-01-02T00:00:00Z');
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('mapUserRoles', () => {
    it('should map user roles array', () => {
      const userRoles = [
        { role: { id: 1, name: 'admin', displayName: 'Admin' } },
        { role: { id: 2, name: 'user', displayName: 'User' } },
      ];

      const result = mapUserRoles(userRoles);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'admin', displayName: 'Admin' });
      expect(result[1]).toEqual({ id: 2, name: 'user', displayName: 'User' });
    });

    it('should return empty array for undefined', () => {
      expect(mapUserRoles(undefined)).toEqual([]);
    });

    it('should return empty array for empty array', () => {
      expect(mapUserRoles([])).toEqual([]);
    });
  });

  describe('mapUserToDevLoginOption', () => {
    it('should map user to dev login option', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        userRoles: [
          { role: { id: 2, name: 'admin', displayName: 'Administrator' } },
        ],
      };

      const result = mapUserToDevLoginOption(user);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        roleNames: ['admin'],
        roleLabels: ['Administrator'],
        roles: [{ id: 2, name: 'admin', displayName: 'Administrator' }],
        description: 'Đang hoạt động | Administrator',
      });
    });

    it('should return null for user without email', () => {
      const user = {
        id: 1,
        email: '',
        name: 'Test User',
        userRoles: [],
      };

      expect(mapUserToDevLoginOption(user)).toBeNull();
    });

    it('should trim and lowercase email', () => {
      const user = {
        id: 1,
        email: '  TEST@EXAMPLE.COM  ',
        name: null,
        userRoles: [],
      };

      const result = mapUserToDevLoginOption(user);

      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('buildSearchPattern', () => {
    it('should build LIKE pattern with %', () => {
      expect(buildSearchPattern('test')).toBe('%test%');
    });

    it('should trim whitespace', () => {
      expect(buildSearchPattern('  test  ')).toBe('%test%');
    });
  });

  describe('buildSearchConditions', () => {
    it('should build OR conditions for multiple fields', () => {
      const conditions = buildSearchConditions('test', ['email', 'name']);

      expect(conditions).toHaveLength(2);
      expect(conditions[0]).toEqual({ email: { $like: '%test%' } });
      expect(conditions[1]).toEqual({ name: { $like: '%test%' } });
    });
  });
});
