/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * UsersService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let em: Partial<EntityManager>;

  const mockEntity = {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    userRoles: { getItems: () => [] },
  };

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
      count: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      getRepository: jest.fn(),
      populate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: EntityManager, useValue: em }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      (em.findOne as jest.Mock).mockResolvedValue({ ...mockEntity, deletedAt: null });
      expect(await service.softDelete('1')).toBe(true);
      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('bulk', () => {
    it('should return empty result for empty ids', async () => {
      const result = await service.bulk('delete', []);
      expect(result.affected).toBe(0);
    });
  });
});
