/**
 * Majors Module barrel export.
 */
export {
  BaseMajorsService,
  BaseMajorsController,
  BaseMajorsModule,
} from './majors.module';

export type { IMajorsControllerService } from './major.controller';

export type {
  MajorsRowDto,
  MajorsCreateData,
  MajorsUpdateData,
} from './major.service';
