/**
 * ProductsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, LockMode } from '@mikro-orm/core';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let em: Partial<EntityManager>;

  const mockProduct = {
    id: 1,
    sku: 'SKU-001',
    name: 'Test Product',
    description: null,
    category: 'general',
    brand: null,
    origin: null,
    basePrice: 100,
    wholesalePrice: 80,
    retailPrice: 120,
    stock: 10,
    unit: 'cai',
    unitTypes: null,
    images: null,
    coupons: null,
    fulfillmentNote: null,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn().mockImplementation((_Entity, data) => ({ ...data, id: 1 })),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.findAndCount as jest.Mock).mockResolvedValue([[mockProduct], 1]);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].sku).toBe('SKU-001');
      expect(result.pagination.total).toBe(1);
    });

    it('should apply search query', async () => {
      (em.findAndCount as jest.Mock).mockResolvedValue([[], 0]);

      await service.list({ page: 1, limit: 10, q: 'test' });

      expect(em.findAndCount).toHaveBeenCalled();
    });
  });

  describe('listPublic', () => {
    it('should exclude trash', async () => {
      (em.findAndCount as jest.Mock).mockResolvedValue([[], 0]);

      await service.listPublic({ page: 1, limit: 10 });

      expect(em.findAndCount).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return product', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.getById(1);

      expect(result?.name).toBe('Test Product');
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      expect(await service.getById(999)).toBeNull();
    });
  });

  describe('getBySku', () => {
    it('should find by sku', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.getBySku('SKU-001');

      expect(result?.sku).toBe('SKU-001');
    });
  });

  describe('create', () => {
    it('should create product', async () => {
      const result = await service.create({
        sku: 'NEW-1',
        name: 'New Product',
        retailPrice: 50,
      });

      expect(em.persistAndFlush).toHaveBeenCalled();
      expect(result.name).toBe('New Product');
    });
  });

  describe('softDelete', () => {
    it('should soft delete product', async () => {
      const row = { ...mockProduct };
      (em.findOne as jest.Mock).mockResolvedValue(row);

      const result = await service.softDelete(1);

      expect(result).toBe(true);
      expect(row.deletedAt).not.toBeNull();
      expect(row.isActive).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore deleted product', async () => {
      const row = { ...mockProduct, deletedAt: new Date(), isActive: false };
      (em.findOne as jest.Mock).mockResolvedValue(row);

      const result = await service.restore(1);

      expect(result).not.toBeNull();
      expect(row.deletedAt).toBeNull();
      expect(row.isActive).toBe(true);
    });
  });

  describe('findActiveByIdsForUpdate', () => {
    it('should load products with lock', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockProduct);

      const rows = await service.findActiveByIdsForUpdate(em as EntityManager, [1]);

      expect(rows).toHaveLength(1);
      expect(em.findOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ lockMode: LockMode.PESSIMISTIC_WRITE }),
      );
    });
  });
});
