/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePageContentsAdminService } from '@workspace/api-server/modules/page-contents';
import { PageContent } from '../entities/page-content.entity';

export type {
  PageContentCreateInput,
  PageContentUpdateInput,
} from '@workspace/api-server/modules/page-contents';

@Injectable()
export class PageContentsService extends BasePageContentsAdminService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getPageContentEntity(): new () => Record<string, unknown> {
    return PageContent as unknown as new () => Record<string, unknown>;
  }
}
