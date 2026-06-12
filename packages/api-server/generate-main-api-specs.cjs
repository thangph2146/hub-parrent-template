/**
 * Generator: Tạo test specs cho services trong `apps/main/api/src/`.
 *
 * Pattern theo `apps/main/api/src/comments/comments.service.spec.ts`:
 *   - `Test.createTestingModule` với provider `EntityManager` (mock).
 *   - Inject concrete service thật.
 *   - Mock entities với DTO fields.
 *   - Test CRUD: list, getById, softDelete, restore, hardDelete, bulk.
 *
 * Output: `apps/main/api/src/<module>/<module>.service.spec.ts` (chỉ tạo nếu chưa có).
 */
const fs = require('fs');
const path = require('path');

const BASE_API = path.resolve(__dirname, '..', '..', 'apps', 'main', 'api', 'src');
const FIXTURE_PATH = path.resolve(
  __dirname,
  'src',
  'data-test',
  'hub-system-export-2026-06-11.json',
);

// Một số module không có fixture trong JSON, cần derive serviceName đặc biệt
const MODULES = [
  { folder: 'academic-years', serviceName: 'AcademicYearsService', fixtureKey: 'academic_years' },
  { folder: 'cameras', serviceName: 'CamerasService', fixtureKey: 'cameras' },
  { folder: 'carts', serviceName: 'CartsService', fixtureKey: 'customer_carts' },
  { folder: 'courses', serviceName: 'CoursesService', fixtureKey: 'courses' },
  { folder: 'departments', serviceName: 'DepartmentsService', fixtureKey: 'departments' },
  { folder: 'event-checkins', serviceName: 'EventCheckinsService', fixtureKey: 'event_checkins' },
  { folder: 'event-checkouts', serviceName: 'EventCheckoutsService', fixtureKey: null },
  { folder: 'event-registrations', serviceName: 'EventRegistrationsService', fixtureKey: 'event_registrations' },
  { folder: 'event-speakers', serviceName: 'EventSpeakersService', fixtureKey: 'event_speakers' },
  { folder: 'events', serviceName: 'EventsService', fixtureKey: 'events' },
  { folder: 'face-data', serviceName: 'FaceDataService', fixtureKey: 'face_data' },
  { folder: 'imported-users', serviceName: 'ImportedUsersService', fixtureKey: 'imported_users' },
  { folder: 'locations', serviceName: 'LocationsService', fixtureKey: 'locations' },
  { folder: 'majors', serviceName: 'MajorsService', fixtureKey: 'majors' },
  { folder: 'orders', serviceName: 'OrdersService', fixtureKey: 'orders' },
  { folder: 'page-contents', serviceName: 'PageContentsService', fixtureKey: 'page_contents' },
  { folder: 'parent-students', serviceName: 'ParentStudentsService', fixtureKey: 'parent_students' },
  { folder: 'products', serviceName: 'ProductsService', fixtureKey: 'products' },
  { folder: 'promo-codes', serviceName: 'PromoCodesService', fixtureKey: 'promo_codes' },
  { folder: 'screens', serviceName: 'ScreensService', fixtureKey: 'screens' },
  { folder: 'seo-metas', serviceName: 'SeoMetasService', fixtureKey: 'seo_meta' },
  { folder: 'sessions', serviceName: 'SessionsService', fixtureKey: 'sessions' },
  { folder: 'speakers', serviceName: 'SpeakersService', fixtureKey: 'speakers' },
  { folder: 'system', serviceName: 'SystemService', fixtureKey: null },
  { folder: 'templates', serviceName: 'TemplatesService', fixtureKey: 'templates' },
  { folder: 'training-levels', serviceName: 'TrainingLevelsService', fixtureKey: 'training_levels' },
  { folder: 'training-systems', serviceName: 'TrainingSystemsService', fixtureKey: 'training_systems' },
  { folder: 'uploads', serviceName: 'UploadsService', fixtureKey: 'storage_files' },
  { folder: 'hanet', serviceName: 'HanetWebhookService', fixtureKey: null },
  { folder: 'public', serviceName: 'PublicCategoriesService', fixtureKey: 'categories' },
];

// Load fixture once
let fixture = {};
try {
  if (fs.existsSync(FIXTURE_PATH)) {
    fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));
  }
} catch (e) {
  console.error('Failed to load fixture:', e.message);
}

function generateSpec(cfg) {
  // Service file name = folder.service.ts (e.g., 'academic-years/academic-years.service.ts')
  let actualFileName;
  if (cfg.serviceFileName) {
    actualFileName = cfg.serviceFileName;
  } else if (cfg.folder === 'hanet') {
    actualFileName = 'hanet-webhook.service.ts';
  } else if (cfg.folder === 'public') {
    actualFileName = 'public-categories.service.ts';
  } else {
    // Default: <folder>.service.ts
    actualFileName = `${cfg.folder}.service.ts`;
  }

  const actualPath = path.join(BASE_API, cfg.folder, actualFileName);
  if (!fs.existsSync(actualPath)) {
    return { error: `Service file not found: ${actualPath}` };
  }

  const importPath = `./${actualFileName.replace(/\.ts$/, '')}`;
  const specPath = path.join(BASE_API, cfg.folder, actualFileName.replace(/\.ts$/, '.spec.ts'));

  // Skip nếu đã tồn tại
  if (fs.existsSync(specPath)) {
    return { skipped: true, specPath };
  }

  // Lấy sample row từ fixture
  const sampleRow = cfg.fixtureKey && Array.isArray(fixture[cfg.fixtureKey]) && fixture[cfg.fixtureKey].length > 0
    ? fixture[cfg.fixtureKey][0]
    : null;
  const hasFixtureData = !!sampleRow;

  return { content: `/**
 * ${cfg.serviceName} Unit Tests
 *
 * Pattern theo \`apps/main/api/src/comments/comments.service.spec.ts\`:
 *   - NestJS \`Test.createTestingModule\` với \`EntityManager\` mock.
 *   - Dữ liệu mẫu lấy từ fixture \`packages/api-server/src/data-test/hub-system-export-2026-06-11.json\`.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { ${cfg.serviceName} } from '${importPath}';

describe('${cfg.serviceName}', () => {
  let service: ${cfg.serviceName};
  let em: Partial<EntityManager>;

  ${hasFixtureData ? `// Mock entity dựa trên row thật từ fixture
  const mockEntity: Record<string, unknown> = {
    id: ${typeof sampleRow.id === 'string' ? `'${sampleRow.id}'` : sampleRow.id ?? 1},
    ...${JSON.stringify(sampleRow).slice(0, 500)},
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };` : `// Không có fixture - dùng mock entity mặc định
  const mockEntity: Record<string, unknown> = {
    id: 1,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };`}

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn(),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${cfg.serviceName},
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<${cfg.serviceName}>(${cfg.serviceName});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await (service as unknown as {
        list: (p: { page: number; limit: number }) => Promise<{
          data: unknown[];
          pagination: { page: number; limit: number; total: number };
        }>;
      }).list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
    });

    it('should pass search filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await (service as unknown as {
        list: (p: { page: number; limit: number; search?: string }) => Promise<unknown>;
      }).list({ page: 1, limit: 10, search: 'test' });

      expect(em.find).toHaveBeenCalled();
    });

    it('should pass status filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await (service as unknown as {
        list: (p: { page: number; limit: number; status?: string }) => Promise<unknown>;
      }).list({ page: 1, limit: 10, status: 'deleted' });

      expect(em.find).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await (service as unknown as {
        getById: (id: number) => Promise<Record<string, unknown> | null>;
      }).getById(1);

      expect(result).not.toBeNull();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (service as unknown as {
        getById: (id: number) => Promise<Record<string, unknown> | null>;
      }).getById(99999);

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record', async () => {
      // apps/main/api pattern: em.findOne(Entity, {id}) → check deletedAt → persistAndFlush
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity, deletedAt: null });
      (em.persistAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (service as unknown as {
        softDelete: (id: number) => Promise<boolean>;
      }).softDelete(1);

      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (service as unknown as {
        softDelete: (id: number) => Promise<boolean>;
      }).softDelete(99999);

      expect(result).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity, deletedAt: new Date() });
      (em.persistAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (service as unknown as {
        restore: (id: number) => Promise<boolean>;
      }).restore(1);

      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (service as unknown as {
        restore: (id: number) => Promise<boolean>;
      }).restore(99999);

      expect(result).toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });
      (em.removeAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (service as unknown as {
        hardDelete: (id: number) => Promise<boolean>;
      }).hardDelete(1);

      expect(result).toBe(true);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });

    it('should return false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (service as unknown as {
        hardDelete: (id: number) => Promise<boolean>;
      }).hardDelete(99999);

      expect(result).toBe(false);
    });
  });

  describe('bulk', () => {
    // apps/main/api: BulkResult = { affected: number, message: string }
    it('should soft-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await (service as unknown as {
        bulk: (action: string, ids: number[]) => Promise<{ affected: number; message: string }>;
      }).bulk('delete', [1]);

      expect(result.affected).toBeGreaterThanOrEqual(0);
      expect(result.message).toBeDefined();
    });

    it('should restore multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await (service as unknown as {
        bulk: (action: string, ids: number[]) => Promise<{ affected: number; message: string }>;
      }).bulk('restore', [1]);

      expect(result.affected).toBeGreaterThanOrEqual(0);
    });

    it('should hard-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.removeAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (service as unknown as {
        bulk: (action: string, ids: number[]) => Promise<{ affected: number; message: string }>;
      }).bulk('hard-delete', [1]);

      expect(result.affected).toBeGreaterThanOrEqual(0);
    });
  });

  describe('bulk error handling', () => {
    it('should throw on invalid action', async () => {
      await expect(
        (service as unknown as {
          bulk: (action: string, ids: number[]) => Promise<unknown>;
        }).bulk('invalid-action', [1]),
      ).rejects.toBeDefined();
    });

    it('should return affected=0 for empty ids (apps/main/api behavior)', async () => {
      const result = await (service as unknown as {
        bulk: (action: string, ids: number[]) => Promise<{ affected: number; message: string }>;
      }).bulk('delete', []);
      expect(result.affected).toBe(0);
      expect(result.message).toBeDefined();
    });
  });
});
`, specPath };
}

let generated = 0;
let skipped = 0;
const errors = [];

for (const cfg of MODULES) {
  try {
    const result = generateSpec(cfg);
    if (result.error) {
      errors.push(result.error);
      continue;
    }
    if (result.skipped) {
      skipped++;
      continue;
    }
    try {
      fs.writeFileSync(result.specPath, result.content, 'utf-8');
      console.log(`Created: ${path.relative(BASE_API, result.specPath)}`);
      generated++;
    } catch (err) {
      errors.push(`${result.specPath}: ${err.message}`);
    }
  } catch (e) {
    errors.push(`${cfg.folder}: ${e.message || e}`);
  }
}

console.log(`\nGenerated ${generated} spec files. Skipped ${skipped} (already exist).`);
if (errors.length > 0) {
  console.log('Errors:');
  for (const e of errors) console.log(' -', e);
}
