/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { AdminColumnFiltersConfig } from '../../crud/crud-apply-column-filters';
import {
  columnFilterDateRange,
  columnFilterEntityId,
  columnFilterExact,
  columnFilterText,
} from '../../column-filter-builders';

export const PARENT_STUDENT_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  parent: columnFilterText(['parent', 'name']),
  parentName: columnFilterText(['parent', 'name']),
  parentEmail: columnFilterText(['parent', 'email']),
  student: columnFilterText('studentCode'),
  studentCode: columnFilterText('studentCode'),
  studentName: columnFilterText('studentName'),
  note: columnFilterText('note'),
  status: columnFilterExact('status'),
  createdAt: columnFilterDateRange('createdAt'),
  updatedAt: columnFilterDateRange('updatedAt'),
  id: columnFilterEntityId('id'),
};
