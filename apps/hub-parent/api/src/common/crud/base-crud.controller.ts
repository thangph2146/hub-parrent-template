/** CRUD runtime — template local (pnpm api:sync-template). */
/**
 * Base CRUD Controller.
 *
 * Abstract HTTP controller generic cho mọi entity CRUD. Cung cấp sẵn:
 *   GET    /<path>           - list với pagination + search + filter
 *   GET    /<path>/:id       - getById
 *   POST   /<path>           - create
 *   PUT    /<path>/:id       - update
 *   DELETE /<path>/:id       - soft-delete
 *   POST   /<path>/:id/restore - restore soft-deleted
 *   DELETE /<path>/:id/hard  - hard-delete
 *   POST   /<path>/bulk      - bulk action (delete/restore/hard-delete/active/unactive)
 *
 * Subclass chỉ cần override path prefix và inject service cụ thể.
 *
 * Bám sát pattern `apps/main/api/src/<entity>/<entity>.controller.ts`:
 *   - Dùng `Permissions()` decorator cho permission metadata
 *   - Dùng `createSuccessResponse`/`createErrorResponse` cho response format
 *   - Dùng `parseListQuery` cho query parsing
 *   - Dùng `isBulkAction` cho bulk validation
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type {
  PaginatedResult,
  ListCrudParams,
  BulkOperationResult,
  CrudRowDto,
} from './crud.types';
import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponsePayload,
} from '../api-response';
import { parseListQuery } from '../parse-list-query';
import { isBulkAction, type BulkAction } from '../bulk-actions';
import { Permissions } from '../permissions.decorator';
import { parseEntityId } from '../entity-id';

/**
 * Default list statuses (override trong subclass nếu entity không có soft-delete).
 */
const DEFAULT_LIST_STATUSES = new Set(['active', 'deleted', 'all']);

/**
 * Default bulk actions.
 */
const DEFAULT_BULK_ACTIONS = new Set<BulkAction>([
  'delete',
  'restore',
  'hard-delete',
  'active',
  'unactive',
]);

/**
 * Service contract mà BaseCrudController cần.
 *
 * Subclass truyền concrete service vào qua constructor.
 */
export interface ICrudControllerService<
  TRow extends CrudRowDto = CrudRowDto,
  TCreate extends Record<string, unknown> = Record<string, unknown>,
  TUpdate extends Record<string, unknown> = Record<string, unknown>,
> {
  list(params: ListCrudParams): Promise<PaginatedResult<TRow>>;
  getById(id: string | number): Promise<TRow | null>;
  create(data: TCreate): Promise<TRow>;
  update(id: string | number, data: TUpdate): Promise<TRow | null>;
  softDelete(id: string | number): Promise<boolean>;
  restore(id: string | number): Promise<boolean>;
  hardDelete(id: string | number): Promise<boolean>;
  bulk(
    action: BulkAction,
    ids: Array<string | number>,
  ): Promise<BulkOperationResult>;
}

/** Payload mặc định cho POST `/:id/restore` (đa số entity). */
export type DefaultRestorePayload = { success: boolean; message: string };

/**
 * Base CRUD controller.
 *
 * @example
 * ```typescript
 * @Controller(ADMIN_ROUTES.POSTS)
 * @ApiTags('Posts')
 * @Permissions(PERMISSIONS.POSTS_VIEW)
 * export class BasePostsController extends BaseCrudController {
 *   constructor(service: PostsService) {
 *     super(service, ADMIN_ROUTES.POSTS);
 *   }
 * }
 * ```
 */
@Controller()
@ApiTags('Crud')
export class BaseCrudController<
  TRow extends CrudRowDto = CrudRowDto,
  TCreate extends Record<string, unknown> = Record<string, unknown>,
  TUpdate extends Record<string, unknown> = Record<string, unknown>,
  TRestorePayload extends Record<string, unknown> = DefaultRestorePayload,
> {
  protected readonly logger: Logger;
  protected readonly listStatuses: Set<string>;
  protected readonly bulkActions: Set<BulkAction>;
  protected readonly pathPrefix: string;

  constructor(
    protected readonly service: ICrudControllerService<TRow, TCreate, TUpdate>,
    pathPrefix: string = '',
  ) {
    this.logger = new Logger(this.constructor.name);
    this.listStatuses = DEFAULT_LIST_STATUSES;
    this.bulkActions = DEFAULT_BULK_ACTIONS;
    this.pathPrefix = pathPrefix;
  }

  /**
   * GET /<path> - List với pagination.
   */
  @Get()
  @Permissions()
  @ApiOperation({ summary: 'List entities (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'deleted', 'all'],
  })
  @ApiResponse({ status: 200, description: 'Paginated result' })
  async list(
    @Query() rawQuery: Record<string, unknown> = {},
  ): Promise<ApiResponsePayload<PaginatedResult<TRow>>> {
    const parsed = parseListQuery(rawQuery);
    const params: ListCrudParams = {
      page: parsed.page,
      limit: parsed.limit,
      search: parsed.search,
      status: this.parseStatus(parsed.status),
      filters: parsed.filters,
    };
    const result = await this.service.list(params);
    return createSuccessResponse(result).body;
  }

  /**
   * GET /<path>/:id - Get by id.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get entity by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getById(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<TRow | null>> {
    const numericId = parseEntityId(id);
    const found = await this.service.getById(numericId);
    if (!found) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy bản ghi', { status: 404 }).body,
      );
    }
    return createSuccessResponse(found).body;
  }

  /**
   * POST /<path> - Create mới.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new entity' })
  @ApiResponse({ status: 201, description: 'Created' })
  async create(@Body() body: TCreate): Promise<ApiResponsePayload<TRow>> {
    const created = await this.service.create(body);
    return createSuccessResponse(created, { status: 201 }).body;
  }

  /**
   * PUT /<path>/:id - Update.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update entity' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Param('id') id: string,
    @Body() body: TUpdate,
  ): Promise<ApiResponsePayload<TRow | null>> {
    const numericId = parseEntityId(id);
    const updated = await this.service.update(numericId, body);
    if (!updated) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy bản ghi', { status: 404 }).body,
      );
    }
    return createSuccessResponse(updated).body;
  }

  /**
   * DELETE /<path>/:id - Soft delete.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete entity' })
  @ApiParam({ name: 'id', type: String })
  async softDelete(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<{ success: boolean; message: string }>> {
    const numericId = parseEntityId(id);
    const ok = await this.service.softDelete(numericId);
    if (!ok) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy bản ghi hoặc đã xóa', {
          status: 404,
        }).body,
      );
    }
    return createSuccessResponse({ success: true, message: 'Đã xóa bản ghi' })
      .body;
  }

  /**
   * POST /<path>/:id/restore - Restore soft-deleted.
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft-deleted entity' })
  @ApiParam({ name: 'id', type: String })
  async restore(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<TRestorePayload>> {
    const numericId = parseEntityId(id);
    const ok = await this.service.restore(numericId);
    if (!ok) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy bản ghi', { status: 404 }).body,
      );
    }
    const payload = {
      success: true,
      message: 'Đã khôi phục bản ghi',
    } as unknown as TRestorePayload;
    return createSuccessResponse(payload).body;
  }

  /**
   * DELETE /<path>/:id/hard - Hard delete.
   *
   * Lưu ý: route alias `:id/hard-delete` (khớp với
   * `api-client/src/resources/posts.ts` → `purge()`) cũng được expose
   * để tương thích ngược. Cả hai gọi cùng `service.hardDelete()`.
   */
  @Delete(':id/hard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard delete entity (cannot be restored)' })
  @ApiParam({ name: 'id', type: String })
  async hardDelete(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<{ success: boolean; message: string }>> {
    return this.handleHardDelete(id);
  }

  /**
   * DELETE /<path>/:id/hard-delete - Hard delete (alias cho client `api-client.purge()`).
   */
  @Delete(':id/hard-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Hard delete entity (alias của /:id/hard, dùng cho api-client.purge)',
  })
  @ApiParam({ name: 'id', type: String })
  async hardDeleteAlias(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<{ success: boolean; message: string }>> {
    return this.handleHardDelete(id);
  }

  /**
   * Internal handler: chạy service + map sang envelope.
   */
  private async handleHardDelete(
    id: string,
  ): Promise<ApiResponsePayload<{ success: boolean; message: string }>> {
    const numericId = parseEntityId(id);
    const ok = await this.service.hardDelete(numericId);
    if (!ok) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy bản ghi', { status: 404 }).body,
      );
    }
    return createSuccessResponse({
      success: true,
      message: 'Đã xóa vĩnh viễn bản ghi',
    }).body;
  }

  /**
   * POST /<path>/bulk - Bulk action.
   */
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk action (delete/restore/hard-delete/active/unactive)',
  })
  async bulk(
    @Body() body: { action: string; ids: Array<string | number> },
  ): Promise<ApiResponsePayload<BulkOperationResult>> {
    if (!body || !isBulkAction(body.action)) {
      throw new BadRequestException(
        createErrorResponse('Action không hợp lệ', { status: 400 }).body,
      );
    }
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException(
        createErrorResponse('ids phải là mảng không rỗng', { status: 400 })
          .body,
      );
    }
    const result = await this.service.bulk(body.action, body.ids);
    return createSuccessResponse(result).body;
  }

  // ────────────────────────────────────────────────────────────
  // Protected helpers
  // ────────────────────────────────────────────────────────────

  /**
   * Parse status query param.
   */
  protected parseStatus(input?: string): 'active' | 'deleted' | 'all' {
    if (input && this.listStatuses.has(input)) {
      return input as 'active' | 'deleted' | 'all';
    }
    return 'active';
  }
}
