/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * ParentStudentsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { AdminRealtimeBroadcastService } from '../common/admin/realtime/broadcast.service';
import { ParentStudentsService } from './parent-students.service';

describe('ParentStudentsService', () => {
  let service: ParentStudentsService;
  let em: Partial<EntityManager>;
  let adminRealtime: {
    pendingApproval: jest.Mock;
    parentStudentReviewed: jest.Mock;
  };

  const mockRow = {
    id: 1,
    parent: { id: 10, email: 'parent@test.com', name: 'Parent', phone: '090' },
    studentCode: 'SV001',
    studentName: 'Student One',
    note: null,
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    adminRealtime = {
      pendingApproval: jest.fn(),
      parentStudentReviewed: jest.fn(),
    };

    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 10 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentStudentsService,
        { provide: EntityManager, useValue: em },
        {
          provide: AdminRealtimeBroadcastService,
          useValue: adminRealtime,
        },
      ],
    }).compile();

    service = module.get<ParentStudentsService>(ParentStudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listAll', () => {
    it('should return paginated result', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockRow]);
      (em.count as jest.Mock).mockResolvedValue(1);

      const result = await service.listAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].studentCode).toBe('SV001');
      expect(result.pagination.total).toBe(1);
    });

    it('should pass search filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.listAll({ page: 1, limit: 10, search: 'SV' });

      expect(em.find).toHaveBeenCalled();
    });
  });

  describe('listPending', () => {
    it('should list pending requests', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockRow]);
      (em.count as jest.Mock).mockResolvedValue(1);

      const result = await service.listPending({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('pending');
    });
  });

  describe('listByParent', () => {
    it('should list by parent id', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockRow]);

      const result = await service.listByParent('10');

      expect(result).toHaveLength(1);
      expect(result[0].parentId).toBe(10);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockRow);

      const result = await service.getById('1');

      expect(result).not.toBeNull();
      expect(result?.studentCode).toBe('SV001');
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('addStudentRequest', () => {
    it('should create request and broadcast pending', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.addStudentRequest({
        parentId: 10,
        studentCode: 'SV002',
        studentName: 'New Student',
      });

      expect(em.persistAndFlush).toHaveBeenCalled();
      expect(result.studentCode).toBe('SV002');
      expect(adminRealtime.pendingApproval).toHaveBeenCalled();
    });

    it('should throw when duplicate', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockRow);

      await expect(
        service.addStudentRequest({
          parentId: 10,
          studentCode: 'SV001',
        }),
      ).rejects.toThrow('Bạn đã gửi yêu cầu liên kết');
    });
  });

  describe('review', () => {
    it('should approve and broadcast review', async () => {
      (em.findOne as jest.Mock).mockResolvedValue({ ...mockRow });

      const result = await service.review('1', 'approved', 'admin@test.com');

      expect(result).not.toBeNull();
      expect(result?.status).toBe('approved');
      expect(adminRealtime.parentStudentReviewed).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.review('999', 'rejected', 'admin@test.com');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove owned link', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockRow);

      const result = await service.remove('1', '10');

      expect(result).toBe(true);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });

    it('should return false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.remove('999', '10');

      expect(result).toBe(false);
    });
  });

  describe('removeByAdmin', () => {
    it('should hard delete by admin', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockRow);

      const result = await service.removeByAdmin('1');

      expect(result).toBe(true);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });
  });
});
