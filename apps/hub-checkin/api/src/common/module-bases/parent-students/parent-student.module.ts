/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * ParentStudents Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import {
  BaseParentMyStudentsController,
  BaseParentStudentsController,
} from './parent-student.controller';

@Module({})
export class BaseParentStudentsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseParentStudentsController,
        BaseParentMyStudentsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export {
  BaseParentStudentsController,
  BaseParentMyStudentsController,
} from './parent-student.controller';
export {
  BaseParentStudentsService,
  type ParentStudentsRowDto,
  type AddParentStudentInput,
  type ListParentStudentsResult,
} from './parent-student.service';
