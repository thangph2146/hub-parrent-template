/**
 * Base Users Controller
 *
 * Abstract base controller for user management API endpoints.
 * Extend this class in your app to implement with your specific service.
 *
 * @example
 * ```typescript
 * // In your app's users.controller.ts
 * @ApiTags('Users')
 * @Controller('users')
 * @Permissions(PERMISSIONS.USERS_VIEW)
 * export class UsersController extends BaseUsersController {
 *   constructor(
 *     protected readonly usersService: UsersService,
 *   ) {
 *     super(usersService);
 *   }
 * }
 * ```
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
  Headers,
  Res,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import type {
  CreateUserData,
  UpdateUserData,
  ListUsersParams,
  PaginatedResult,
  UserRowDto,
  BulkOperationResult,
} from '../../types';
import type {
  UserOption,
  DevLoginOptionDto,
  DevLoginOptionsQuery,
} from './users.service';
import { parseAdminListLimit } from '../../common/parse-list-query';

/**
 * DTOs for request/response
 */
export class CreateUserDto implements CreateUserData {
  email!: string;
  name?: string | null;
  password!: string;
  bio?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  citizenId?: string | null;
  isActive?: boolean;
  roleIds?: string[];
}

export class UpdateUserDto implements UpdateUserData {
  email?: string;
  name?: string | null;
  password?: string;
  bio?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  citizenId?: string | null;
  isActive?: boolean;
  roleIds?: string[];
}

export class BulkActionDto {
  action!: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive';
  ids!: string[];
}

/**
 * Response helper interface
 */
interface ResponseHelper {
  statusCode: number;
  body: {
    success: boolean;
    data?: unknown;
    error?: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  };
}

/**
 * List query parameters
 */
interface ListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  filter?: Record<string, string>;
}

/**
 * Base Users Controller
 * Provides common HTTP endpoints for user management
 */
@Controller()
@ApiTags('Users')
export class BaseUsersController {
  protected readonly logger: Logger;
  protected readonly listStatuses = new Set(['active', 'deleted', 'all']);
  protected readonly bulkActions = new Set([
    'delete',
    'restore',
    'hard-delete',
    'active',
    'unactive',
  ]);

  constructor(
    protected readonly service: {
      list(params: ListUsersParams): Promise<PaginatedResult<UserRowDto>>;
      getById(id: string): Promise<UserRowDto | null>;
      getOptions(column: string, search?: string, limit?: number): Promise<UserOption[]>;
      create(data: CreateUserData): Promise<UserRowDto>;
      update(id: string, data: UpdateUserData, actorEmail?: string | null): Promise<UserRowDto | null>;
      softDelete(id: string): Promise<boolean>;
      restore(id: string): Promise<boolean>;
      hardDelete(id: string): Promise<boolean>;
      bulk(
        action: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive',
        ids: string[],
      ): Promise<BulkOperationResult>;
      listDevelopmentLoginOptions(query?: DevLoginOptionsQuery): Promise<DevLoginOptionDto[]>;
      resolveActorEmail(userId: string): Promise<string | null>;
    },
  ) {
    this.logger = new Logger(BaseUsersController.name);
  }

  /**
   * Create success response
   */
  protected createSuccessResponse<T>(
    data: T,
    options?: { statusCode?: number },
  ): ResponseHelper {
    return {
      statusCode: options?.statusCode ?? 200,
      body: {
        success: true,
        data,
      },
    };
  }

  /**
   * Create error response
   */
  protected createErrorResponse(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      details?: Record<string, unknown>;
    },
  ): ResponseHelper {
    return {
      statusCode: options?.statusCode ?? 500,
      body: {
        success: false,
        error: {
          code: options?.code ?? 'INTERNAL_ERROR',
          message,
          details: options?.details,
        },
      },
    };
  }

  /**
   * Parse list status from query
   */
  protected parseListStatus(input?: string): 'active' | 'deleted' | 'all' {
    if (input && this.listStatuses.has(input)) {
      return input as 'active' | 'deleted' | 'all';
    }
    return 'active';
  }

  /**
   * Parse pagination from query
   */
  protected parsePagination(
    page?: string | number,
    limit?: string | number,
    defaultLimit = 10,
  ): { page: number; limit: number } {
    return {
      page: Math.max(1, parseInt(String(page ?? 1), 10) || 1),
      limit: parseAdminListLimit(limit, defaultLimit),
    };
  }

  /**
   * Parse filters from query
   */
  protected parseFilters(query: ListQuery): Record<string, string> {
    const filters: Record<string, string> = {};

    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('filter[') && key.endsWith(']')) {
        const filterKey = key.slice(7, -1);
        const stringValue = Array.isArray(value)
          ? value[0]?.toString() ?? ''
          : value?.toString() ?? '';
        if (stringValue) {
          filters[filterKey] = stringValue;
        }
      }
    }

    return filters;
  }

  /**
   * Check if value is bulk action
   */
  protected isBulkAction(value: string): value is 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive' {
    return this.bulkActions.has(value as 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive');
  }

  /**
   * List users with pagination
   */
  @Get()
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiHeader({ name: 'X-User-Id', required: true, description: 'User ID of the requester' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'deleted', 'all'] })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing X-User-Id header' })
  async list(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query() query?: ListQuery,
  ): Promise<Response> {
    this.logger.log(
      `list page=${page ?? 1} limit=${limit ?? 10} status=${status ?? 'active'}`,
    );

    if (!userIdHeader?.trim()) {
      const { statusCode, body } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(body);
    }

    const filters = this.parseFilters(query ?? {});

    const pagination = this.parsePagination(page, limit, 10);
    const result = await this.service.list({
      page: pagination.page,
      limit: pagination.limit,
      search: search?.trim(),
      status: this.parseListStatus(status),
      filters: Object.keys(filters).length ? filters : undefined,
    });

    const { statusCode, body } = this.createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  /**
   * Get user options for dropdowns
   */
  @Get('options')
  @ApiOperation({ summary: 'Get user options for dropdowns' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiQuery({ name: 'column', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Options retrieved successfully' })
  async options(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Query('column') column?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<Response> {
    this.logger.log(`options column=${column ?? 'email'}`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(body);
    }

    const pagination = this.parsePagination(undefined, limit, 50);
    const options = await this.service.getOptions(
      column ?? 'email',
      search?.trim(),
      pagination.limit,
    );

    const { statusCode, body } = this.createSuccessResponse(options);
    return res.status(statusCode).json(body);
  }

  /**
   * Development login options
   */
  @Get('dev-login-options')
  @ApiOperation({ summary: 'Get development login options' })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Login options retrieved successfully' })
  async devLoginOptions(
    @Res() res: Response,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ): Promise<Response> {
    this.logger.log(`devLoginOptions role=${role ?? 'all'}`);

    const options = await this.service.listDevelopmentLoginOptions({
      role: role?.trim(),
      search: search?.trim(),
    });

    const { statusCode, body } = this.createSuccessResponse(options);
    return res.status(statusCode).json(body);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Param('id') id?: string,
  ): Promise<Response> {
    this.logger.log(`getById id=${id}`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(body);
    }

    if (!id) {
      const { statusCode, body } = this.createErrorResponse(
        'Thiếu ID người dùng',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(body);
    }

    const row = await this.service.getById(id);

    if (!row) {
      const { statusCode, body } = this.createErrorResponse(
        'Không tìm thấy người dùng',
        { statusCode: 404 },
      );
      return res.status(statusCode).json(body);
    }

    const { statusCode, body } = this.createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  /**
   * Create new user
   */
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Body() body?: Partial<CreateUserDto>,
  ): Promise<Response> {
    this.logger.log(`create user`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(errorBody);
    }

    if (!body?.email?.trim()) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'email là bắt buộc',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }
    if (!body?.password || typeof body.password !== 'string') {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'password là bắt buộc',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }

    try {
      // Validate actor for admin restrictions
      await this.service.resolveActorEmail(userIdHeader);
      const result = await this.service.create({
        email: body.email.trim(),
        name: body.name?.trim() ?? null,
        password: body.password,
        bio: body.bio ?? null,
        avatar: body.avatar ?? null,
        phone: body.phone ?? null,
        address: body.address ?? null,
        citizenId: body.citizenId ?? null,
        isActive: body.isActive ?? true,
        roleIds: body.roleIds,
      });

      const { statusCode, body: successBody } = this.createSuccessResponse(
        result,
        { statusCode: 201 },
      );
      return res.status(statusCode).json(successBody);
    } catch (error) {
      this.logger.error(`create failed: ${error}`);
      if (error instanceof ForbiddenException) {
        const { statusCode, body: errorBody } = this.createErrorResponse(
          error.message,
          { statusCode: 403 },
        );
        return res.status(statusCode).json(errorBody);
      }
      const { statusCode, body: errorBody } = this.createErrorResponse(
        error instanceof Error ? error.message : 'Tạo người dùng thất bại',
        { statusCode: 500 },
      );
      return res.status(statusCode).json(errorBody);
    }
  }

  /**
   * Update existing user
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update existing user' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Param('id') id?: string,
    @Body() body?: Partial<UpdateUserDto>,
  ): Promise<Response> {
    this.logger.log(`update id=${id}`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(errorBody);
    }

    if (!id) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu ID người dùng',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }

    try {
      const actorEmail = await this.service.resolveActorEmail(userIdHeader);
      const result = await this.service.update(id, {
        email: body?.email?.trim(),
        name: body?.name?.trim(),
        password: body?.password,
        bio: body?.bio,
        avatar: body?.avatar,
        phone: body?.phone?.trim(),
        address: body?.address?.trim(),
        citizenId: body?.citizenId?.trim(),
        isActive: body?.isActive,
        roleIds: body?.roleIds,
      }, actorEmail);

      if (!result) {
        const { statusCode, body: errorBody } = this.createErrorResponse(
          'Không tìm thấy người dùng',
          { statusCode: 404 },
        );
        return res.status(statusCode).json(errorBody);
      }

      const { statusCode, body: successBody } = this.createSuccessResponse(result);
      return res.status(statusCode).json(successBody);
    } catch (error) {
      this.logger.error(`update failed: ${error}`);
      if (error instanceof ForbiddenException) {
        const { statusCode, body: errorBody } = this.createErrorResponse(
          error.message,
          { statusCode: 403 },
        );
        return res.status(statusCode).json(errorBody);
      }
      const { statusCode, body: errorBody } = this.createErrorResponse(
        error instanceof Error ? error.message : 'Cập nhật người dùng thất bại',
        { statusCode: 500 },
      );
      return res.status(statusCode).json(errorBody);
    }
  }

  /**
   * Bulk action on users
   */
  @Post('bulk')
  @ApiOperation({ summary: 'Perform bulk action on users' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulk(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Body() body?: BulkActionDto,
  ): Promise<Response> {
    this.logger.log(`bulk action=${body?.action}`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(errorBody);
    }

    if (!body?.action || !body?.ids?.length) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Action và ids là bắt buộc',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }

    const bulkAction = body.action as string;
    if (!this.isBulkAction(bulkAction)) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        `Action không hợp lệ: ${bulkAction}`,
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }

    try {
      const result = await this.service.bulk(body.action, body.ids);
      const { statusCode, body: successBody } = this.createSuccessResponse({
        affected: result.success,
        message: result.message,
      });
      return res.status(statusCode).json(successBody);
    } catch (error) {
      this.logger.error(`bulk failed: ${error}`);
      const { statusCode, body: errorBody } = this.createErrorResponse(
        error instanceof Error ? error.message : 'Bulk action thất bại',
        { statusCode: 500 },
      );
      return res.status(statusCode).json(errorBody);
    }
  }

  /**
   * Soft delete user
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async softDelete(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Param('id') id?: string,
  ): Promise<Response> {
    this.logger.log(`softDelete id=${id}`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(errorBody);
    }

    if (!id) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu ID người dùng',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }

    try {
      const result = await this.service.softDelete(id);
      const { statusCode, body: successBody } = this.createSuccessResponse({
        success: result,
        message: result ? 'Xóa người dùng thành công' : 'Không tìm thấy người dùng',
      });
      return res.status(statusCode).json(successBody);
    } catch (error) {
      this.logger.error(`softDelete failed: ${error}`);
      if (error instanceof ForbiddenException) {
        const { statusCode, body: errorBody } = this.createErrorResponse(
          error.message,
          { statusCode: 403 },
        );
        return res.status(statusCode).json(errorBody);
      }
      const { statusCode, body: errorBody } = this.createErrorResponse(
        error instanceof Error ? error.message : 'Xóa người dùng thất bại',
        { statusCode: 500 },
      );
      return res.status(statusCode).json(errorBody);
    }
  }

  /**
   * Restore soft-deleted user
   */
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  async restore(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Param('id') id?: string,
  ): Promise<Response> {
    this.logger.log(`restore id=${id}`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(errorBody);
    }

    if (!id) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu ID người dùng',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }

    try {
      const result = await this.service.restore(id);
      const { statusCode, body: successBody } = this.createSuccessResponse({
        success: result,
        message: result ? 'Khôi phục người dùng thành công' : 'Không tìm thấy người dùng',
      });
      return res.status(statusCode).json(successBody);
    } catch (error) {
      this.logger.error(`restore failed: ${error}`);
      const { statusCode, body: errorBody } = this.createErrorResponse(
        error instanceof Error ? error.message : 'Khôi phục người dùng thất bại',
        { statusCode: 500 },
      );
      return res.status(statusCode).json(errorBody);
    }
  }

  /**
   * Hard delete user
   */
  @Delete(':id/hard-delete')
  @ApiOperation({ summary: 'Permanently delete user' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  async hardDelete(
    @Res() res: Response,
    @Headers('x-user-id') userIdHeader?: string,
    @Param('id') id?: string,
  ): Promise<Response> {
    this.logger.log(`hardDelete id=${id}`);

    if (!userIdHeader?.trim()) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu header X-User-Id',
        { statusCode: 401 },
      );
      return res.status(statusCode).json(errorBody);
    }

    if (!id) {
      const { statusCode, body: errorBody } = this.createErrorResponse(
        'Thiếu ID người dùng',
        { statusCode: 400 },
      );
      return res.status(statusCode).json(errorBody);
    }

    try {
      const result = await this.service.hardDelete(id);
      const { statusCode, body: successBody } = this.createSuccessResponse({
        success: result,
        message: result ? 'Xóa vĩnh viễn người dùng thành công' : 'Không tìm thấy người dùng',
      });
      return res.status(statusCode).json(successBody);
    } catch (error) {
      this.logger.error(`hardDelete failed: ${error}`);
      if (error instanceof ForbiddenException) {
        const { statusCode, body: errorBody } = this.createErrorResponse(
          error.message,
          { statusCode: 403 },
        );
        return res.status(statusCode).json(errorBody);
      }
      const { statusCode, body: errorBody } = this.createErrorResponse(
        error instanceof Error ? error.message : 'Xóa vĩnh viễn người dùng thất bại',
        { statusCode: 500 },
      );
      return res.status(statusCode).json(errorBody);
    }
  }
}
