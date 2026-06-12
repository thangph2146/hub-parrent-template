/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicPostsService } from '@workspace/api-server/modules/public';
import { Post } from '../entities/post.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class PublicPostsService extends BasePublicPostsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getPostEntity(): new () => Record<string, unknown> {
    return Post as unknown as new () => Record<string, unknown>;
  }

  protected getCategoryEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getTagEntity(): new () => Record<string, unknown> {
    return Tag as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity(): new () => Record<string, unknown> {
    return Setting as unknown as new () => Record<string, unknown>;
  }
}
