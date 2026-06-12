/**
 * Controller spec cho Setting controller.
 *
 * Sinh tự động bởi `generate-controller-specs.cjs`. Mục tiêu:
 *   - 100% statement/branch coverage cho file controller tương ứng.
 *   - Validate contract mà `packages/api-client` đang dùng:
 *     route + envelope + filter[column] + hard-delete alias.
 *
 * Không spin Nest app: khởi tạo controller instance với service mock và
 * đọc route metadata qua `Reflect`. Đủ để phát hiện mismatch giữa client
 * và server.
 */
import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BaseSettingsController } from './setting.controller';

type RouteInfo = { method: string; path: string; handler: string };
type SettingRow = {
  id: number;
  key: string;
  value: unknown;
  group: string;
  createdAt: string;
  updatedAt: string;
};

function getRoutes(ctrl: object): RouteInfo[] {
  const out: RouteInfo[] = [];
  const VERB_MAP: Record<number, string> = {
    0: 'GET',
    2: 'PUT',
    3: 'DELETE',
  };
  const seen = new Set<string>();
  let proto: object | null = Object.getPrototypeOf(ctrl);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor' || seen.has(name)) continue;
      seen.add(name);
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      const handler = desc?.value as ((...args: unknown[]) => unknown) | undefined;
      if (typeof handler !== 'function') continue;
      const verb = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
      if (typeof verb !== 'number' || !(verb in VERB_MAP)) continue;
      const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
      if (pathMeta == null) continue;
      out.push({
        method: VERB_MAP[verb],
        path: pathMeta === '' ? '/' : `/${String(pathMeta).replace(/^\//, '')}`,
        handler: name,
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
  return out;
}

describe('BaseSettingsController — settings contract', () => {
  const sampleRow: SettingRow = {
    id: 1,
    key: 'site_name',
    value: 'HUB Parent',
    group: 'general',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let service: {
    listSettings: jest.Mock;
    getByKey: jest.Mock;
    bulkUpdate: jest.Mock;
    updateByKey: jest.Mock;
    deleteSetting: jest.Mock;
  };
  let controller: BaseSettingsController;

  beforeEach(() => {
    service = {
      listSettings: jest.fn().mockResolvedValue([sampleRow]),
      getByKey: jest.fn().mockResolvedValue(sampleRow),
      bulkUpdate: jest.fn().mockResolvedValue([sampleRow]),
      updateByKey: jest.fn().mockResolvedValue(sampleRow),
      deleteSetting: jest.fn().mockResolvedValue(sampleRow),
    };
    controller = new BaseSettingsController(service as never);
  });

  it('exposes route metadata theo contract settings hiện tại', () => {
    const routes = getRoutes(controller);
    expect(routes).toEqual(
      expect.arrayContaining([
        { method: 'GET', path: '/', handler: 'list' },
        { method: 'GET', path: '/:key', handler: 'getByKey' },
        { method: 'PUT', path: '/', handler: 'updateBulk' },
        { method: 'PUT', path: '/:key', handler: 'update' },
        { method: 'DELETE', path: '/:id', handler: 'delete' },
      ]),
    );
  });

  it('list gọi service theo group/search và trả envelope với array', async () => {
    const result = await controller.list('general', 'site');
    expect(service.listSettings).toHaveBeenCalledWith({
      group: 'general',
      search: 'site',
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual([sampleRow]);
  });

  it('getByKey hỗ trợ key string mà không ép sang numeric id', async () => {
    const result = await controller.getByKey('site_name');
    expect(service.getByKey).toHaveBeenCalledWith('site_name');
    expect(result.data).toEqual(sampleRow);
  });

  it('updateBulk chuyển body thẳng sang bulkUpdate', async () => {
    const payload = {
      site_name: 'HUB',
      site_description: 'Quản trị hệ thống',
    };
    const result = await controller.updateBulk(payload);
    expect(service.bulkUpdate).toHaveBeenCalledWith(payload);
    expect(result.data).toEqual([sampleRow]);
  });

  it('update hỗ trợ PUT /:key với body.value', async () => {
    const result = await controller.update('site_name', 'New Name');
    expect(service.updateByKey).toHaveBeenCalledWith('site_name', 'New Name');
    expect(result.data).toEqual(sampleRow);
  });

  it('delete gọi deleteSetting theo id string', async () => {
    const result = await controller.delete('1');
    expect(service.deleteSetting).toHaveBeenCalledWith('1');
    expect(result.data).toEqual(sampleRow);
  });

  it('getByKey vẫn trả success envelope khi không có setting', async () => {
    service.getByKey.mockResolvedValueOnce(null);
    const result = await controller.getByKey('missing_key');
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});
