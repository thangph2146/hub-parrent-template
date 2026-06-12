import 'reflect-metadata';
import { EntityManager } from '@mikro-orm/core';
import { Module } from '@nestjs/common';
import {
  createCrudModule,
  createCrudService,
  createCrudController,
  type CrudModuleConfig,
} from './crud-factory';
import { BaseCrudService } from './base-crud.service';
import { BaseCrudController } from './base-crud.controller';
import type { CrudRowDto } from '../types';

class TestEntity {
  id!: number;
  title = '';
  deletedAt: Date | null = null;
  createdAt = new Date();
  updatedAt = new Date();
}

class TestRow implements CrudRowDto {
  id!: number;
  title = '';
  deletedAt: string | null = null;
  createdAt = new Date().toISOString();
  updatedAt = new Date().toISOString();
}

class TestService extends BaseCrudService<TestRow> {
  constructor(private readonly em: EntityManager) {
    super('TestService');
  }
  protected getEm(): EntityManager { return this.em; }
  protected getEntity(): new () => Record<string, unknown> { return TestEntity; }
  protected getEntityName(): string { return 'TestEntity'; }
  protected getSearchFields(): string[] { return ['title']; }
}

class TestController extends BaseCrudController<TestRow> {
  constructor(service: TestService) {
    super(service, 'tests');
  }
}

describe('createCrudModule', () => {
  it('returns a class with @Module decorator applied', () => {
    const config: CrudModuleConfig<TestService, TestController> = {
      serviceClass: TestService,
      controllerClass: TestController,
      pathPrefix: 'tests',
    };

    const ModuleClass = createCrudModule(config);

    expect(ModuleClass).toBeDefined();
    expect(typeof ModuleClass).toBe('function');

    const metadata = (Reflect.getMetadata('imports', ModuleClass) as unknown[]) ?? [];
    const controllers = (Reflect.getMetadata('controllers', ModuleClass) as unknown[]) ?? [];
    const providers = (Reflect.getMetadata('providers', ModuleClass) as unknown[]) ?? [];
    const exportsList = (Reflect.getMetadata('exports', ModuleClass) as unknown[]) ?? [];

    expect(controllers).toContain(TestController);
    expect(providers).toContain(TestService);
    expect(exportsList).toContain(TestService);
  });

  it('generated module has forRoot static method', () => {
    const config: CrudModuleConfig<TestService, TestController> = {
      serviceClass: TestService,
      controllerClass: TestController,
      pathPrefix: 'tests',
    };

    const ModuleClass = createCrudModule(config) as unknown as { forRoot: Function; metadata: object };
    expect(typeof ModuleClass.forRoot).toBe('function');
  });

  it('forRoot returns DynamicModule with extra imports/providers', () => {
    const config: CrudModuleConfig<TestService, TestController> = {
      serviceClass: TestService,
      controllerClass: TestController,
      pathPrefix: 'tests',
      metadata: {
        imports: [],
      },
    };

    const ModuleClass = createCrudModule(config) as unknown as { forRoot: Function };
    const dynamicModule = ModuleClass.forRoot({ providers: [], imports: [] });

    expect(dynamicModule.module).toBeDefined();
    expect(dynamicModule.controllers).toContain(TestController);
    expect(dynamicModule.providers).toContain(TestService);
    expect(dynamicModule.exports).toContain(TestService);
    expect(dynamicModule.global).toBe(false);
  });

  it('forRoot merges metadata imports', () => {
    class ExtraModule {}

    const config: CrudModuleConfig<TestService, TestController> = {
      serviceClass: TestService,
      controllerClass: TestController,
      pathPrefix: 'tests',
      metadata: {
        imports: [ExtraModule as never],
      },
    };

    const ModuleClass = createCrudModule(config) as unknown as { forRoot: Function };
    const dynamicModule = ModuleClass.forRoot();

    expect(dynamicModule.imports).toContain(ExtraModule);
  });

  it('metadata has static metadata getter', () => {
    const config: CrudModuleConfig<TestService, TestController> = {
      serviceClass: TestService,
      controllerClass: TestController,
      pathPrefix: 'tests',
    };

    const ModuleClass = createCrudModule(config) as unknown as { metadata: object };
    expect(ModuleClass.metadata).toBeDefined();
  });

  it('reserved pathPrefix does not break module creation', () => {
    const config: CrudModuleConfig<TestService, TestController> = {
      serviceClass: TestService,
      controllerClass: TestController,
      pathPrefix: 'custom-path',
    };

    expect(() => createCrudModule(config)).not.toThrow();
  });
});

describe('createCrudService', () => {
  it('returns a class that extends BaseCrudService', () => {
    const ServiceClass = createCrudService({
      entity: TestEntity,
      entityName: 'TestEntity',
      searchFields: ['title'],
      filterableFields: ['isActive'],
    });

    const instance = new ServiceClass({} as EntityManager);
    expect(instance).toBeInstanceOf(BaseCrudService);
  });

  it('generated service has correct entity name', () => {
    const ServiceClass = createCrudService({
      entity: TestEntity,
      entityName: 'CustomEntity',
    });

    const mockEm = {
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findOne: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
    } as unknown as EntityManager;

    const instance = new ServiceClass(mockEm);
    expect(instance['getEntityName']()).toBe('CustomEntity');
  });

  it('generated service uses default primary key and soft delete fields', () => {
    const ServiceClass = createCrudService({
      entity: TestEntity,
      entityName: 'TestEntity',
    });

    const instance = new ServiceClass({} as EntityManager);
    expect(instance['getPrimaryKeyField']()).toBe('id');
    expect(instance['getSoftDeleteField']()).toBe('deletedAt');
  });

  it('generated service respects custom softDeleteField', () => {
    const ServiceClass = createCrudService({
      entity: TestEntity,
      entityName: 'TestEntity',
      softDeleteField: null,
    });

    const instance = new ServiceClass({} as EntityManager);
    expect(instance['getSoftDeleteField']()).toBeNull();
  });

  it('generated service returns configured search and filterable fields', () => {
    const ServiceClass = createCrudService({
      entity: TestEntity,
      entityName: 'TestEntity',
      searchFields: ['title', 'slug'],
      filterableFields: ['published'],
    });

    const instance = new ServiceClass({} as EntityManager);
    expect(instance['getSearchFields']()).toEqual(['title', 'slug']);
    expect(instance['getFilterableFields']()).toEqual(['published']);
  });

  it('generated service.getEm returns the injected EntityManager', () => {
    const ServiceClass = createCrudService({
      entity: TestEntity,
      entityName: 'TestEntity',
    });

    const mockEm = {} as EntityManager;
    const instance = new ServiceClass(mockEm);
    expect(instance['getEm']()).toBe(mockEm);
  });
});

describe('createCrudController', () => {
  it('returns a class that extends BaseCrudController', () => {
    const ControllerClass = createCrudController('tests');
    const mockService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      hardDelete: jest.fn(),
      bulk: jest.fn(),
    };

    const instance = new ControllerClass(mockService);
    expect(instance).toBeInstanceOf(BaseCrudController);
  });

  it('injects service via constructor', () => {
    const ControllerClass = createCrudController<TestRow>('tests');
    const mockService = {
      list: jest.fn(async () => ({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      hardDelete: jest.fn(),
      bulk: jest.fn(),
    };

    const instance = new ControllerClass(mockService);
    expect(instance['service']).toBe(mockService);
  });

  it('controller can call service methods through BaseCrudController', async () => {
    const ControllerClass = createCrudController<TestRow>('tests');
    const mockService = {
      list: jest.fn(async () => ({
        data: [{ id: 1, title: 'test', deletedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      hardDelete: jest.fn(),
      bulk: jest.fn(),
    };

    const instance = new ControllerClass(mockService);
    const result = await instance.list({});
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect((result.data as { data: unknown[] }).data).toHaveLength(1);
  });
});
