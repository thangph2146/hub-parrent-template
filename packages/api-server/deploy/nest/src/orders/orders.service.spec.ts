/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * OrdersService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { UploadsService } from '../uploads/uploads.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let em: Partial<EntityManager>;

  const mockOrder = {
    id: 1,
    orderNumber: 'ORD-20260101-0001',
    customer: null,
    assignedShipper: null,
    customerName: 'Nguyễn Văn A',
    customerEmail: 'test@hub.edu.vn',
    customerPhone: '0123456789',
    shippingAddress: 'TP.HCM',
    items: [],
    gifts: [],
    subtotal: 100000,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 100000,
    status: 'pending',
    couponCode: null,
    notes: null,
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    isPaid: false,
    shippedBy: null,
    shippedAt: null,
    deliveredBy: null,
    deliveredAt: null,
    cancelledAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  const productsService = {
    findActiveByIds: jest.fn(),
    findActiveByIdsForUpdate: jest.fn(),
    decrementStock: jest.fn(),
  };

  const promoCodesService = {
    findRedeemableByCode: jest.fn(),
    incrementUsage: jest.fn(),
  };

  const uploadsService = {
    snapshotOrderLineImages: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
      transactional: jest.fn(async (fn) => fn(em)),
      create: jest.fn().mockImplementation((_Entity, data) => ({ ...data, id: 1 })),
      persist: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: EntityManager, useValue: em },
        { provide: ProductsService, useValue: productsService },
        { provide: PromoCodesService, useValue: promoCodesService },
        { provide: UploadsService, useValue: uploadsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.findAndCount as jest.Mock).mockResolvedValue([[mockOrder], 1]);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].orderNumber).toBe('ORD-20260101-0001');
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return order when found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.getById(1);

      expect(result?.customerEmail).toBe('test@hub.edu.vn');
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      expect(await service.getById(999)).toBeNull();
    });
  });

  describe('listByCustomerEmail', () => {
    it('should filter by email', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockOrder]);

      const rows = await service.listByCustomerEmail('test@hub.edu.vn');

      expect(rows).toHaveLength(1);
    });

    it('should return empty for blank email', async () => {
      expect(await service.listByCustomerEmail('  ')).toEqual([]);
    });
  });

  describe('getStaffStatusCounts', () => {
    it('should return status counts', async () => {
      (em.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2);

      const counts = await service.getStaffStatusCounts();

      expect(counts.ALL).toBe(10);
      expect(counts.pending).toBe(3);
    });
  });

  describe('softDelete', () => {
    it('should soft delete order', async () => {
      const row = { ...mockOrder };
      (em.findOne as jest.Mock).mockResolvedValue(row);

      const ok = await service.softDelete(1);

      expect(ok).toBe(true);
      expect(row.deletedAt).not.toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update shipped fields', async () => {
      const row = { ...mockOrder };
      (em.findOne as jest.Mock).mockResolvedValue(row);

      const result = await service.updateStatus(1, 'shipped', 'user-1');

      expect(result?.status).toBe('shipped');
      expect(row.shippedBy).toBe('user-1');
    });
  });
});
