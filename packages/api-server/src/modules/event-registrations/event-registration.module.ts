/**
 * EventRegistrations Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventRegistrationsController } from './event-registration.controller';

@Module({})
export class BaseEventRegistrationsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseEventRegistrationsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseEventRegistrationsController } from './event-registration.controller';
export {
  BaseEventRegistrationsService,
  type EventRegistrationsRowDto,
  type EventRegistrationsCreateData,
  type EventRegistrationsUpdateData,
} from './event-registration.service';
