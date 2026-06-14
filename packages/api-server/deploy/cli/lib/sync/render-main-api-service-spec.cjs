/**
 * Sinh *.service.spec.ts cho module OOP apps/main/api.
 */
const fs = require('node:fs')
const path = require('node:path')
const { PKG_MODULES, getTemplateForModuleId } = require('../../../config/package-module-templates.cjs')

function toPascalCase(moduleId) {
  return moduleId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function readPackageBaseServiceSrc(moduleId, config) {
  const template = getTemplateForModuleId(moduleId)
  const file = template?.primary?.service?.file
  if (!file || !config?.packageDir) return ''
  const abs = path.join(PKG_MODULES, config.packageDir, file)
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : ''
}

function packageExtendsBaseCrud(packageBaseSrc) {
  return /extends BaseCrudService/.test(packageBaseSrc)
}

function extractBulkLabel(serviceSrc) {
  const fromHook = serviceSrc.match(/protected getBulkLabel\(\)[^}]*return '([^']+)'/)
  if (fromHook) return fromHook[1]
  const fromBulkAction = serviceSrc.match(/label:\s*'([^']+)'/)
  return fromBulkAction?.[1] ?? null
}

function usesStringIds(packageBaseSrc) {
  return /async getById\(id: string\)/.test(packageBaseSrc)
}

function listParamsExpr(moduleId, packageBaseSrc) {
  if (moduleId === 'event-checkins' || /eventId:\s*string/.test(packageBaseSrc)) {
    return `{ page: 1, limit: 10, eventId: '1' }`
  }
  return `{ page: 1, limit: 10 }`
}

function mockEntityBlock(moduleId) {
  if (moduleId === 'posts') {
    return `  const mockEntity: Record<string, unknown> = {
    id: 1,
    categories: [],
    tags: [],
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };`
  }
  if (moduleId === 'event-checkins') {
    return `  const mockEntity: Record<string, unknown> = {
    id: 1,
    event: { id: 1 },
    email: 'test@example.com',
    fullName: 'Test User',
    checkinTime: new Date('2026-01-01'),
    checkinType: 0,
    faceVerified: false,
    status: 1,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };`
  }
  return `  const mockEntity: Record<string, unknown> = {
    id: 1,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };`
}

function renderBaseCrudServiceSpec(serviceClass, moduleId, bulkLabel) {
  return `${mockEntityBlock(moduleId)}

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${serviceClass},
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<${serviceClass}>(${serviceClass});
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

      const result = await service.list(${listParamsExpr(moduleId, '')});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.getById(1);

      expect(result).not.toBeNull();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.getById(99999);

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete via nativeUpdate', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.softDelete(1);

      expect(result).toBe(true);
      expect(em.nativeUpdate).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore via nativeUpdate', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.restore(1);

      expect(result).toBe(true);
      expect(em.nativeUpdate).toHaveBeenCalled();
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.hardDelete(1);

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('bulk', () => {
    it('should soft-delete multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.bulk('delete', [1]);

      expect(result.success).toBeGreaterThanOrEqual(0);
      expect(result.message).toBeDefined();${
        bulkLabel
          ? `
      expect(result.message).toContain('${bulkLabel}');`
          : ''
      }
    });

    it('should throw when ids is empty', async () => {
      await expect(service.bulk('delete', [])).rejects.toThrow(BadRequestException);
    });
  });
`
}

function renderCustomPackageBaseServiceSpec(
  serviceClass,
  moduleId,
  packageBaseSrc,
  bulkLabel,
) {
  const idArg = usesStringIds(packageBaseSrc) ? `'1'` : `1`
  const notFoundArg = usesStringIds(packageBaseSrc) ? `'99999'` : `99999`
  const listParams = listParamsExpr(moduleId, packageBaseSrc)

  return `${mockEntityBlock(moduleId)}

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${serviceClass},
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<${serviceClass}>(${serviceClass});
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

      const result = await service.list(${listParams});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.getById(${idArg});

      expect(result).not.toBeNull();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.getById(${notFoundArg});

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity, deletedAt: null });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.softDelete(${idArg});

      expect(result).toBe(true);
      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockEntity,
        deletedAt: new Date(),
      });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.restore(${idArg});

      expect(result).toBe(true);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.hardDelete(${idArg});

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('bulk', () => {
    it('should soft-delete multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.bulk('delete', [${idArg}]);

      expect(result.affected).toBeGreaterThanOrEqual(0);
      expect(result.message).toBeDefined();${
        bulkLabel
          ? `
      expect(result.message).toContain('${bulkLabel}');`
          : ''
      }
    });

    it('should return affected=0 for empty ids', async () => {
      const result = await service.bulk('delete', []);

      expect(result.affected).toBe(0);
      expect(result.message).toBeDefined();
    });
  });
`
}

function renderMainApiServiceSpec(meta, moduleId, legacyServiceSrc = '', packageBaseSrc = '') {
  const serviceClass = `${toPascalCase(moduleId)}Service`
  const bindingSrc = legacyServiceSrc || meta.serviceSrc
  const baseSrc = packageBaseSrc || readPackageBaseServiceSrc(moduleId, meta.config)
  const bulkLabel = extractBulkLabel(bindingSrc) || extractBulkLabel(baseSrc)
  const isBaseCrud = packageExtendsBaseCrud(baseSrc)

  if (moduleId === 'sessions') {
    return renderSessionsServiceSpec(serviceClass, moduleId)
  }

  const banner = isBaseCrud
    ? `/**
 * ${serviceClass} Unit Tests — binding OOP extends @workspace/api-server BaseCrudService.
 */
`
    : `/**
 * ${serviceClass} Unit Tests — binding OOP extends @workspace/api-server custom Base*.
 */
`

  const body = isBaseCrud
    ? renderBaseCrudServiceSpec(serviceClass, moduleId, bulkLabel)
    : renderCustomPackageBaseServiceSpec(serviceClass, moduleId, baseSrc, bulkLabel)

  const imports = isBaseCrud
    ? `import { BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';`
    : `import { EntityManager } from '@mikro-orm/core';`

  return `${banner}import { Test, TestingModule } from '@nestjs/testing';
${imports}
import { ${serviceClass} } from './${moduleId}.service';

describe('${serviceClass}', () => {
  let service: ${serviceClass};
  let em: Partial<EntityManager>;

${body}
});
`
}

function renderSessionsServiceSpec(serviceClass, moduleId) {
  return `/**
 * ${serviceClass} Unit Tests — binding OOP extends @workspace/api-server BaseSessionsService.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { ${serviceClass} } from './${moduleId}.service';

describe('${serviceClass}', () => {
  let service: ${serviceClass};
  let em: Partial<EntityManager>;

  const mockSession = {
    id: 1,
    isActive: true,
    user: { id: 1, email: 'a@b.com', name: 'Test' },
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
      getReference: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${serviceClass},
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<${serviceClass}>(${serviceClass});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([mockSession]);
      (em.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
`
}

module.exports = {
  renderMainApiServiceSpec,
  toPascalCase,
  readPackageBaseServiceSrc,
  packageExtendsBaseCrud,
}
