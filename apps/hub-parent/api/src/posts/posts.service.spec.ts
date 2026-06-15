/**
 * PostsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  let service: PostsService;
  let em: Partial<EntityManager>;

  const mockEntity = {
    id: 1,
    categories: [],
    tags: [],
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn(),
      nativeUpdate: jest.fn(),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: EntityManager, useValue: em }],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.find as jest.Mock)
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([mockEntity]);
      (em.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockEntity);
      expect(await service.getById('1')).not.toBeNull();
    });
  });
});
