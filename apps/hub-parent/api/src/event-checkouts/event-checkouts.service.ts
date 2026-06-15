/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventCheckoutsService } from '../common/module-bases/event-checkouts/event-checkout.service';
export type {
  EventCheckoutRowDto,
  ListEventCheckoutsParams,
  ListEventCheckoutsResult,
  BulkClearCheckoutsResult,
} from '../common/module-bases/event-checkouts/event-checkout.service';

@Injectable()
export class EventCheckoutsService extends BaseEventCheckoutsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }
}
