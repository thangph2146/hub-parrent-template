/**
 * Posts Module Types.
 */
import type { BulkOperationResult } from '../../module-types';

export interface PostActivityLog {
  postId: string | number;
  action: 'create' | 'update' | 'delete' | 'restore' | 'bulk';
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface PostsModuleConfig {
  softDelete?: boolean;
  defaultLimit?: number;
  maxLimit?: number;
  searchFields?: string[];
  filterFields?: string[];
  enableOptions?: boolean;
}

export type PostBulkActionResult = BulkOperationResult & {
  action: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive';
  totalRequested: number;
};

export type {
  PostRowDto,
  PostDetailDto,
  ListPostsParams,
  ListPostsResult,
} from './posts.service';
