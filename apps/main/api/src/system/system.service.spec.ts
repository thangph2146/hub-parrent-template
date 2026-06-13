/**
 * SystemService — binding @workspace/api-server (main API).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { SystemService } from './system.service';

describe('SystemService', () => {
  let service: SystemService;
  let em: Partial<EntityManager>;

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
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn(),
      getMetadata: jest.fn().mockReturnValue({
        getAll: jest.fn().mockReturnValue([]),
        find: jest.fn().mockReturnValue(null),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemService,
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<SystemService>(SystemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getModels trả danh sách model export từ ormEntities', () => {
    const models = service.getModels();
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
    const names = models.map((entry) => entry.modelName);
    expect(names).toContain('user');
    expect(names).toContain('post');
  });

  it('getImportConfig trả modelOrder và bundles', () => {
    const config = service.getImportConfig();
    expect(Array.isArray(config.modelOrder)).toBe(true);
    expect(typeof config.bundles).toBe('object');
    expect(config.bundles.user).toEqual(['userRole']);
    expect(typeof config.rowChunkSize).toBe('number');
  });
});
