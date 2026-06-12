/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseDashboardService } from '@workspace/api-server/modules/dashboard';
import { Category } from '../entities/category.entity';
import { Post } from '../entities/post.entity';
import { PostCategory } from '../entities/post-category.entity';

export type { DashboardStatsDto, DashboardOverviewDto, DashboardMonthlyItemDto, DashboardCategoryItemDto, DashboardTopPostDto } from '@workspace/api-server/modules/dashboard';

@Injectable()
export class DashboardService extends BaseDashboardService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getPostEntity(): new () => Record<string, unknown> {
    return Post as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity(): new () => Record<string, unknown> {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }
}
