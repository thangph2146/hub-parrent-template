/**
 * BasePostsController — HTTP admin posts (@workspace/api-server).
 *
 * Kế thừa `BaseAdminCrudController`; app binding inject `PostsService`.
 */
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { BaseAdminCrudController } from '../../bases/base-admin-crud.controller';
import {
  Permissions,
  parseAdminListLimit,
  normalizeRelationIds,
  isBulkAction,
  type BulkAction,
} from '../../common';
import { ADMIN_ROUTES, PERMISSIONS } from '../../config';
import type {
  BasePostsService,
  ListPostsParams,
  ListPostsResult,
  PostRowDto,
} from './posts.service';

export type IPostsControllerService = Pick<
  BasePostsService,
  | 'list'
  | 'getOptions'
  | 'getDatesWithPosts'
  | 'getById'
  | 'create'
  | 'update'
  | 'bulkSetCategories'
  | 'bulkClearImages'
  | 'bulk'
  | 'hardDelete'
  | 'softDelete'
  | 'restore'
>;

/** @deprecated Dùng `IPostsControllerService`. */
export type IPostsAdminControllerService = IPostsControllerService;

type PostBulkAction =
  | BulkAction
  | 'set-categories'
  | 'clear-images';

const POST_EXTRA_BULK = new Set<PostBulkAction>([
  'set-categories',
  'clear-images',
]);

function isPostBulkAction(action: string): action is PostBulkAction {
  return isBulkAction(action) || POST_EXTRA_BULK.has(action as PostBulkAction);
}

@ApiTags('Posts')
@Permissions(PERMISSIONS.POSTS_VIEW)
@Controller(ADMIN_ROUTES.POSTS)
export class BasePostsController extends BaseAdminCrudController<
  PostRowDto,
  ListPostsParams,
  ListPostsResult,
  IPostsControllerService
> {
  constructor(service: IPostsControllerService) {
    super(service, { entityLabel: 'bài viết', listDefaultLimit: 10 });
  }

  @Get('options')
  @ApiOperation({ summary: 'Get post options for dropdowns' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiQuery({ name: 'column', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async options(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query('column') column?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const options = await this.service.getOptions(
      column ?? 'title',
      search?.trim(),
      parseAdminListLimit(limit, 50),
    );
    return this.sendSuccess(res, options);
  }

  @Get('dates-with-posts')
  @ApiOperation({ summary: 'Get dates with posts' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getDatesWithPosts(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const dates = await this.service.getDatesWithPosts();
    return this.sendSuccess(res, { dates });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleGetById(res, headers, id);
  }

  @Post()
  @Permissions(PERMISSIONS.POSTS_CREATE)
  @ApiOperation({ summary: 'Create new post' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    if (!title || !slug) {
      return this.sendError(res, 'title và slug là bắt buộc', 400);
    }

    const created = await this.service.create(userId, {
      title,
      slug,
      content: body.content ?? {},
      excerpt: (body.excerpt as string | null | undefined) ?? null,
      image: (body.image as string | null | undefined) ?? null,
      published: Boolean(body.published),
      publishedAt: (body.publishedAt as string | null | undefined) ?? null,
      eventStartAt: (body.eventStartAt as string | null | undefined) ?? null,
      eventEndAt: (body.eventEndAt as string | null | undefined) ?? null,
      categoryIds: normalizeRelationIds(body.categoryIds) ?? [],
      tagIds: normalizeRelationIds(body.tagIds) ?? [],
    });
    return this.sendSuccess(res, created, { status: 201 });
  }

  @Put(':id')
  @Permissions(PERMISSIONS.POSTS_UPDATE)
  @ApiOperation({ summary: 'Update post by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    try {
      const updated = await this.service.update(id, {
        title:
          typeof body.title === 'string' ? body.title.trim() : undefined,
        slug: typeof body.slug === 'string' ? body.slug.trim() : undefined,
        content: body.content,
        excerpt: body.excerpt as string | null | undefined,
        image: body.image as string | null | undefined,
        published: body.published as boolean | undefined,
        publishedAt: body.publishedAt as string | null | undefined,
        eventStartAt: body.eventStartAt as string | null | undefined,
        eventEndAt: body.eventEndAt as string | null | undefined,
        categoryIds: normalizeRelationIds(body.categoryIds),
        tagIds: normalizeRelationIds(body.tagIds),
        authorId:
          typeof body.authorId === 'string' ? body.authorId.trim() : undefined,
      });
      if (!updated) return this.sendNotFound(res);
      return this.sendSuccess(res, updated);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Lỗi server khi cập nhật bài viết';
      const status =
        message.includes('không hợp lệ') || message.includes('không tồn tại')
          ? 400
          : 500;
      return this.sendError(res, message, status);
    }
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.POSTS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on posts' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  override async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: { action?: string; ids?: string[] },
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const action = body?.action;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || !isPostBulkAction(action)) {
      return this.sendError(res, 'Action không hợp lệ', 400);
    }

    if (action === 'set-categories') {
      const categoryIds =
        normalizeRelationIds(
          (body as { categoryIds?: unknown }).categoryIds,
        ) ?? [];
      const modeRaw = (body as { mode?: string }).mode;
      const mode = modeRaw === 'add' ? ('add' as const) : ('replace' as const);
      const result = await this.service.bulkSetCategories(
        ids,
        categoryIds,
        mode,
      );
      return this.sendSuccess(
        res,
        { affected: result.affected, message: result.message },
        { message: result.message },
      );
    }

    if (action === 'clear-images') {
      const result = await this.service.bulkClearImages(ids);
      return this.sendSuccess(
        res,
        { affected: result.affected, message: result.message },
        { message: result.message },
      );
    }

    return super.bulk(res, headers, { action, ids });
  }

  @Permissions(PERMISSIONS.POSTS_MANAGE)
  @Delete(':id/hard-delete')
  override hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    return super.hardDelete(res, headers, id);
  }

  @Permissions(PERMISSIONS.POSTS_DELETE)
  @Delete(':id')
  override softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    return super.softDelete(res, headers, id);
  }

  @Permissions(PERMISSIONS.POSTS_RESTORE)
  @Post(':id/restore')
  override restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    return super.restore(res, headers, id);
  }
}
