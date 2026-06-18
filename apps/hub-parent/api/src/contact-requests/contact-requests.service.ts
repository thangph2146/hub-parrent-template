/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ContactRequest } from '../entities/contact-request.entity';
import { BaseContactRequestsService } from '../common/module-bases/contact-requests/contact-request.service';
export type {
  ContactRequestsRowDto,
  ContactRequestsCreateData,
  ContactRequestsUpdateData,
} from '../common/module-bases/contact-requests/contact-request.service';

@Injectable()
export class ContactRequestsService extends BaseContactRequestsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return ContactRequest as unknown as new () => Record<string, unknown>;
  }
}
