import type { AdminColumnFiltersConfig } from '../../common/apply-column-filters';
import {
  columnFilterBoolean,
  columnFilterDateRange,
  columnFilterEntityId,
  columnFilterText,
} from '../../common/column-filter-builders';

export const GUIDE_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  sectionKey: columnFilterText('sectionKey'),
  pageKey: columnFilterText('pageKey'),
  title: columnFilterText('content'),
  isVisible: columnFilterBoolean('isVisible'),
  createdAt: columnFilterDateRange('createdAt'),
  updatedAt: columnFilterDateRange('updatedAt'),
  id: columnFilterEntityId('id'),
};
