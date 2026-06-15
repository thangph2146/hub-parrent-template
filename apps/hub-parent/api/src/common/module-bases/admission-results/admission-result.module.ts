/**
 * AdmissionResults Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseAdmissionResultsController } from './admission-result.controller';

@Module({})
export class BaseAdmissionResultsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseAdmissionResultsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseAdmissionResultsController } from './admission-result.controller';
export {
  BaseAdmissionResultsService,
  type AdmissionResultsRowDto,
  type AdmissionResultsCreateData,
  type AdmissionResultsUpdateData,
} from './admission-result.service';
