import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { BaseSystemController } from './system.controller';

const VERB_MAP: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
};

type ResponseMock = {
  statusCode: number;
  payload: unknown;
  headers: Record<string, string | number | string[]>;
  bodySent: unknown;
  status: jest.Mock<ResponseMock, [number]>;
  json: jest.Mock<ResponseMock, [unknown]>;
  setHeader: jest.Mock<ResponseMock, [string, string | number | string[]]>;
  send: jest.Mock<ResponseMock, [unknown]>;
  write: jest.Mock<ResponseMock, [string]>;
  end: jest.Mock<ResponseMock, []>;
  writableEnded: boolean;
};

function createResponseMock(): ResponseMock {
  const response: ResponseMock = {
    statusCode: 200,
    payload: undefined,
    headers: {},
    bodySent: undefined,
    writableEnded: false,
    status: jest.fn((code: number): ResponseMock => {
      response.statusCode = code;
      return response;
    }),
    json: jest.fn((payload: unknown): ResponseMock => {
      response.payload = payload;
      return response;
    }),
    setHeader: jest.fn((key: string, value: string | number | string[]): ResponseMock => {
      response.headers[key] = value;
      return response;
    }),
    send: jest.fn((body: unknown): ResponseMock => {
      response.bodySent = body;
      return response;
    }),
    write: jest.fn((): ResponseMock => response),
    end: jest.fn((): ResponseMock => {
      response.writableEnded = true;
      return response;
    }),
  };
  return response;
}

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
    {
      name: 'users',
      entityName: 'User',
      exportModelName: 'user',
      domain: 'system',
      description: 'Users',
      rowCount: 100,
      activeRowCount: 80,
      trashedRowCount: 20,
      columns: [{ name: 'id', type: 'integer', kind: 'pk' as const }],
    },
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
    importExcelData: jest.Mock;
    runSuperadminBootstrapSeed: jest.Mock;
    getImportConfig: jest.Mock;
    getDatabaseSchema: jest.Mock;
  };
  let controller: BaseSystemController;

  beforeEach(() => {
    service = {
      getModels: jest.fn(() => ['user', 'post', 'category']),
      exportData: jest.fn(async () => sampleExportResult),
      exportExcelData: jest.fn(async () => Buffer.from('dummy-excel')),
      importData: jest.fn(async () => ({ affected: 5, message: 'Import thanh cong 5 ban ghi' })),
      importExcelData: jest.fn(async () => ({ affected: 2, message: 'Import Excel OK' })),
      runSuperadminBootstrapSeed: jest.fn(async () => ({ ok: true })),
      getImportConfig: jest.fn(() => dummyImportConfig),
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
          { method: 'POST', path: 'import/excel', handler: 'importExcelData' },
          { method: 'POST', path: 'seed-bootstrap', handler: 'seedBootstrap' },
          { method: 'GET', path: 'import-config', handler: 'getImportConfig' },
          { method: 'GET', path: 'database-schema', handler: 'getDatabaseSchema' },
        ]),
      );
    });
  });

  describe('envelope contract (@Res + createSuccessResponse)', () => {
    it('getModels tra success envelope', async () => {
      const res = createResponseMock();
      await controller.getModels(res as never, {});
      expect(service.getModels).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.payload).toEqual(
        expect.objectContaining({
          success: true,
          data: ['user', 'post', 'category'],
        }),
      );
    });

    it('exportData tra success envelope', async () => {
      const res = createResponseMock();
      await controller.exportData(res as never, {}, 'user');
      expect(service.exportData).toHaveBeenCalledWith('user');
      expect(res.payload).toEqual(
        expect.objectContaining({ success: true, data: sampleExportResult }),
      );
    });

    it('exportExcelData gui file binary', async () => {
      const res = createResponseMock();
      await controller.exportExcelData(res as never, {});
      expect(service.exportExcelData).toHaveBeenCalledWith(undefined);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.send).toHaveBeenCalledWith(Buffer.from('dummy-excel'));
    });

    it('importData tra 400 khi thieu body', async () => {
      const res = createResponseMock();
      await controller.importData(res as never, {}, undefined, undefined, undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('importData tra success envelope', async () => {
      const res = createResponseMock();
      const data = { user: [{ id: 1, email: 'a@t.com' }] };
      await controller.importData(res as never, {}, 'user', 'false', undefined, data);
      expect(service.importData).toHaveBeenCalledWith(
        data,
        'user',
        false,
        undefined,
        undefined,
      );
      expect(res.payload).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ affected: 5 }),
        }),
      );
    });

    it('getImportConfig + getDatabaseSchema tra envelope', async () => {
      const resConfig = createResponseMock();
      await controller.getImportConfig(resConfig as never, {});
      expect(resConfig.payload).toEqual(
        expect.objectContaining({ success: true, data: dummyImportConfig }),
      );

      const resSchema = createResponseMock();
      await controller.getDatabaseSchema(resSchema as never, {});
      expect(resSchema.payload).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ totalRows: 100 }),
        }),
      );
    });
  });

  describe('maintenance auth', () => {
    it('tra 403 khi co authService nhung thieu quyen', async () => {
      const authService = {
        getAuthPayloadByUserId: jest.fn(async () => ({
          id: 1,
          email: 'u@example.com',
          name: 'U',
          image: null,
          permissions: [],
          roles: [{ id: 2, name: 'editor', displayName: 'Editor' }],
        })),
      };
      const secured = new BaseSystemController(service as never, authService);
      const res = createResponseMock();
      await secured.getModels(res as never, { 'x-user-id': '1' });
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
