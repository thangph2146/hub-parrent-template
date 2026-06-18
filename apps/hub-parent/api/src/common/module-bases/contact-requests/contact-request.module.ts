/**
 * ContactRequests Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseContactRequestsController } from './contact-request.controller';
import { BasePublicContactRequestsController } from './public-contact-requests.controller';

@Module({})
export class BaseContactRequestsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseContactRequestsController,
        BasePublicContactRequestsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseContactRequestsController } from './contact-request.controller';
export { BasePublicContactRequestsController } from './public-contact-requests.controller';
export {
  BaseContactRequestsService,
  type ContactRequestsRowDto,
  type ContactRequestsCreateData,
  type ContactRequestsUpdateData,
} from './contact-request.service';
