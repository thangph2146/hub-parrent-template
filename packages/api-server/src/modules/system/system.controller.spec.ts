import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { BaseSystemController } from './system.controller';

const VERB_MAP: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
};

function getRoutes(controller: BaseSystemController): { method: string; path: string; handler: string }[] {
  const routes: { method: string; path: string; handler: string }[] = [];
  let proto = Object.getPrototypeOf(controller);
  while (proto && proto !== Object.prototype) {
    const methods = Object.getOwnPropertyNames(proto).filter(
      (k) => k !== 'constructor' && typeof (proto as Record<string, unknown>)[k] === 'function',
    );
    for (const key of methods) {
      const fn = proto[key as keyof typeof proto];
      const method = Reflect.getMetadata(METHOD_METADATA, fn);
      const path = Reflect.getMetadata(PATH_METADATA, fn);
      if (method !== undefined) {
        routes.push({
          method: VERB_MAP[method] ?? 'UNKNOWN',
          path: path ?? '/',
          handler: key,
        });
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return routes;
}

const dummySchema = {
  tables: [
    { name: 'users', entityName: 'User', exportModelName: 'user', domain: 'system', description: 'Users', rowCount: 100, activeRowCount: 80, trashedRowCount: 20, columns: [{ name: 'id', type: 'integer', kind: 'pk' as const }] },
  ],
  relations: [],
  totalRows: 100,
  totalActiveRows: 80,
};

const dummyImportConfig = {
  modelOrder: ['user', 'post', 'category'],
  bundles: { system: ['user', 'post'] as readonly string[] },
  rowChunkSize: 100,
};

const sampleExportResult = {
  modelOrder: ['user', 'post'],
  data: { user: [{ id: 1, email: 'a@t.com' }] },
  exportedAt: new Date().toISOString(),
};

describe('BaseSystemController — client contract', () => {
  let service: {
    getModels: jest.Mock;
    exportData: jest.Mock;
    exportExcelData: jest.Mock;
    importData: jest.Mock;
    getImportConfig: jest.Mock;
    getDatabaseSchema: jest.Mock;
  };
  let controller: BaseSystemController;

  beforeEach(() => {
    service = {
      getModels: jest.fn(async () => ['user', 'post', 'category']),
      exportData: jest.fn(async () => sampleExportResult),
      exportExcelData: jest.fn(async () => Buffer.from('dummy-excel')),
      importData: jest.fn(async () => ({ affected: 5, message: 'Import thành công 5 bản ghi' })),
      getImportConfig: jest.fn(async () => dummyImportConfig),
      getDatabaseSchema: jest.fn(async () => dummySchema),
    };
    controller = new BaseSystemController(service as never);
  });

  describe('route metadata (api-client contract)', () => {
    it('exposes route metadata theo contract system', () => {
      const routes = getRoutes(controller);
      expect(routes).toEqual(
        expect.arrayContaining([
          { method: 'GET', path: 'models', handler: 'getModels' },
          { method: 'GET', path: 'export', handler: 'exportData' },
          { method: 'GET', path: 'export/excel', handler: 'exportExcelData' },
          { method: 'POST', path: 'import', handler: 'importData' },
          { method: 'GET', path: 'import-config', handler: 'getImportConfig' },
          { method: 'GET', path: 'database-schema', handler: 'getDatabaseSchema' },
        ]),
      );
    });
  });

  describe('envelope contract (api-client.unwrapApiEnvelope)', () => {
    it('getModels trả về success envelope với string array', async () => {
      const result = await controller.getModels();
      expect(service.getModels).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['user', 'post', 'category']);
    });

    it('exportData trả về success envelope với export result', async () => {
      const result = await controller.exportData();
      expect(service.exportData).toHaveBeenCalledWith(undefined);
      expect(result.success).toBe(true);
      expect((result.data as typeof sampleExportResult).modelOrder).toEqual(['user', 'post']);
    });

    it('exportData with model query param', async () => {
      const result = await controller.exportData('user');
      expect(service.exportData).toHaveBeenCalledWith('user');
      expect(result.success).toBe(true);
    });

    it('exportExcelData trả về success envelope với base64 buffer', async () => {
      const result = await controller.exportExcelData();
      expect(service.exportExcelData).toHaveBeenCalledWith(undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ buffer: expect.any(String) });
    });

    it('importData trả về success envelope với import result', async () => {
      const body = { data: { user: [{ id: 1, email: 'a@t.com' }] }, targetModel: 'user', skipClear: false };
      const result = await controller.importData(body);
      expect(service.importData).toHaveBeenCalledWith(body.data, 'user', false);
      expect(result.success).toBe(true);
      expect((result.data as { affected: number }).affected).toBe(5);
    });

    it('getImportConfig trả về success envelope với import config', async () => {
      const result = await controller.getImportConfig();
      expect(service.getImportConfig).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(dummyImportConfig);
    });

    it('getDatabaseSchema trả về success envelope với schema', async () => {
      const result = await controller.getDatabaseSchema();
      expect(service.getDatabaseSchema).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect((result.data as typeof dummySchema).tables).toHaveLength(1);
      expect((result.data as typeof dummySchema).totalRows).toBe(100);
    });
  });

  describe('error contract', () => {
    it('service lỗi được lan truyền', async () => {
      service.getDatabaseSchema.mockRejectedValueOnce(new Error('DB error'));
      await expect(controller.getDatabaseSchema()).rejects.toThrow('DB error');
    });
  });
});
