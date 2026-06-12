/**
 * Departments Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseDepartmentsController } from './department.controller';

@Module({})
export class BaseDepartmentsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseDepartmentsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseDepartmentsController } from './department.controller';
export {
  BaseDepartmentsService,
  type DepartmentsRowDto,
  type DepartmentsCreateData,
  type DepartmentsUpdateData,
} from './department.service';
