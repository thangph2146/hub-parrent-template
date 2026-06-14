/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * CartsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let service: CartsService;
  let execute: jest.Mock;

  beforeEach(async () => {
    execute = jest.fn().mockResolvedValue([]);
    const em: Partial<EntityManager> = {
      getConnection: jest.fn().mockReturnValue({ execute }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CartsService, { provide: EntityManager, useValue: em }],
    }).compile();

    service = module.get<CartsService>(CartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getForCustomer', () => {
    it('should return empty cart when missing', async () => {
      const cart = await service.getForCustomer('1');
      expect(cart.lines).toEqual([]);
      expect(cart.appliedPromoCode).toBeNull();
    });
  });

  describe('clearForCustomer', () => {
    it('should execute delete query', async () => {
      await service.clearForCustomer('1');
      expect(execute).toHaveBeenCalled();
    });
  });
});
