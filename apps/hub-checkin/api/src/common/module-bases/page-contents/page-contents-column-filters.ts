/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { AdminColumnFiltersConfig } from '../../crud/crud-apply-column-filters';
import {
  columnFilterBoolean,
  columnFilterDateRange,
  columnFilterEntityId,
  columnFilterText,
} from '../../column-filter-builders';

export const GUIDE_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  sectionKey: columnFilterText('sectionKey'),
  pageKey: columnFilterText('pageKey'),
  title: columnFilterText('content'),
  isVisible: columnFilterBoolean('isVisible'),
  createdAt: columnFilterDateRange('createdAt'),
  updatedAt: columnFilterDateRange('updatedAt'),
  id: columnFilterEntityId('id'),
};
