import 'reflect-metadata';
import { BadRequestException, RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { BaseEventCheckoutsController } from './event-checkout.controller';

const VERB_MAP: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
};

function getRoutes(controller: BaseEventCheckoutsController): { method: string; path: string; handler: string }[] {
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

const sampleRows = [
  { id: 1, eventId: 10, email: 'a@t.com', fullName: 'User A', phone: '0901', checkoutTime: '2026-01-01T00:00:00.000Z', attendanceStatus: 1, attendanceMinutes: 120, hasCheckin: true, faceVerified: false, createdAt: '2026-01-01T00:00:00.000Z' },
];

describe('BaseEventCheckoutsController — client contract', () => {
  let service: { list: jest.Mock; bulkClear: jest.Mock };
  let controller: BaseEventCheckoutsController;

  beforeEach(() => {
    service = {
      list: jest.fn(async () => ({
        data: sampleRows,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })),
      bulkClear: jest.fn(async (ids: string[]) => ({
        affected: ids.length,
        message: `Đã hủy checkout ${ids.length} lượt đăng ký`,
      })),
    };
    controller = new BaseEventCheckoutsController(service as never);
  });

  describe('route metadata (api-client contract)', () => {
    it('exposes route metadata theo contract event-checkouts', () => {
      const routes = getRoutes(controller);
      expect(routes).toEqual(
        expect.arrayContaining([
          { method: 'GET', path: '/', handler: 'list' },
          { method: 'POST', path: 'bulk', handler: 'bulk' },
        ]),
      );
    });
  });

  describe('envelope contract (api-client.unwrapApiEnvelope)', () => {
    it('list trả về success envelope với paginated data', async () => {
      const result = await controller.list('10', '1', '10');
      expect(service.list).toHaveBeenCalledWith({
        eventId: '10', page: 1, limit: 10, search: undefined,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect((result.data as Record<string, unknown>).data).toEqual(sampleRows);
      expect((result.data as Record<string, unknown>).pagination).toEqual({
        page: 1, limit: 10, total: 1, totalPages: 1,
      });
    });

    it('bulk trả về success envelope với affected count', async () => {
      const result = await controller.bulk({ ids: ['1', '2', '3'] });
      expect(service.bulkClear).toHaveBeenCalledWith(['1', '2', '3']);
      expect(result.success).toBe(true);
      expect((result.data as { affected: number }).affected).toBe(3);
      expect((result.data as { message: string }).message).toEqual(expect.any(String));
    });
  });

  describe('error contract', () => {
    it('list throws BadRequestException khi eventId bị thiếu', async () => {
      await expect(controller.list('', '1', '10')).rejects.toThrow(BadRequestException);
    });

    it('list throws BadRequestException khi eventId chỉ là khoảng trắng', async () => {
      await expect(controller.list('   ', '1', '10')).rejects.toThrow(BadRequestException);
    });

    it('bulk với ids rỗng vẫn trả về success (affected=0)', async () => {
      const result = await controller.bulk({ ids: [] });
      expect(service.bulkClear).toHaveBeenCalledWith([]);
      expect(result.success).toBe(true);
      expect((result.data as { affected: number }).affected).toBe(0);
    });

    it('bulk với body thiếu ids dùng mảng rỗng', async () => {
      const result = await controller.bulk({});
      expect(service.bulkClear).toHaveBeenCalledWith([]);
      expect(result.success).toBe(true);
    });
  });
});
