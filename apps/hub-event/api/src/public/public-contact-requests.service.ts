/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicContactRequestsService } from '@workspace/api-server/modules/public';
import { ContactRequest } from '../entities/contact-request.entity';
import { AdminRealtimeBroadcastService } from '../common/admin-realtime-broadcast.service';
import { ADMIN_ROUTES } from '../config/constants';

export type { CreateContactRequestDto } from '@workspace/api-server/modules/public';

@Injectable()
export class PublicContactRequestsService extends BasePublicContactRequestsService {
  constructor(
    private readonly em: EntityManager,
    private readonly adminRealtime: AdminRealtimeBroadcastService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getContactRequestEntity(): new () => Record<string, unknown> {
    return ContactRequest as unknown as new () => Record<string, unknown>;
  }

  protected getAdminRealtime() {
    return this.adminRealtime;
  }

  protected getContactRequestAdminUrl(id: number): string {
    return `${ADMIN_ROUTES.CONTACT_REQUESTS}/${id}`;
  }
}
