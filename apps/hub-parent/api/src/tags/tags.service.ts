/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Tag } from '../entities/tag.entity';
import { BaseTagsService } from '../common/module-bases/tags/tag.service';
export type {
  TagsRowDto,
  TagsCreateData,
  TagsUpdateData,
} from '../common/module-bases/tags/tag.service';

@Injectable()
export class TagsService extends BaseTagsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Tag as unknown as new () => Record<string, unknown>;
  }
}
