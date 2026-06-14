/**
 * Majors Module.
 *
 * Bám sát pattern của `apps/main/api/src/majors/majors.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseMajorsController } from './major.controller';

@Module({})
export class BaseMajorsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseMajorsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseMajorsController } from './major.controller';
export {
  BaseMajorsService,
  type MajorsRowDto,
  type MajorsCreateData,
  type MajorsUpdateData,
} from './major.service';
