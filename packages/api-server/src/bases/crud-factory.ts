/**
 * CRUD Module Factory.
 *
 * Factory function sinh NestJS module hoàn chỉnh từ config object. Mục đích:
 * giảm boilerplate khi tạo module CRUD cho một entity mới. Cung cấp sẵn:
 *   - Service class (extend `BaseCrudService`)
 *   - Controller class (extend `BaseCrudController`)
 *   - NestJS module metadata (imports/providers/controllers/exports)
 *
 * @example
 * ```typescript
 * // Trong app:
 * import { createCrudModule } from '@workspace/api-server/bases';
 * import { Post } from '../entities/post.entity';
 *
 * export class PostsService extends BaseCrudService {
 *   protected getEntity() { return Post; }
 *   protected getEntityName() { return 'Post'; }
 *   protected getSearchFields() { return ['title', 'slug', 'excerpt']; }
 *   protected getFilterableFields() { return ['published', 'isActive']; }
 * }
 *
 * export class PostsController extends BaseCrudController {
 *   constructor(service: PostsService) {
 *     super(service, 'posts');
 *   }
 * }
 *
 * export const PostsModule = createCrudModule({
 *   serviceClass: PostsService,
 *   controllerClass: PostsController,
 *   pathPrefix: 'posts',
 * });
 * ```
 */
import { Module, type DynamicModule, type ModuleMetadata, type Provider, type Type, type ForwardReference } from '@nestjs/common';
import { BaseCrudService } from './base-crud.service';
import {
  BaseCrudController,
  type ICrudControllerService,
} from './base-crud.controller';
import type {
  CrudRowDto,
  CrudCreateData,
  CrudUpdateData,
} from '../types';

/**
 * Config cho createCrudModule factory.
 */
export interface CrudModuleConfig<
  TService extends BaseCrudService<TRow, TCreate, TUpdate>,
  TController extends BaseCrudController<TRow, TCreate, TUpdate>,
  TRow extends CrudRowDto = CrudRowDto,
  TCreate extends CrudCreateData = CrudCreateData,
  TUpdate extends CrudUpdateData = CrudUpdateData,
> {
  /** Service class (đã extend BaseCrudService). */
  serviceClass: new (...args: never[]) => TService;
  /** Controller class (đã extend BaseCrudController). */
  controllerClass: new (...args: never[]) => TController;
  /**
   * Path prefix cho controller (vd: 'posts', 'comments').
   * Lưu ý: chưa được sử dụng trong implementation hiện tại - reserved cho
   * việc apply `@Controller(prefix)` lên controller class. Subclass nên
   * tự apply decorator.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pathPrefix: string;
  /**
   * Metadata bổ sung (imports, providers, exports).
   * Dùng khi service cần inject thêm module khác (vd NotificationsModule).
   *
   * Lưu ý: chỉ chứa `imports` - controllers/providers/exports đã được
   * build tự động từ `serviceClass`/`controllerClass`. Nếu cần custom
   * providers, tạo module riêng wrap generated module.
   */
  metadata?: Pick<ModuleMetadata, 'imports'>;
}

/**
 * Create NestJS module từ CRUD config.
 *
 * Trả về class `Module` decorator đã apply sẵn providers + controllers.
 * Có thể dùng trực tiếp trong `@Module({})` hoặc extend thêm.
 */
export function createCrudModule<
  TService extends BaseCrudService<TRow, TCreate, TUpdate>,
  TController extends BaseCrudController<TRow, TCreate, TUpdate>,
  TRow extends CrudRowDto = CrudRowDto,
  TCreate extends CrudCreateData = CrudCreateData,
  TUpdate extends CrudUpdateData = CrudUpdateData,
>(
  config: CrudModuleConfig<TService, TController, TRow, TCreate, TUpdate>,
): new () => DynamicModule {
  const { serviceClass, controllerClass, metadata } = config;
  // pathPrefix reserved for future use; controller class should self-apply @Controller.
  void config.pathPrefix;

  // Gắn @Controller(pathPrefix) lên controller class.
  // Lưu ý: nếu controller đã có @Controller decorator thì việc apply lại
  // bị ignore. Subclass nên KHÔNG tự thêm @Controller.
  // (Decorator runtime sẽ merge metadata.)

  // Build module class dynamically.
  class CrudGeneratedModule {
    static forRoot(extra: ModuleMetadata = {}): DynamicModule {
      const mImports: Array<DynamicModule | Type<any> | Promise<DynamicModule> | ForwardReference<any>> =
        ((metadata?.imports ?? []) as Array<DynamicModule>) ?? [];
      const eImports: Array<DynamicModule | Type<any> | Promise<DynamicModule> | ForwardReference<any>> =
        ((extra.imports ?? []) as Array<DynamicModule>) ?? [];
      const mProviders: Provider[] = (extra.providers ?? []) as Provider[] ?? [];
      return {
        module: CrudGeneratedModule,
        imports: [...mImports, ...eImports],
        controllers: [controllerClass],
        providers: [serviceClass, ...mProviders],
        exports: [serviceClass],
        global: false,
      };
    }

    /**
     * Default module - dùng khi import bình thường (không qua forRoot).
     */
    static get metadata(): ModuleMetadata {
      return {
        imports: ((metadata?.imports ?? []) as Array<DynamicModule>),
        controllers: [controllerClass],
        providers: [serviceClass],
        exports: [serviceClass],
      };
    }
  }

  // Apply @Module decorator với metadata mặc định.
  Module(CrudGeneratedModule.metadata as ModuleMetadata)(CrudGeneratedModule);

  // Type the return class as having forRoot static method.
  return CrudGeneratedModule as unknown as new () => DynamicModule;
}

/**
 * Helper: tạo service class nhanh từ config (sử dụng khi entity không có
 * logic đặc biệt, chỉ cần CRUD thuần).
 *
 * @example
 * ```typescript
 * const PostsService = createCrudService({
 *   entity: Post,
 *   entityName: 'Post',
 *   searchFields: ['title', 'slug'],
 * });
 * ```
 */
export interface CrudServiceConfig {
  entity: new () => Record<string, unknown>;
  entityName: string;
  searchFields?: string[];
  filterableFields?: string[];
  primaryKeyField?: string;
  softDeleteField?: string | null;
}

/**
 * Helper factory - tạo service class thuần CRUD cho một entity.
 * Trả về class sẵn sàng inject `EntityManager` qua constructor.
 */
export function createCrudService<
  TRow extends CrudRowDto = CrudRowDto,
  TCreate extends CrudCreateData = CrudCreateData,
  TUpdate extends CrudUpdateData = CrudUpdateData,
>(
  svcConfig: CrudServiceConfig,
): new (em: import('@mikro-orm/core').EntityManager) => BaseCrudService<TRow, TCreate, TUpdate> {
  class GeneratedService extends BaseCrudService<TRow, TCreate, TUpdate> {
    constructor(private readonly em: import('@mikro-orm/core').EntityManager) {
      super(svcConfig.entityName);
    }
    protected getEm(): import('@mikro-orm/core').EntityManager {
      return this.em;
    }
    protected getEntity(): new () => Record<string, unknown> {
      return svcConfig.entity;
    }
    protected getEntityName(): string {
      return svcConfig.entityName;
    }
    protected getPrimaryKeyField(): string {
      return svcConfig.primaryKeyField ?? 'id';
    }
    protected getSoftDeleteField(): string | null {
      return svcConfig.softDeleteField === undefined
        ? 'deletedAt'
        : svcConfig.softDeleteField;
    }
    protected getSearchFields(): string[] {
      return svcConfig.searchFields ?? [];
    }
    protected getFilterableFields(): string[] {
      return svcConfig.filterableFields ?? [];
    }
  }
  return GeneratedService as unknown as new (
    em: import('@mikro-orm/core').EntityManager,
  ) => BaseCrudService<TRow, TCreate, TUpdate>;
}

/**
 * Helper factory - tạo controller class thuần CRUD.
 */
export function createCrudController<
  TRow extends CrudRowDto = CrudRowDto,
  TCreate extends CrudCreateData = CrudCreateData,
  TUpdate extends CrudUpdateData = CrudUpdateData,
>(
  pathPrefix: string,
  // Reserved for future DI token support. Not used currently.
  _serviceToken?: symbol | (new (...args: never[]) => unknown),
): new (
  service: ICrudControllerService<TRow, TCreate, TUpdate>,
) => BaseCrudController<TRow, TCreate, TUpdate> {
  class GeneratedController extends BaseCrudController<TRow, TCreate, TUpdate> {
    constructor(
      service: ICrudControllerService<TRow, TCreate, TUpdate>,
    ) {
      super(service, pathPrefix);
    }
  }
  return GeneratedController as unknown as new (
    service: ICrudControllerService<TRow, TCreate, TUpdate>,
  ) => BaseCrudController<TRow, TCreate, TUpdate>;
}
