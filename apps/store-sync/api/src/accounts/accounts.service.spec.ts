/**
 * AccountsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let em: Partial<EntityManager>;

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    avatar: null,
    bio: null,
    phone: null,
    address: null,
    citizenId: null,
    emailVerified: null,
    isActive: true,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    userRoles: { getItems: () => [] },
  };

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      flush: jest.fn().mockResolvedValue(undefined),
      persist: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile when user exists', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockUser);
      const profile = await service.getProfile('1');
      expect(profile?.email).toBe('user@example.com');
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);
      expect(await service.getProfile('999')).toBeNull();
    });
  });
});
