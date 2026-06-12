/**
 * Comments Service.
 *
 * Module quản lý bình luận. Pattern tương tự `BasePostsService`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface CommentRowDto extends CrudRowDto {
  id: number | string;
  content: string;
  postId: number | string;
  authorId: number | string;
  parentId: number | string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CommentCreateData extends CrudCreateData {
  content: string;
  postId: number | string;
  authorId: number | string;
  parentId?: number | string | null;
  isActive?: boolean;
}

export interface CommentUpdateData extends CrudUpdateData {
  content?: string;
  isActive?: boolean;
}

@Injectable()
export abstract class BaseCommentsService extends BaseCrudService<
  CommentRowDto,
  CommentCreateData,
  CommentUpdateData
> {
  protected readonly logger = new Logger(BaseCommentsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'Comment';
  }
  protected getSearchFields(): string[] {
    return ['content'];
  }
  protected getFilterableFields(): string[] {
    return ['postId', 'authorId', 'parentId', 'isActive'];
  }
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }
}
