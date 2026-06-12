/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicCategoriesService } from '@workspace/api-server/modules/public';
import { Category } from '../entities/category.entity';

@Injectable()
export class PublicCategoriesService extends BasePublicCategoriesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }
}
