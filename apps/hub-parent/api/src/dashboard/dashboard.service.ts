/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Category } from '../entities/category.entity';
import { PostCategory } from '../entities/post-category.entity';
import { BaseDashboardService } from '../common/module-bases/dashboard/dashboard.service';

@Injectable()
export class DashboardService extends BaseDashboardService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCategoryEntity() {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getPostEntity() {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity() {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }
}
