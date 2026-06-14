/**
 * Students Module.
 *
 * Bám sát pattern của `apps/main/api/src/students/students.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseStudentsController } from './student.controller';

@Module({})
export class BaseStudentsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseStudentsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseStudentsController } from './student.controller';
export {
  BaseStudentsService,
  type StudentsRowDto,
  type StudentsCreateData,
  type StudentsUpdateData,
} from './student.service';
