/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Courses Module.
 *
 * Bám sát pattern của `apps/main/api/src/courses/courses.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCoursesController } from './course.controller';

@Module({})
export class BaseCoursesModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseCoursesController,
      ],
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
