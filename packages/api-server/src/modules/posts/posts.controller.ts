/**
 * Posts Controller.
 *
 * HTTP controller CRUD cho `Post` entity. Bám sát pattern của
 * `apps/main/api/src/posts/posts.controller.ts`.
 *
 * Subclass chỉ cần truyền service instance vào constructor - tất cả
 * endpoints (list, getById, create, update, softDelete, restore,
 * hardDelete, bulk) đã có sẵn.
 */
import { Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  PostRowDto,
  PostCreateData,
  PostUpdateData,
} from './posts.service';

/**
 * Service contract cho PostsController.
 */
export type IPostsControllerService = ICrudControllerService<
  PostRowDto,
  PostCreateData,
  PostUpdateData
>;

/**
 * Base Posts Controller.
 *
 * Đường dẫn mặc định: `/posts` (override trong subclass nếu cần prefix khác).
 */
@ApiTags('Posts')
export class BasePostsController extends BaseCrudController<
  PostRowDto,
  PostCreateData,
  PostUpdateData
> {
  constructor(service: IPostsControllerService) {
    super(service, 'posts');
  }

  /**
   * GET /posts/options - Lấy options cho dropdowns (lightweight).
   * Đây là endpoint riêng không có trong BaseCrudController.
   */
  @Get('options')
  @ApiOperation({ summary: 'Get post options for dropdowns' })
  @ApiResponse({ status: 200, description: 'List of post options' })
  async getOptions(
    @Query('column') column: string = 'title',
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<Array<{ label: string; value: string }>> {
    return this.getOptionsInternal(column, search, limit);
  }

  /**
   * Internal helper: trả về options theo column.
   * Subclass có thể override để thêm logic riêng (vd join categories).
   */
  protected async getOptionsInternal(
    column: string,
    search?: string,
    limit?: string,
  ): Promise<Array<{ label: string; value: string }>> {
    // BaseCrudService không có getOptions, subclass override.
    // Trả về [] mặc định.
    void column; void search; void limit;
    return [];
  }
}
