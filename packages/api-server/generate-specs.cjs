/**
 * Script tạo test specs cho các module service.
 *
 * Tự động đọc entity name, search fields, filter fields từ file service.ts
 * của từng module, generate spec file tương ứng.
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src', 'modules');

const MODULE_CONFIGS = [
  { folder: 'admission-results', serviceFile: 'admission-result.service.ts', fixtureKey: 'admission_results', entity: 'AdmissionResult' },
  { folder: 'comments', serviceFile: 'comments.service.ts', fixtureKey: 'comments', entity: 'Comment' },
  { folder: 'categories', serviceFile: 'categories.service.ts', fixtureKey: 'categories', entity: 'Category' },
  { folder: 'contact-requests', serviceFile: 'contact-request.service.ts', fixtureKey: 'contact_requests', entity: 'ContactRequest' },
  { folder: 'customer-carts', serviceFile: 'customer-cart.service.ts', fixtureKey: 'customer_carts', entity: 'CustomerCart' },
  { folder: 'event-checkins', serviceFile: 'event-checkin.service.ts', fixtureKey: 'event_checkins', entity: 'EventCheckin' },
  { folder: 'event-registrations', serviceFile: 'event-registration.service.ts', fixtureKey: 'event_registrations', entity: 'EventRegistration' },
  { folder: 'event-speakers', serviceFile: 'event-speaker.service.ts', fixtureKey: 'event_speakers', entity: 'EventSpeaker' },
  { folder: 'face-data', serviceFile: 'face-data.service.ts', fixtureKey: 'face_data', entity: 'FaceData' },
  { folder: 'group-members', serviceFile: 'group-member.service.ts', fixtureKey: 'group_members', entity: 'GroupMember' },
  { folder: 'imported-users', serviceFile: 'imported-user.service.ts', fixtureKey: 'imported_users', entity: 'ImportedUser' },
  { folder: 'message-reads', serviceFile: 'message-read.service.ts', fixtureKey: 'message_reads', entity: 'MessageRead' },
  { folder: 'page-contents', serviceFile: 'page-content.service.ts', fixtureKey: 'page_contents', entity: 'PageContent' },
  { folder: 'parent-students', serviceFile: 'parent-student.service.ts', fixtureKey: 'parent_students', entity: 'ParentStudent' },
  { folder: 'post-categories', serviceFile: 'post-category.service.ts', fixtureKey: 'post_categories', entity: 'PostCategory' },
  { folder: 'posts', serviceFile: 'posts.service.ts', fixtureKey: 'posts', entity: 'Post' },
  { folder: 'post-tags', serviceFile: 'post-tag.service.ts', fixtureKey: 'post_tags', entity: 'PostTag' },
  { folder: 'promo-codes', serviceFile: 'promo-code.service.ts', fixtureKey: 'promo_codes', entity: 'PromoCode' },
  { folder: 'seo-metas', serviceFile: 'seo-meta.service.ts', fixtureKey: 'seo_meta', entity: 'SeoMeta' },
  { folder: 'storage-files', serviceFile: 'storage-file.service.ts', fixtureKey: 'storage_files', entity: 'StorageFile' },
  { folder: 'training-levels', serviceFile: 'training-level.service.ts', fixtureKey: 'training_levels', entity: 'TrainingLevel' },
  { folder: 'training-systems', serviceFile: 'training-system.service.ts', fixtureKey: 'training_systems', entity: 'TrainingSystem' },
  { folder: 'user-roles', serviceFile: 'user-role.service.ts', fixtureKey: 'user_roles', entity: 'UserRole' },
  { folder: 'verification-tokens', serviceFile: 'verification-token.service.ts', fixtureKey: 'verification_tokens', entity: 'VerificationToken' },
];

function readArrayField(content, methodName) {
  // Match: protected getXxxFields(): string[] { return ['a', 'b']; }
  // or:  protected getXxxFields(): string[] { return []; }
  const re = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\[\\]\\s*\\{\\s*return\\s*\\[([^\\]]*)\\]`);
  const m = content.match(re);
  if (!m) return null;
  const items = m[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/^['"]|['"]$/g, ''));
  return items;
}

function readStringField(content, methodName) {
  const re = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\s*\\{\\s*return\\s*['"]([^'"]+)['"]`);
  const m = content.match(re);
  return m ? m[1] : null;
}

function readNullableStringField(content, methodName) {
  const re = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\s*\\|\\s*null\\s*\\{\\s*return\\s*(['"])([^'"]+)\\1`);
  const m = content.match(re);
  if (m) return m[2];
  // null
  const re2 = new RegExp(`protected\\s+${methodName}\\(\\)\\s*:\\s*string\\s*\\|\\s*null\\s*\\{\\s*return\\s*null`);
  if (re2.test(content)) return null;
  return 'deletedAt';
}

function readClassName(content) {
  // Match: export abstract class BaseXxxService extends BaseCrudService
  const m = content.match(/export\s+abstract\s+class\s+(Base\w+Service)/);
  if (m) return m[1];
  // Try without abstract
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
  if (!className) {
    return { error: `Could not find class in ${servicePath}` };
  }
  // Đọc entity name TỪ service file (không hardcode trong config)
  const entityName =
    readStringField(content, 'getEntityName') || cfg.entity || 'Entity';
  const searchFields = readArrayField(content, 'getSearchFields') || [];
  const filterFields = readArrayField(content, 'getFilterableFields') || [];
  const softDeleteField = readNullableStringField(content, 'getSoftDeleteField');
  const hasSoftDelete = softDeleteField !== null;

  const serviceName = cfg.serviceFile.replace(/\.ts$/, '');
  const specName = cfg.serviceFile.replace(/\.ts$/, '.spec.ts');
  const specPath = path.join(BASE, cfg.folder, specName);
  const importPath = `./${serviceName}`;

  const searchFieldsStr = searchFields.length > 0 ? searchFields.map((f) => `'${f}'`).join(', ') : '';
  const filterFieldsStr = filterFields.length > 0 ? filterFields.map((f) => `'${f}'`).join(', ') : '';
  const testClassName = `Test${className.replace(/^Base/, '')}Service`;

  const softDeleteTest = hasSoftDelete
    ? `it('should expose soft-delete field "${softDeleteField}"', () => {
      expect((service as unknown as { getSoftDeleteField(): string | null }).getSoftDeleteField()).toBe('${softDeleteField}');
    });`
    : `it('should expose soft-delete field null', () => {
      expect((service as unknown as { getSoftDeleteField(): string | null }).getSoftDeleteField()).toBeNull();
    });`;

  const statusTests = hasSoftDelete
    ? `it('should support status="active"', async () => {
      const result = await service.list({ page: 1, limit: 1000, status: 'active' });
      expect(result.data.every((row) => row.deletedAt == null)).toBe(true);
    });

    it('should support status="deleted"', async () => {
      const result = await service.list({ page: 1, limit: 1000, status: 'deleted' });
      expect(result.data.every((row) => row.deletedAt != null)).toBe(true);
    });

    it('should support status="all"', async () => {
      const result = await service.list({ page: 1, limit: 1000, status: 'all' });
      expect(result.pagination.total).toBe(fixtureRows.length);
    });`
    : '';

  const softDeleteRestoreTests = hasSoftDelete
    ? `skipIfEmpty('softDelete + restore (với fixture)', () => {
    it('should soft delete and restore a record', async () => {
      const sample = fixtureRows[0];
      const id = sample.id as string;
      const ok1 = await service.softDelete(id);
      expect(ok1).toBe(true);
      const ok2 = await service.restore(id);
      expect(ok2).toBe(true);
    });
  });

  it('should return false when soft-deleting non-existent id', async () => {
    const ok = await service.softDelete('99999999');
    expect(ok).toBe(false);
  });`
    : '';

  const bulkTests = hasSoftDelete
    ? `skipIfEmpty('bulk (với fixture)', () => {
    it('should soft-delete multiple records', async () => {
      if (fixtureRows.length < 2) return;
      const ids = fixtureRows.slice(0, 2).map((r) => String(r.id));
      const result = await service.bulk('delete', ids);
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.message).toBeDefined();
    });

    it('should restore soft-deleted records', async () => {
      if (fixtureRows.length < 1) return;
      // First soft-delete
      await service.bulk('delete', [String(fixtureRows[0].id)]);
      // Then restore
      const ids = [String(fixtureRows[0].id)];
      const result = await service.bulk('restore', ids);
      expect(result.success).toBe(1);
    });

    it('should hard-delete records', async () => {
      if (fixtureRows.length < 1) return;
      const ids = [String(fixtureRows[0].id)];
      const result = await service.bulk('hard-delete', ids);
      expect(result.success).toBe(1);
    });
  });`
    : '';

  return { content: `/**
 * ${entityName} Service - E2E tests với fixture data.
 *
 * Sử dụng in-memory fake EntityManager + fixture \`hub-system-export-2026-06-11.json\`
 * để chạy CRUD operations trên entity \`${entityName}\` thật (mapping tới
 * \`apps/main/api/src/entities/${cfg.folder}.entity.ts\`).
 */
import { ${className} } from '${importPath}';
import { createFakeEntityManager } from '../../data-test/fake-em';
import { loadFixture } from '../../data-test/fixture';
import type { EntityManager } from '@mikro-orm/core';

class ${testClassName} extends ${className} {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }
  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }
  protected getEntity(): new () => Record<string, unknown> {
    // Named class so fake EntityManager có thể resolve store key
    return class ${entityName} { id = 0; } as unknown as new () => Record<string, unknown>;
  }
}

describe('${className} (E2E với fixture)', () => {
  let service: ${testClassName};
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = fixture.${cfg.fixtureKey};
  const skipIfEmpty = fixtureRows.length === 0 ? describe.skip : describe;

  beforeEach(() => {
    em = createFakeEntityManager(fixture);
    em.__reset();
    service = new ${testClassName}(em);
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

    ${softDeleteTest}

    it("should expose search fields", () => {
      expect((service as unknown as { getSearchFields(): string[] }).getSearchFields()).toEqual([${searchFieldsStr}]);
    });

    it("should expose filterable fields", () => {
      expect((service as unknown as { getFilterableFields(): string[] }).getFilterableFields()).toEqual([${filterFieldsStr}]);
    });
  });

  describe('list (với fixture)', () => {
    it('should return paginated result', async () => {
      const result = await service.list({ page: 1, limit: 10 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it('should normalize page/limit (page 0, limit -5)', async () => {
      const result = await service.list({ page: 0, limit: -5 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
    });

    ${statusTests}
  });

  skipIfEmpty('getById (với fixture)', () => {
    it('should return existing record', async () => {
      const sample = fixtureRows[0];
      const result = await service.getById(sample.id as string);
      expect(result).toBeDefined();
      expect(String(result?.id)).toBe(String(sample.id));
    });
  });

  it('should return null for non-existent id', async () => {
    const result = await service.getById('99999999');
    expect(result).toBeNull();
  });

  describe('create', () => {
    it('should create new record and return DTO', async () => {
      const newData = { id: 'TEST-NEW-1', isActive: true };
      const created = await service.create(newData as never);
      expect(created).toBeDefined();
      expect(created.id).toBe('TEST-NEW-1');
      expect(created.isActive).toBe(true);
    });
  });

  skipIfEmpty('update (với fixture)', () => {
    it('should update existing record', async () => {
      const sample = fixtureRows[0];
      const updated = await service.update(sample.id as string, { isActive: false });
      expect(updated).toBeDefined();
      expect(updated?.isActive).toBe(false);
    });
  });

  it('should return null when updating non-existent id', async () => {
    const result = await service.update('99999999', { isActive: false });
    expect(result).toBeNull();
  });

  ${softDeleteRestoreTests}

  skipIfEmpty('hardDelete (với fixture)', () => {
    it('should hard delete record', async () => {
      const sample = fixtureRows[0];
      const ok = await service.hardDelete(sample.id as string);
      expect(ok).toBe(true);
    });
  });

  it('should return false when hard-deleting non-existent id', async () => {
    const ok = await service.hardDelete('99999999');
    expect(ok).toBe(false);
  });

  ${bulkTests}

  describe('bulk error handling', () => {
    it('should throw on invalid action', async () => {
      await expect(
        service.bulk('invalid-action' as never, ['1']),
      ).rejects.toBeDefined();
    });

    it('should throw on empty ids', async () => {
      await expect(service.bulk('delete', [])).rejects.toBeDefined();
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

console.log(`\nGenerated ${generated} spec files.`);
if (errors.length > 0) {
  console.log('Errors:');
  for (const e of errors) console.log(' -', e);
}
