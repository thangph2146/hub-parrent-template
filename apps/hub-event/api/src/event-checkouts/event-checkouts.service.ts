/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseEventCheckoutsService,
  type BulkClearCheckoutsResult,
  EventCheckoutRowDto,
  ListEventCheckoutsParams,
  ListEventCheckoutsResult,
} from '@workspace/api-server/modules/event-checkouts';

export type {
  BulkClearCheckoutsResult,
  EventCheckoutRowDto,
  ListEventCheckoutsParams,
  ListEventCheckoutsResult,
};

@Injectable()
export class EventCheckoutsService extends BaseEventCheckoutsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }
}
