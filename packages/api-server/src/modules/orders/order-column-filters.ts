import type { AdminColumnFiltersConfig } from '../../common/apply-column-filters';
import {
  columnFilterDateRange,
  columnFilterExact,
  columnFilterNumberRange,
} from '../../common/column-filter-builders';

export const ORDER_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  status: columnFilterExact('status'),
  totalAmount: columnFilterNumberRange('totalAmount'),
  createdAt: columnFilterDateRange('createdAt'),
};
