import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BaseUploadsController } from './uploads.controller';

type RouteInfo = { method: string; path: string; handler: string };
type ReqHandler = (req: unknown, res?: unknown, next?: unknown) => unknown;
type ResponseMock = {
  statusCode: number;
  payload: unknown;
  headers: Record<string, string>;
  setHeader: jest.Mock<void, [string, string]>;
  status: jest.Mock<ResponseMock, [number]>;
  json: jest.Mock<ResponseMock, [unknown]>;
  send: jest.Mock<ResponseMock, [unknown]>;
};

function createResponseMock(): ResponseMock {
  const response: ResponseMock = {
    statusCode: 200,
    payload: undefined,
    headers: {},
    setHeader: jest.fn((key: string, value: string) => {
      response.headers[key] = value;
    }),
    status: jest.fn((code: number): ResponseMock => {
      response.statusCode = code;
      return response;
    }),
    json: jest.fn((payload: unknown): ResponseMock => {
      response.payload = payload;
      return response;
    }),
    send: jest.fn((payload: unknown): ResponseMock => {
      response.payload = payload;
      return response;
    }),
  };
  return response;
}

function getRoutes(ctrl: object): RouteInfo[] {
  const out: RouteInfo[] = [];
  const verbs: Record<number, string> = {
    0: 'GET',
    1: 'POST',
    2: 'PUT',
    3: 'DELETE',
    4: 'PATCH',
    5: 'HEAD',
    6: 'SEARCH',
    7: 'ALL',
    9: 'OPTIONS',
  };
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      const handler = descriptor?.value as ReqHandler | undefined;
      if (typeof handler !== 'function') continue;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
      if (typeof method !== 'number') continue;
      const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as
        | string
        | string[]
        | undefined;
      if (pathMeta == null) continue;
      const normalized = Array.isArray(pathMeta) ? pathMeta[0] : pathMeta;
      out.push({
        method: verbs[method],
        path: normalized === '' ? '/' : `/${String(normalized).replace(/^\//, '')}`,
        handler: name,
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

class TestController extends BaseUploadsController {}

describe('BaseUploadsController', () => {
  let controller: TestController;
  let service: {
    listImages: jest.Mock;
    listFolders: jest.Mock;
    createFolder: jest.Mock;
    saveFile: jest.Mock;
    deleteFile: jest.Mock;
    deleteFolder: jest.Mock;
    bulkMoveFiles: jest.Mock;
    bulkDeleteFiles: jest.Mock;
    reorganizeDateFolders: jest.Mock;
    exportArchive: jest.Mock;
    importArchive: jest.Mock;
    serveFile: jest.Mock;
    serveResized: jest.Mock;
  };

  beforeEach(() => {
    service = {
      listImages: jest.fn(async () => ({
        data: [
          {
            fileName: 'avatar.png',
            originalName: 'avatar.png',
            size: 12,
            mimeType: 'image/png',
            url: '/api/uploads/images/avatars/avatar.png',
            relativePath: 'images/avatars/avatar.png',
            createdAt: Date.now(),
            mediaKind: 'image',
            storageTab: 'avatars',
            storageRealm: 'images',
            uploadOwnerId: '7',
            uploadOwnerName: null,
          },
        ],
        folderTree: null,
        realms: [{ id: 'images', label: 'Hinh anh', count: 1 }],
        tabs: [{ id: 'avatars', label: 'Avatars', count: 1 }],
        subTabs: [],
        childFolders: [],
        breadcrumb: [],
        folderPath: 'avatars',
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })),
      listFolders: jest.fn(async () => ({
        data: [{ path: 'images/avatars', name: 'avatars', label: 'Avatars', realm: 'images' }],
      })),
      createFolder: jest.fn(async () => ({
        folderName: 'avatars',
        folderPath: 'images/avatars',
        folderLabel: 'Avatars',
      })),
      saveFile: jest.fn(async () => ({
        fileName: '7_avatar_1.png',
        originalName: 'avatar.png',
        size: 12,
        mimeType: 'image/png',
        url: '/api/uploads/images/avatars/7_avatar_1.png',
        relativePath: 'images/avatars/7_avatar_1.png',
      })),
      deleteFile: jest.fn(async () => undefined),
      deleteFolder: jest.fn(async () => undefined),
      bulkMoveFiles: jest.fn(async () => ({
        moved: 1,
        skipped: 0,
        renamed: 0,
        errors: [],
      })),
      bulkDeleteFiles: jest.fn(async () => ({
        deleted: 1,
        failed: 0,
        errors: [],
      })),
      reorganizeDateFolders: jest.fn(async () => ({
        dryRun: true,
        scopePath: null,
        candidates: 1,
        moved: 0,
        skipped: 0,
        renamed: 0,
        removedDirs: 0,
        errors: [],
        preview: [{ from: 'a', to: 'b' }],
      })),
      exportArchive: jest.fn(async () => ({
        buffer: Buffer.from('zip'),
        fileCount: 1,
        skipped: 0,
      })),
      importArchive: jest.fn(async () => ({
        restored: 1,
        skipped: 0,
        failed: 0,
        totalEntries: 1,
        skippedUnsupportedExt: 0,
        skippedDuplicates: 0,
        listedTotal: 1,
        errors: [],
      })),
      serveFile: jest.fn(),
      serveResized: jest.fn(),
    };
    controller = new TestController(service as never);
  });

  it('exposes uploads admin routes used by api-client', () => {
    const routes = getRoutes(controller);
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: 'GET', path: '/', handler: 'list' }),
        expect.objectContaining({
          method: 'GET',
          path: '/export',
          handler: 'exportArchive',
        }),
        expect.objectContaining({ method: 'POST', path: '/', handler: 'post' }),
        expect.objectContaining({
          method: 'POST',
          path: '/import',
          handler: 'importArchive',
        }),
        expect.objectContaining({
          method: 'POST',
          path: '/bulk-move',
          handler: 'bulkMove',
        }),
        expect.objectContaining({
          method: 'POST',
          path: '/bulk-delete',
          handler: 'bulkDelete',
        }),
        expect.objectContaining({
          method: 'POST',
          path: '/reorganize-date-folders',
          handler: 'reorganizeDateFolders',
        }),
        expect.objectContaining({ method: 'DELETE', path: '/', handler: 'delete' }),
      ]),
    );
  });

  it('list tra ve folder list khi listFolders=true', async () => {
    const res = createResponseMock();
    await controller.list(res as never, { 'x-user-id': '7' }, '1', '10', 'true');

    expect(service.listFolders).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        data: [{ path: 'images/avatars', name: 'avatars', label: 'Avatars', realm: 'images' }],
      }),
    );
  });

  it('list tra ve paginated payload cho admin-app', async () => {
    const res = createResponseMock();
    const req = { protocol: 'http', get: () => 'localhost:3002' };
    await controller.list(
      res as never,
      { 'x-user-id': '7' },
      '1',
      '10',
      undefined,
      'images',
      'avatars',
      undefined,
      'true',
      undefined,
      req as never,
    );

    expect(service.listImages).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10,
        realm: 'images',
        folderPath: 'avatars',
        includeDescendants: true,
      }),
    );
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          data: expect.any(Array),
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        }),
      }),
    );
  });

  it('post ho tro branch createFolder', async () => {
    const res = createResponseMock();
    await controller.post(
      res as never,
      { 'x-user-id': '7' },
      {
        body: {
          action: 'createFolder',
          folderName: 'avatars',
          resourceType: 'images',
        },
      } as never,
    );

    expect(service.createFolder).toHaveBeenCalledWith(
      'avatars',
      undefined,
      'images',
      undefined,
    );
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ folderPath: 'images/avatars' }),
      }),
    );
  });

  it('post upload tra ve url cho editor/admin-app', async () => {
    const res = createResponseMock();
    await controller.post(
      res as never,
      { 'x-user-id': '7' },
      {
        body: { folderPath: 'images/avatars', isExistingFolder: 'true' },
        protocol: 'http',
        get: () => 'localhost:3002',
      } as never,
      {
        buffer: Buffer.from('img'),
        originalname: 'avatar.png',
        mimetype: 'image/png',
      },
    );

    expect(service.saveFile).toHaveBeenCalled();
    expect(res.payload).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ url: expect.stringContaining('/api/uploads/') }),
      }),
    );
  });

  it('bulk/delete/import/export validate va tra ve envelope dung', async () => {
    const resMove = createResponseMock();
    await controller.bulkMove(
      resMove as never,
      { 'x-user-id': '7' },
      { paths: ['images/a.png'], destinationFolder: 'images/archive' },
    );
    expect(resMove.payload).toEqual(
      expect.objectContaining({ success: true, data: expect.objectContaining({ moved: 1 }) }),
    );

    const resDelete = createResponseMock();
    await controller.bulkDelete(
      resDelete as never,
      { 'x-user-id': '7' },
      { paths: ['images/a.png'] },
    );
    expect(resDelete.payload).toEqual(
      expect.objectContaining({ success: true, data: expect.objectContaining({ deleted: 1 }) }),
    );

    const resExport = createResponseMock();
    await controller.exportArchive(resExport as never, { 'x-user-id': '7' });
    expect(resExport.send).toHaveBeenCalledWith(Buffer.from('zip'));
    expect(resExport.headers['X-Export-File-Count']).toBe('1');

    const resImport = createResponseMock();
    await controller.importArchive(
      resImport as never,
      { 'x-user-id': '7' },
      { body: { overwrite: 'true' } } as never,
      {
        buffer: Buffer.from('zip'),
        originalname: 'backup.zip',
        mimetype: 'application/zip',
      },
    );
    expect(resImport.payload).toEqual(
      expect.objectContaining({ success: true, data: expect.objectContaining({ restored: 1 }) }),
    );
  });

  it('delete tra loi 400 khi thieu path va 401 khi thieu header', async () => {
    const missingHeader = createResponseMock();
    await controller.delete(missingHeader as never, {}, 'images/a.png');
    expect(missingHeader.status).toHaveBeenCalledWith(401);

    const missingPath = createResponseMock();
    await controller.delete(missingPath as never, { 'x-user-id': '7' }, undefined);
    expect(missingPath.status).toHaveBeenCalledWith(400);
  });
});
