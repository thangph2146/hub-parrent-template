/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Post } from '../entities/post.entity';
import { PostCategory } from '../entities/post-category.entity';
import { PostTag } from '../entities/post-tag.entity';
import { User } from '../entities/user.entity';
import { BasePostsService } from '../common/module-bases/posts/posts.service';
export type {
  PostRowDto,
  PostDetailDto,
  ListPostsParams,
  ListPostsResult,
} from '../common/module-bases/posts/posts.service';

@Injectable()
export class PostsService extends BasePostsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getPostEntity() {
    return Post as unknown as new () => Record<string, unknown>;
  }

  protected getCategoryEntity() {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }

  protected getTagEntity() {
    return PostTag as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity() {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }

  protected getPostTagEntity() {
    return PostTag as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }
}
