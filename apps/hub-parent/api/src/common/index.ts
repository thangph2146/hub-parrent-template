/** Barrel common — template local (pnpm api:sync-template). */
/**
 * Common Barrel Export.
 *
 * Bám sát pattern `apps/main/api/src/common/`.
 *
 * Export tất cả common utilities, decorators, guards, configs.
 */
export * from './api-response';
export * from './entity-id';
export * from './pagination';
export * from './date-utils';
export * from './bulk-actions';

export * from './parse-list-query';
export * from './parse-column-filters';
export * from './normalize-relation-ids';

export * from './permissions.decorator';
export * from './permissions.guard';
export * from './get-options';
export * from './resolve-relation-filters';
export * from './image-processor';
export * from './fs-unlink-retry';
export * from './poster-normalize';
export * from './event-time-status';

export { buildAdminListCrudParams, type AdminListQueryInput } from './crud/build-admin-list-params';
