/** CRUD runtime — template local (pnpm api:sync-template). */
/** Barrel CRUD runtime — kế thừa local trong template NestJS. */
export { BaseStandardAdminCrudService } from './base-standard-admin-crud.service';
export type {
  StandardAdminListParams,
  StandardAdminListResult,
} from './base-standard-admin-crud.service';
export { BaseAdminHttpController } from './base-admin-http.controller';
export {
  BaseAdminCrudController,
  type AdminCrudControllerConfig,
  type IAdminCrudControllerService,
} from './base-admin-crud.controller';
export { buildAdminListCrudParams, type AdminListQueryInput } from './build-admin-list-params';
export { BaseCrudService } from './base-crud.service';
export {
  BaseCrudController,
  type ICrudControllerService,
} from './base-crud.controller';
export type {
  CrudRowDto,
  ListCrudParams,
  BulkOperationResult,
} from './crud.types';
