/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Category } from '../entities/category.entity';
import { PostCategory } from '../entities/post-category.entity';
import { BaseCategoriesService } from '../common/module-bases/categories/categories.service';

export type {
  CategoryRowDto,
  ChildCategoryDto,
  RelatedPostDto,
  ListCategoriesParams,
  ListCategoriesResult,
  CategoryCreateData,
  CategoryUpdateData,
  CategoryUsageRow,
} from '../common/module-bases/categories/categories.service';

@Injectable()
export class CategoriesService extends BaseCategoriesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Category as unknown as new () => Record<string, unknown>;
  }

  protected getPostCategoryEntity() {
    return PostCategory as unknown as new () => Record<string, unknown>;
  }
}
