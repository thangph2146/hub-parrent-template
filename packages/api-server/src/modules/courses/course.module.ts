/**
 * Courses Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCoursesController } from './course.controller';

@Module({})
export class BaseCoursesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseCoursesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseCoursesController } from './course.controller';
export {
  BaseCoursesService,
  type CoursesRowDto,
  type CoursesCreateData,
  type CoursesUpdateData,
} from './course.service';
