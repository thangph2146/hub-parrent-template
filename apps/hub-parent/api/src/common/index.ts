/** Main API common — local utilities + app modules + CRUD/module bases. */
/** AUTO: pnpm main-api:materialize-bases */
export * from './api-response';
export * from './bulk-actions';
export * from './column-filter-builders';
export * from './date-utils';
export * from './entity-id';
export * from './event-time-status';
export * from './fs-unlink-retry';
export * from './get-options';
export * from './image-processor';
export * from './normalize-relation-ids';
export * from './pagination';
export * from './parse-column-filters';
export * from './parse-list-query';
export * from './permissions.decorator';
export * from './permissions.guard';
export * from './poster-normalize';
export * from './resolve-relation-filters';
export {
  buildAdminListCrudParams,
  type AdminListQueryInput,
  type StandardAdminListParams,
  type StandardAdminListResult,
  type AdminCrudControllerConfig,
  type IAdminCrudControllerService,
  type ICrudControllerService,
  type CrudRowDto,
  type ListCrudParams,
} from './crud';
export * from './admin';
export * from './infra';
export * from './app';
