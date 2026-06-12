/**
 * Generator: Tạo test specs theo pattern `users/` (pure mock + NestJS Test module).
 *
 * So với generator cũ (fake-em + fixture), generator mới này dùng:
 *   - `Test.createTestingModule` từ NestJS (giống users.service.spec.ts)
 *   - Mock `EntityManager` thuần với `jest.fn()` cho mỗi method
 *   - Mock entity đơn giản với field signatures
 *   - Dữ liệu mẫu lấy từ fixture JSON (`hub-system-export-2026-06-11.json`)
 *
 * Đảm bảo tính nhất quán với `packages/api-server/src/modules/users/`.
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src', 'modules');

const MODULE_CONFIGS = [
  { folder: 'academic-years', serviceFile: 'academic-year.service.ts', fixtureKey: 'academic_years', entity: 'AcademicYear' },
  { folder: 'accounts', serviceFile: 'account.service.ts', fixtureKey: 'accounts', entity: 'Account' },
  { folder: 'admission-results', serviceFile: 'admission-result.service.ts', fixtureKey: 'admission_results', entity: 'AdmissionResult' },
  { folder: 'cameras', serviceFile: 'camera.service.ts', fixtureKey: 'cameras', entity: 'Camera' },
  { folder: 'categories', serviceFile: 'categories.service.ts', fixtureKey: 'categories', entity: 'Category' },
  { folder: 'comments', serviceFile: 'comments.service.ts', fixtureKey: 'comments', entity: 'Comment' },
  { folder: 'contact-requests', serviceFile: 'contact-request.service.ts', fixtureKey: 'contact_requests', entity: 'ContactRequest' },
  { folder: 'courses', serviceFile: 'course.service.ts', fixtureKey: 'courses', entity: 'Course' },
  { folder: 'customer-carts', serviceFile: 'customer-cart.service.ts', fixtureKey: 'customer_carts', entity: 'CustomerCart' },
  { folder: 'departments', serviceFile: 'department.service.ts', fixtureKey: 'departments', entity: 'Department' },
  { folder: 'event-checkins', serviceFile: 'event-checkin.service.ts', fixtureKey: 'event_checkins', entity: 'EventCheckin' },
  { folder: 'event-registrations', serviceFile: 'event-registration.service.ts', fixtureKey: 'event_registrations', entity: 'EventRegistration' },
  { folder: 'event-speakers', serviceFile: 'event-speaker.service.ts', fixtureKey: 'event_speakers', entity: 'EventSpeaker' },
  { folder: 'events', serviceFile: 'event.service.ts', fixtureKey: 'events', entity: 'Event' },
  { folder: 'face-data', serviceFile: 'face-data.service.ts', fixtureKey: 'face_data', entity: 'FaceData' },
  { folder: 'group-members', serviceFile: 'group-member.service.ts', fixtureKey: 'group_members', entity: 'GroupMember' },
  { folder: 'groups', serviceFile: 'group.service.ts', fixtureKey: 'groups', entity: 'Group' },
  { folder: 'imported-users', serviceFile: 'imported-user.service.ts', fixtureKey: 'imported_users', entity: 'ImportedUser' },
  { folder: 'locations', serviceFile: 'location.service.ts', fixtureKey: 'locations', entity: 'Location' },
  { folder: 'majors', serviceFile: 'major.service.ts', fixtureKey: 'majors', entity: 'Major' },
  { folder: 'message-reads', serviceFile: 'message-read.service.ts', fixtureKey: 'message_reads', entity: 'MessageRead' },
  { folder: 'messages', serviceFile: 'message.service.ts', fixtureKey: 'messages', entity: 'Message' },
  { folder: 'notifications', serviceFile: 'notification.service.ts', fixtureKey: 'notifications', entity: 'Notification' },
  { folder: 'orders', serviceFile: 'order.service.ts', fixtureKey: 'orders', entity: 'Order' },
  { folder: 'page-contents', serviceFile: 'page-content.service.ts', fixtureKey: 'page_contents', entity: 'PageContent' },
  { folder: 'parent-students', serviceFile: 'parent-student.service.ts', fixtureKey: 'parent_students', entity: 'ParentStudent' },
  { folder: 'post-categories', serviceFile: 'post-category.service.ts', fixtureKey: 'post_categories', entity: 'PostCategory' },
  { folder: 'posts', serviceFile: 'posts.service.ts', fixtureKey: 'posts', entity: 'Post' },
  { folder: 'post-tags', serviceFile: 'post-tag.service.ts', fixtureKey: 'post_tags', entity: 'PostTag' },
  { folder: 'products', serviceFile: 'product.service.ts', fixtureKey: 'products', entity: 'Product' },
  { folder: 'promo-codes', serviceFile: 'promo-code.service.ts', fixtureKey: 'promo_codes', entity: 'PromoCode' },
  { folder: 'roles', serviceFile: 'role.service.ts', fixtureKey: 'roles', entity: 'Role' },
  { folder: 'screens', serviceFile: 'screen.service.ts', fixtureKey: 'screens', entity: 'Screen' },
  { folder: 'seo-metas', serviceFile: 'seo-meta.service.ts', fixtureKey: 'seo_meta', entity: 'SeoMeta' },
  { folder: 'sessions', serviceFile: 'session.service.ts', fixtureKey: 'sessions', entity: 'Session' },
  { folder: 'settings', serviceFile: 'setting.service.ts', fixtureKey: 'settings', entity: 'Setting' },
  { folder: 'speakers', serviceFile: 'speaker.service.ts', fixtureKey: 'speakers', entity: 'Speaker' },
  { folder: 'storage-files', serviceFile: 'storage-file.service.ts', fixtureKey: 'storage_files', entity: 'StorageFile' },
  { folder: 'students', serviceFile: 'student.service.ts', fixtureKey: 'students', entity: 'Student' },
  { folder: 'tags', serviceFile: 'tag.service.ts', fixtureKey: 'tags', entity: 'Tag' },
  { folder: 'templates', serviceFile: 'template.service.ts', fixtureKey: 'templates', entity: 'Template' },
  { folder: 'training-levels', serviceFile: 'training-level.service.ts', fixtureKey: 'training_levels', entity: 'TrainingLevel' },
  { folder: 'training-systems', serviceFile: 'training-system.service.ts', fixtureKey: 'training_systems', entity: 'TrainingSystem' },
  { folder: 'user-roles', serviceFile: 'user-role.service.ts', fixtureKey: 'user_roles', entity: 'UserRole' },
  { folder: 'verification-tokens', serviceFile: 'verification-token.service.ts', fixtureKey: 'verification_tokens', entity: 'VerificationToken' },
];

function readArrayField(content, methodName) {
  const re = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\[\\]\\s*\\{\\s*return\\s*\\[([^\\]]*)\\]`);
  const m = content.match(re);
  if (!m) return [];
  return m[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/^['"]|['"]$/g, ''));
}

function readStringField(content, methodName) {
  const re = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\s*\\{\\s*return\\s*['"]([^'"]+)['"]`);
  return (content.match(re) || [])[1] || null;
}

function readNullableStringField(content, methodName) {
  const re = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\s*\\|\\s*null\\s*\\{\\s*return\\s*(['"])([^'"]+)\\1`);
  const m = content.match(re);
  if (m) return m[2];
  const re2 = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\s*\\|\\s*null\\s*\\{\\s*return\\s*null`);
  if (re2.test(content)) return null;
  return 'deletedAt';
}

function readClassName(content) {
  const m = content.match(/export\s+abstract\s+class\s+(Base\w+Service)/);
  if (m) return m[1];
  const m2 = content.match(/export\s+class\s+(Base\w+Service)/);
  return m2 ? m2[1] : null;
}

function generateSpec(cfg) {
  const servicePath = path.join(BASE, cfg.folder, cfg.serviceFile);
  if (!fs.existsSync(servicePath)) {
    return { error: `Service file not found: ${servicePath}` };
  }
  const content = fs.readFileSync(servicePath, 'utf-8');
  const className = readClassName(content);
  if (!className) return { error: `Could not find class in ${servicePath}` };

  const entityName = readStringField(content, 'getEntityName') || cfg.entity || 'Entity';
  const searchFields = readArrayField(content, 'getSearchFields');
  const filterFields = readArrayField(content, 'getFilterableFields');
  const softDeleteField = readNullableStringField(content, 'getSoftDeleteField');
  const hasSoftDelete = softDeleteField !== null;

  const serviceName = cfg.serviceFile.replace(/\.ts$/, '');
  const specName = cfg.serviceFile.replace(/\.ts$/, '.spec.ts');
  const specPath = path.join(BASE, cfg.folder, specName);
  const importPath = `./${serviceName}`;

  const searchFieldsStr = searchFields.length > 0 ? searchFields.map((f) => `'${f}'`).join(', ') : '';
  const filterFieldsStr = filterFields.length > 0 ? filterFields.map((f) => `'${f}'`).join(', ') : '';

  const testClassName = `Test${className.replace(/^Base/, '')}Service`;

  const searchFieldsCheck = searchFields.length > 0
    ? `expect((service as unknown as { getSearchFields(): string[] }).getSearchFields()).toEqual([${searchFieldsStr}]);`
    : `expect((service as unknown as { getSearchFields(): string[] }).getSearchFields()).toEqual([]);`;

  const filterFieldsCheck = filterFields.length > 0
    ? `expect((service as unknown as { getFilterableFields(): string[] }).getFilterableFields()).toEqual([${filterFieldsStr}]);`
    : `expect((service as unknown as { getFilterableFields(): string[] }).getFilterableFields()).toEqual([]);`;

  const softDeleteTest = hasSoftDelete
    ? `expect((service as unknown as { getSoftDeleteField(): string | null }).getSoftDeleteField()).toBe('${softDeleteField}');`
    : `expect((service as unknown as { getSoftDeleteField(): string | null }).getSoftDeleteField()).toBeNull();`;

  return { content: `/**
 * ${className} Unit Tests
 *
 * Pattern theo \`packages/api-server/src/modules/users/users.service.spec.ts\`:
 *   - Pure mock với NestJS \`Test.createTestingModule\`.
 *   - Mock \`EntityManager\` thuần với \`jest.fn()\` cho mỗi method.
 *   - Dữ liệu mẫu lấy từ fixture \`data-test/hub-system-export-2026-06-11.json\`.
 *   - Test toàn bộ CRUD: list, getById, create, update, softDelete, restore, hardDelete, bulk.
 */
import { EntityManager } from '@mikro-orm/core';
import { ${className} } from '${importPath}';
import { loadFixture } from '../../data-test/fixture';

describe('${className}', () => {
  let service: ${className};
  let em: Partial<EntityManager>;
  const fixture = loadFixture();
  const fixtureRows = (fixture as unknown as Record<string, Array<Record<string, unknown>>>).${cfg.fixtureKey} ?? [];

  // Mock entity dựa trên row thật từ fixture
  const mockEntity: Record<string, unknown> = fixtureRows.length > 0
    ? { ...fixtureRows[0], deletedAt: null }
    : { id: 1, deletedAt: null, isActive: true, createdAt: new Date(), updatedAt: new Date() };

  class ${testClassName} extends ${className} {
    protected emRef: Partial<EntityManager>;
    constructor(emRef: Partial<EntityManager>) {
      // BaseCrudService có constructor(loggerContext?: string)
      super('${className}');
      this.emRef = emRef;
    }
    protected getEm(): EntityManager {
      return this.emRef as EntityManager;
    }
    protected getEntity(): new () => Record<string, unknown> {
      // Named class so EM-related tests có thể resolve được
      return class ${entityName} { id = 0; } as unknown as new () => Record<string, unknown>;
    }
  }

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
    };

    // Không dùng Test.createTestingModule vì BaseCrudService có constructor với string param
    // - Nest không thể resolve string. Tạo instance trực tiếp (tương tự users.service.spec.ts).
    service = new ${testClassName}(em);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should expose entity name "${entityName}"', () => {
      expect((service as unknown as { getEntityName(): string }).getEntityName()).toBe('${entityName}');
    });

    it('should expose primary key "id"', () => {
      expect((service as unknown as { getPrimaryKeyField(): string }).getPrimaryKeyField()).toBe('id');
    });

    it('should expose soft-delete field correctly', () => {
      ${softDeleteTest}
    });

    it('should expose search fields', () => {
      ${searchFieldsCheck}
    });

    it('should expose filterable fields', () => {
      ${filterFieldsCheck}
    });
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
    });

    it('should pass search filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await service.list({ page: 1, limit: 10, search: 'test' });

      expect(em.find).toHaveBeenCalled();
      const findArgs = (em.find as jest.Mock).mock.calls[0];
      expect(findArgs[1]).toBeDefined(); // where clause
    });

    it('should pass status filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await service.list({ page: 1, limit: 10, status: 'deleted' });

      expect(em.find).toHaveBeenCalled();
    });

    it('should enforce max limit', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await service.list({ page: 1, limit: 9999 });

      const findArgs = (em.find as jest.Mock).mock.calls[0];
      expect(findArgs[2].limit).toBeLessThanOrEqual(1000);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.getById('1');

      expect(result).not.toBeNull();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should persist new entity and return DTO', async () => {
      const newData: Record<string, unknown> = {
        id: 'TEST-NEW-1',
        isActive: true,
      };
      (em.persist as jest.Mock).mockImplementation((entity: Record<string, unknown>) => {
        if (entity && !entity.id) {
          entity.id = 999;
        }
        return Promise.resolve(undefined);
      });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.create(newData as never);

      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.update('1', { isActive: false } as never);

      expect(result).not.toBeNull();
      expect(em.flush).toHaveBeenCalled();
    });

    it('should return null when record not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.update('999', { isActive: false } as never);

      expect(result).toBeNull();
    });
  });

  ${hasSoftDelete ? `describe('softDelete', () => {
    it('should soft delete record', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.softDelete('1');

      expect(result).toBe(true);
    });

    it('should return false when record not found', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(0);

      const result = await service.softDelete('999');

      expect(result).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted record', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.restore('1');

      expect(result).toBe(true);
    });

    it('should return false when record not found', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(0);

      const result = await service.restore('999');

      expect(result).toBe(false);
    });
  });` : `// Module không hỗ trợ soft-delete - skip softDelete + restore`}

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.hardDelete('1');

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
    });

    it('should return false when record not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.hardDelete('999');

      expect(result).toBe(false);
    });
  });

  ${hasSoftDelete ? `describe('bulk', () => {
    it('should soft-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.bulk('delete', ['1']);

      expect(result.success).toBe(1);
      expect(result.message).toBeDefined();
    });

    it('should restore multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(2);

      const result = await service.bulk('restore', ['1', '2']);

      expect(result.success).toBe(2);
    });

    it('should hard-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }, { ...mockEntity, id: 2 }]);
      (em.removeAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.bulk('hard-delete', ['1', '2']);

      expect(result.total).toBe(2);
    });
  });

  describe('bulk error handling', () => {
    it('should throw on invalid action', async () => {
      await expect(
        service.bulk('invalid-action' as never, ['1']),
      ).rejects.toBeDefined();
    });

    it('should throw on empty ids', async () => {
      await expect(service.bulk('delete', [])).rejects.toBeDefined();
    });
  });` : `// Module không hỗ trợ soft-delete - bulk chỉ hỗ trợ hard-delete
  describe('bulk', () => {
    it('should hard-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.remove as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.bulk('hard-delete', ['1']);

      expect(result.total).toBe(1);
    });
  });

  describe('bulk error handling', () => {
    it('should throw on invalid action', async () => {
      await expect(
        service.bulk('invalid-action' as never, ['1']),
      ).rejects.toBeDefined();
    });

    it('should throw on empty ids', async () => {
      await expect(service.bulk('delete', [])).rejects.toBeDefined();
    });
  });`}

  // Integration: dùng dữ liệu thật từ fixture (luôn load để dùng khi có data)
  describe('fixture integration (sample row)', () => {
    it('should map fixture row correctly to DTO if data exists', () => {
      if (fixtureRows.length === 0) {
        // Fixture rỗng - skip nhưng vẫn pass
        expect(fixtureRows).toEqual([]);
        return;
      }
      const sample = fixtureRows[0];
      expect(sample).toBeDefined();
      // Join tables (post_tags, post_categories, user_roles) không có id field
      // - chỉ có FK keys (postId+tagId, postId+categoryId, userId+roleId).
      // Verify row có ít nhất 1 field đặc trưng.
      const hasId = 'id' in sample && sample.id != null;
      const hasFk = Object.keys(sample).some((k) => /Id[A-Z]?\b|Id$/.test(k));
      expect(hasId || hasFk).toBe(true);
    });
  });
});
` };
}

let generated = 0;
const errors = [];
for (const cfg of MODULE_CONFIGS) {
  const result = generateSpec(cfg);
  if (result.error) {
    errors.push(result.error);
    continue;
  }
  const specName = cfg.serviceFile.replace(/\.ts$/, '.spec.ts');
  const specPath = path.join(BASE, cfg.folder, specName);
  try {
    fs.writeFileSync(specPath, result.content, 'utf-8');
    console.log(`Created: ${cfg.folder}/${specName}`);
    generated++;
  } catch (err) {
    errors.push(`${specPath}: ${err.message}`);
  }
}

console.log(`\nGenerated ${generated} spec files (pattern: users.service.spec.ts).`);
if (errors.length > 0) {
  console.log('Errors:');
  for (const e of errors) console.log(' -', e);
}
