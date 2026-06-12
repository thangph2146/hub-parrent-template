/**
 * Bases barrel export
 *
 * Cung cấp các abstract base classes cho service + controller:
 *   - `BaseService` - base cũ (generic, dùng cho module tự định nghĩa)
 *   - `BaseController` - base cũ cho controller
 *   - `BaseCrudService` - base CRUD generic cho MỌI entity (mới)
 *   - `BaseCrudController` - base HTTP controller CRUD generic (mới)
 *   - `createCrudModule` / `createCrudService` / `createCrudController` - factory
 *     sinh module/service/controller hoàn chỉnh từ config.
 */
export * from './base-service.class';
export * from './base-controller.class';
export * from './base-crud.service';
export * from './base-crud.controller';
export * from './crud-factory';
