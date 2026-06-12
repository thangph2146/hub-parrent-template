/**
 * Port hub-event posts.service.ts → packages/api-server posts-admin.service.ts
 * Chạy một lần khi cập nhật logic từ app; không commit script output tự động nếu không cần.
 */
const fs = require('fs')
const path = require('path')

const SRC = path.join(
  __dirname,
  '../../apps/hub-event/api/src/posts/posts.service.ts',
)
const DEST = path.join(
  __dirname,
  '../../packages/api-server/src/modules/posts/posts-admin.service.ts',
)

let body = fs.readFileSync(SRC, 'utf8')

const header = `/**
 * Posts Admin Service — logic đầy đủ từ apps/hub-event/api (port bằng script-system/api/port-posts-admin.cjs).
 * App binding: extend BasePostsAdminService + wire entity classes.
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  resolveRelationFilters,
  type RelationFiltersConfig,
} from '../../common/resolve-relation-filters';
import {
  normalizePageLimit,
  paginationMeta,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from '../../common/pagination';
import {
  getOptionsFromModel,
  type GetOptionsConfig,
} from '../../common/get-options';
import { safeIsoString, safeIsoStringNow } from '../../common/date-utils';
import { toEntityId, toEntityIdList } from '../../common/entity-id';

`

// Strip app-local imports — giữ từ export interface trở đi
const exportIdx = body.indexOf('export interface PostRowDto')
if (exportIdx < 0) throw new Error('PostRowDto export not found in source')
body = body.slice(exportIdx)

// Fix relation types that referenced entity classes
body = body.replace(
  /type PostCategoryItem = \{ category: Pick<Category, 'id' \| 'name'> \};/,
  'type PostCategoryItem = { category: { id: number; name: string } };',
)
body = body.replace(
  /type PostTagItem = \{ tag: Pick<Tag, 'id' \| 'name'> \};/,
  'type PostTagItem = { tag: { id: number; name: string } };',
)
body = body.replace(
  /type PostWithRelations = Post & \{[\s\S]*?\};/,
  `type PostWithRelations = Record<string, unknown> & {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  published: boolean;
  publishedAt?: Date | string | null;
  eventStartAt?: Date | string | null;
  eventEndAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
  content?: unknown;
  author: { id: number; name: string | null; email: string };
  categories?: PostCategoryItem[];
  tags?: PostTagItem[];
};`,
)

body = body.replace(
  /@Injectable\(\)\r?\nexport class PostsService \{\r?\n  constructor\(private readonly em: EntityManager\) \{\}\r?\n/,
  `@Injectable()
export abstract class BasePostsAdminService {
  protected abstract getEm(): EntityManager;
  protected abstract getPostEntity(): new () => Record<string, unknown>;
  protected abstract getCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getTagEntity(): new () => Record<string, unknown>;
  protected abstract getPostCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getPostTagEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;

  protected resolveRelationEntity(model: string): (new () => object) | undefined {
    if (model === 'category') return this.getCategoryEntity();
    if (model === 'tag') return this.getTagEntity();
    if (model === 'user') return this.getUserEntity();
    if (model === 'post') return this.getPostEntity();
    return undefined;
  }

`,
)

body = body.replace(/\bthis\.em\b/g, 'this.getEm()')

const entityReplacements = [
  [/findOne\(User,/g, 'findOne(this.getUserEntity(),'],
  [/findOne\(Category,/g, 'findOne(this.getCategoryEntity(),'],
  [/findOne\(Tag,/g, 'findOne(this.getTagEntity(),'],
  [/find\(Category,/g, 'find(this.getCategoryEntity(),'],
  [/find\(Tag,/g, 'find(this.getTagEntity(),'],
  [/find\(PostCategory,/g, 'find(this.getPostCategoryEntity(),'],
  [/findOne\(Post,/g, 'findOne(this.getPostEntity(),'],
  [/find\(Post,/g, 'find(this.getPostEntity(),'],
  [/count\(Post,/g, 'count(this.getPostEntity(),'],
  [/nativeDelete\(PostCategory,/g, 'nativeDelete(this.getPostCategoryEntity(),'],
  [/nativeDelete\(PostTag,/g, 'nativeDelete(this.getPostTagEntity(),'],
  [/nativeDelete\(Post,/g, 'nativeDelete(this.getPostEntity(),'],
  [/nativeUpdate\(\s*Post,/g, 'nativeUpdate(this.getPostEntity(),'],
  [/getRepository\(Post\)/g, 'getRepository(this.getPostEntity())'],
  [/new PostCategory\(\)/g, 'new (this.getPostCategoryEntity())()'],
  [/new PostTag\(\)/g, 'new (this.getPostTagEntity())()'],
  [/new Post\(\)/g, 'new (this.getPostEntity())()'],
  [/getReference\(Post,/g, 'getReference(this.getPostEntity(),'],
  [/getReference\(\s*Category,/g, 'getReference(this.getCategoryEntity(),'],
  [/getReference\(\s*Tag,/g, 'getReference(this.getTagEntity(),'],
  [/getReference\(\s*User,/g, 'getReference(this.getUserEntity(),'],
  [/\bCategory,\n/g, 'this.getCategoryEntity(),\n'],
  [/\bTag,\n/g, 'this.getTagEntity(),\n'],
  [/\bPost,\n/g, 'this.getPostEntity(),\n'],
  [/\bPostCategory,\n/g, 'this.getPostCategoryEntity(),\n'],
  [/FilterQuery<Post>/g, 'FilterQuery<object>'],
]

for (const [pattern, replacement] of entityReplacements) {
  body = body.replace(pattern, replacement)
}

body = body.replace(
  /await resolveRelationFilters\(\s*this\.getEm\(\),\s*rawFilters,\s*POST_RELATION_FILTERS,\s*\);/,
  `await resolveRelationFilters(
      this.getEm(),
      rawFilters,
      POST_RELATION_FILTERS,
      (model) => this.resolveRelationEntity(model),
    );`,
)

fs.writeFileSync(DEST, header + body.trim() + '\n')
console.log('Wrote', DEST)
