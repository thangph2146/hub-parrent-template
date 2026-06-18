/**
 * Generic CRUD Types.
 *
 * Types dùng chung cho mọi module CRUD. Mỗi entity-specific module
 * (posts, comments, categories, ...) có thể extend các type này nếu
 * cần thêm field riêng.
 */
import type { BaseEntity, PaginationInput } from './common.types';

/**
 * Default row DTO trả về cho client. Subclass có thể thay bằng DTO
 * riêng có thêm field (vd PostRowDto, CommentRowDto).
 */
export interface CrudRowDto extends BaseEntity {
  /** Override signature - concrete module sẽ định nghĩa các field cụ thể. */
  [key: string]: unknown;
}

/**
 * List query parameters cho CRUD.
 */
export interface ListCrudParams extends PaginationInput {
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  /**
   * Free-form column filters (key → value/array of values).
   */
  filters?: Record<string, string | string[]>;
  /**
   * Sort by field (mặc định `updatedAt`).
   */
  sortBy?: string;
  /**
   * Sort direction.
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Result of a bulk operation.
 */
export interface BulkOperationResult {
  /** Số record thành công. */
  success: number;
  /** Số record thất bại. */
  failed: number;
  /** Tổng số record được yêu cầu. */
  total: number;
  /** Chi tiết lỗi theo id (nếu có). */
  errors?: Array<{ id: string | number; error: string }>;
  /** Thông điệp trả về từ bulk action (vd. "Đã xóa 5 thẻ"). */
  message?: string;
}

/**
 * Field descriptor cho admin table / form generator.
 *
 * Module nào cần expose field metadata cho admin UI (filter, sort, display)
 * có thể build từ descriptor này.
 */
export interface CrudFieldDescriptor {
  /** Tên field trong entity (snake_case hoặc camelCase). */
  name: string;
  /** Label hiển thị cho admin UI. */
  label: string;
  /** Kiểu dữ liệu. */
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'enum' | 'relation';
  /** Có searchable không. */
  searchable?: boolean;
  /** Có filterable không. */
  filterable?: boolean;
  /** Có sortable không. */
  sortable?: boolean;
  /** Giá trị enum (nếu type = 'enum'). */
  enumValues?: string[];
  /** Quan hệ entity (nếu type = 'relation'). */
  relation?: {
    entity: string;
    displayField: string;
  };
}

/**
 * Configuration cho create operation (override trong subclass).
 */
export interface CrudCreateData {
  [key: string]: unknown;
}

/**
 * Configuration cho update operation (override trong subclass).
 */
export interface CrudUpdateData {
  [key: string]: unknown;
}
