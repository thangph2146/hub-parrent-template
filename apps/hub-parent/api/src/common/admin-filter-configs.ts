import type { AdminColumnFiltersConfig } from './apply-column-filters';

const text = (path: string | string[]) => ({ type: 'text' as const, path });
const exact = (path: string | string[]) => ({ type: 'exact' as const, path });
const number = (path: string | string[]) => ({ type: 'number' as const, path });
const numberRange = (path: string | string[]) => ({
  type: 'numberRange' as const,
  path,
});
const dateRange = (path: string | string[]) => ({
  type: 'dateRange' as const,
  path,
});
const boolean = (path: string | string[]) => ({
  type: 'boolean' as const,
  path,
});
const entityId = (path: string | string[]) => ({
  type: 'number' as const,
  path,
});

export const CAMERA_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  linkedEventTitle: text(['linkedEvent', 'title']),
  linkedEventId: entityId('linkedEvent'),
  linkedEventSlug: text(['linkedEvent', 'slug']),
  ipAddress: text('ipAddress'),
  port: number('port'),
  username: text('username'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: exact('id'),
};

export const DEPARTMENT_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  description: text('description'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const LOCATION_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  address: text('address'),
  mapUrl: text('mapUrl'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: exact('id'),
};

export const SCREEN_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const TEMPLATE_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const SPEAKER_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  title: text('title'),
  organization: text('organization'),
  email: text('email'),
  phone: text('phone'),
  bio: text('bio'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: number('id'),
};

export const SEO_META_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  page: text('page'),
  pageKey: text('page'),
  title: text('title'),
  description: text('description'),
  keywords: text('keywords'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const ACADEMIC_YEAR_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  startDate: dateRange('startDate'),
  endDate: dateRange('endDate'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const COURSE_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const MAJOR_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const TRAINING_LEVEL_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const TRAINING_SYSTEM_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  code: text('code'),
  status: number('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const EVENT_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  title: text('title'),
  slug: text('slug'),
  organizer: text('organizer'),
  location: text('location'),
  address: text('address'),
  startDate: dateRange('startDate'),
  endDate: dateRange('endDate'),
  format: number('format'),
  status: number('status'),
  isFeatured: boolean('isFeatured'),
  featuredOrder: number('featuredOrder'),
  totalRegistrations: number('totalRegistrations'),
  totalCheckins: number('totalCheckins'),
  totalCheckouts: number('totalCheckouts'),
  checkinCameraName: text(['checkinCamera', 'name']),
  checkoutCameraName: text(['checkoutCamera', 'name']),
  checkinCameraId: entityId('checkinCamera'),
  checkoutCameraId: entityId('checkoutCamera'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const CATEGORY_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  name: text('name'),
  slug: text('slug'),
  description: text('description'),
  parentId: entityId('parent'),
  type: exact('type'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  deletedAt: dateRange('deletedAt'),
  id: entityId('id'),
};

export const GUIDE_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  sectionKey: text('sectionKey'),
  pageKey: text('pageKey'),
  title: text('content'),
  isVisible: boolean('isVisible'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  id: entityId('id'),
};

export const ORDER_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  status: exact('status'),
  totalAmount: numberRange('totalAmount'),
  createdAt: dateRange('createdAt'),
};

export const PROMO_CODE_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  code: text('code'),
  label: text('label'),
  discountKind: exact('discountKind'),
  minOrderSubtotal: numberRange('minOrderSubtotal'),
  usageCount: numberRange('usageCount'),
  isActive: boolean('isActive'),
};

export const PARENT_STUDENT_COLUMN_FILTERS: AdminColumnFiltersConfig = {
  parent: text(['parent', 'name']),
  parentName: text(['parent', 'name']),
  parentEmail: text(['parent', 'email']),
  student: text('studentCode'),
  studentCode: text('studentCode'),
  studentName: text('studentName'),
  note: text('note'),
  status: exact('status'),
  createdAt: dateRange('createdAt'),
  updatedAt: dateRange('updatedAt'),
  id: entityId('id'),
};
