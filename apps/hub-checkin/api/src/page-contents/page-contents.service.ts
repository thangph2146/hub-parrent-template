/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PageContent } from '../entities/page-content.entity';
import { BasePageContentsService } from '../common/module-bases/page-contents/page-contents.service';
export type {
  PageContentCreateInput,
  PageContentUpdateInput,
} from '../common/module-bases/page-contents/page-contents.service';

@Injectable()
export class PageContentsService extends BasePageContentsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getPageContentEntity() {
    return PageContent as unknown as new () => Record<string, unknown>;
  }
}
