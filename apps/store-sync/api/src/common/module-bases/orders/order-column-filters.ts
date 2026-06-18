import type { AdminColumnFiltersConfig } from '../../crud/crud-apply-column-filters';
import {
  columnFilterDateRange,
  columnFilterExact,
  columnFilterNumberRange,
} from '../../column-filter-builders';

export const ORDER_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  status: columnFilterExact('status'),
  totalAmount: columnFilterNumberRange('totalAmount'),
  createdAt: columnFilterDateRange('createdAt'),
};
