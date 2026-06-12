import 'reflect-metadata';
import { UnauthorizedException, RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { BaseCartsController } from './carts.controller';

const VERB_MAP: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.DELETE]: 'DELETE',
};

function getRoutes(controller: BaseCartsController): { method: string; path: string; handler: string }[] {
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

const dummyCart = {
  lines: [
    { productId: 1, sku: 'SP001', name: 'Sản phẩm A', category: 'Danh mục', unitType: 'cai', unitLabel: 'Cái', unitPrice: 50000, listUnitPrice: 50000, promoUnitPrice: null, minPromoQty: 0, qtyPerUnit: 1, quantity: 2, isWholesale: false, fulfillmentNote: null },
  ],
  appliedPromoCode: null,
  updatedAt: new Date().toISOString(),
};

describe('BaseCartsController — client contract', () => {
  let service: { getForCustomer: jest.Mock; saveForCustomer: jest.Mock; clearForCustomer: jest.Mock };
  let controller: BaseCartsController;

  beforeEach(() => {
    service = {
      getForCustomer: jest.fn(async () => dummyCart),
      saveForCustomer: jest.fn(async () => dummyCart),
      clearForCustomer: jest.fn(async () => undefined),
    };
    controller = new BaseCartsController(service as never);
  });

  describe('route metadata (api-client contract)', () => {
    it('exposes route metadata theo contract carts', () => {
      const routes = getRoutes(controller);
      expect(routes).toEqual(
        expect.arrayContaining([
          { method: 'GET', path: '/', handler: 'getMine' },
          { method: 'PUT', path: '/', handler: 'saveMine' },
          { method: 'DELETE', path: '/', handler: 'clearMine' },
        ]),
      );
    });
  });

  describe('envelope contract (api-client.unwrapApiEnvelope)', () => {
    it('getMine trả về success envelope với cart khi có userId', async () => {
      const result = await controller.getMine({ 'x-user-id': 'abc123' });
      expect(service.getForCustomer).toHaveBeenCalledWith('abc123');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(dummyCart);
      expect((result.data as typeof dummyCart).lines).toHaveLength(1);
    });

    it('saveMine trả về success envelope với cart đã lưu', async () => {
      const result = await controller.saveMine(dummyCart as never, { 'x-user-id': 'abc123' });
      expect(service.saveForCustomer).toHaveBeenCalledWith('abc123', dummyCart);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(dummyCart);
    });

    it('clearMine trả về success envelope với ok=true', async () => {
      const result = await controller.clearMine({ 'x-user-id': 'abc123' });
      expect(service.clearForCustomer).toHaveBeenCalledWith('abc123');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ ok: true });
    });
  });

  describe('error contract — UnauthorizedException khi thiếu x-user-id', () => {
    it('getMine throws UnauthorizedException khi không có header', async () => {
      await expect(controller.getMine({})).rejects.toThrow(UnauthorizedException);
    });

    it('getMine throws UnauthorizedException khi header rỗng', async () => {
      await expect(controller.getMine({ 'x-user-id': '' })).rejects.toThrow(UnauthorizedException);
    });

    it('getMine throws UnauthorizedException khi header chỉ có khoảng trắng', async () => {
      await expect(controller.getMine({ 'x-user-id': '   ' })).rejects.toThrow(UnauthorizedException);
    });

    it('saveMine throws UnauthorizedException khi không có header', async () => {
      await expect(controller.saveMine({} as never, {})).rejects.toThrow(UnauthorizedException);
    });

    it('clearMine throws UnauthorizedException khi không có header', async () => {
      await expect(controller.clearMine({})).rejects.toThrow(UnauthorizedException);
    });
  });
});
