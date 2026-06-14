import type { AdminColumnFiltersConfig } from '../../common/apply-column-filters';
import {
  columnFilterBoolean,
  columnFilterDateRange,
  columnFilterEntityId,
  columnFilterNumber,
  columnFilterText,
} from '../../common/column-filter-builders';

export const EVENT_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  title: columnFilterText('title'),
  slug: columnFilterText('slug'),
  organizer: columnFilterText('organizer'),
  location: columnFilterText('location'),
  address: columnFilterText('address'),
  startDate: columnFilterDateRange('startDate'),
  endDate: columnFilterDateRange('endDate'),
  format: columnFilterNumber('format'),
  status: columnFilterNumber('status'),
  isFeatured: columnFilterBoolean('isFeatured'),
  featuredOrder: columnFilterNumber('featuredOrder'),
  totalRegistrations: columnFilterNumber('totalRegistrations'),
  totalCheckins: columnFilterNumber('totalCheckins'),
  totalCheckouts: columnFilterNumber('totalCheckouts'),
  checkinCameraName: columnFilterText(['checkinCamera', 'name']),
  checkoutCameraName: columnFilterText(['checkoutCamera', 'name']),
  checkinCameraId: columnFilterEntityId('checkinCamera'),
  checkoutCameraId: columnFilterEntityId('checkoutCamera'),
  createdAt: columnFilterDateRange('createdAt'),
  updatedAt: columnFilterDateRange('updatedAt'),
  deletedAt: columnFilterDateRange('deletedAt'),
  id: columnFilterEntityId('id'),
};
