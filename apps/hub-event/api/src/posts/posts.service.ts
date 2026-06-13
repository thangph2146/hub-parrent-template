/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BasePostsService,
  POSTS_FILTER_CATEGORIES_NONE,
} from '@workspace/api-server/modules/posts';
import { Post } from '../entities/post.entity';
import { PostCategory } from '../entities/post-category.entity';
import { PostTag } from '../entities/post-tag.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';

export type {
  PostRowDto,
  PostDetailDto,
  ListPostsParams,
  ListPostsResult,
} from '@workspace/api-server/modules/posts';
export { POSTS_FILTER_CATEGORIES_NONE };

@Injectable()
export class PostsService extends BasePostsService {
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

  protected getPostCategoryEntity(): new () => Record<string, unknown> {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }

  protected getPostTagEntity(): new () => Record<string, unknown> {
    return PostTag as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }
}
