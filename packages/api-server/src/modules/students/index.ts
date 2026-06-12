/**
 * Students Module barrel export.
 */
export {
  BaseStudentsService,
  BaseStudentsController,
  BaseStudentsModule,
} from './students.module';

export type { IStudentsControllerService } from './student.controller';

export type {
  StudentsRowDto,
  StudentsCreateData,
  StudentsUpdateData,
} from './student.service';
