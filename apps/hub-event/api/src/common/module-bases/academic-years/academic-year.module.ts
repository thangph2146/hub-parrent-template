/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * AcademicYears Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseAcademicYearsController } from './academic-year.controller';

@Module({})
export class BaseAcademicYearsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseAcademicYearsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseAcademicYearsController } from './academic-year.controller';
export {
  BaseAcademicYearsService,
  type AcademicYearsRowDto,
  type AcademicYearsCreateData,
  type AcademicYearsUpdateData,
} from './academic-year.service';
