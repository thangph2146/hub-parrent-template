/**
 * Utilities barrel export.
 *
 * Backward-compat layer: re-exports từ `../common/*` để code cũ
 * import `@workspace/api-server/utils/entity-id` vẫn chạy.
 *
 * **Mới nên import từ `@workspace/api-server` (root) hoặc
 * `@workspace/api-server/common/<file>` trực tiếp.**
 *
 * Lưu ý: re-export riêng từng file thay vì `export *` để tránh xung đột
 * với `ADMIN_TABLE_EXPORT_MAX_LIMIT` / `DEFAULT_PAGE_LIMIT` từ common/.
 */
export {
  parseEntityId,
  isEntityId,
  toEntityId,
  toEntityIdList,
  toEntityIdListSafe,
  relationEntityId,
  coerceImportPrimaryKey,
} from '../common/entity-id';
export {
  normalizePageLimit,
  paginationMeta,
  buildPaginationMeta,
  calculateOffset,
  calculateTotalPages,
  isValidPagination,
  getPaginationRange,
} from '../common/pagination';
export {
  toIso,
  toIsoNow,
  parseDateInput,
  normalizeDateInput,
  safeIsoString,
  safeIsoStringNow,
  parseDate,
  isValidDate,
  formatDate,
  formatDateTime,
} from '../common/date-utils';
