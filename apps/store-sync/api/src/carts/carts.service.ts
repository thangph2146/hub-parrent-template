/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseCartsService } from '../common/module-bases/carts/carts.service';
export type {
  CartLineItem,
  CartPayload,
  CartDto,
} from '../common/module-bases/carts/carts.service';

@Injectable()
export class CartsService extends BaseCartsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }
}
