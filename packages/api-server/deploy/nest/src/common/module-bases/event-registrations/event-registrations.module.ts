/**
 * EventRegistrations Module — NestJS wiring cho admin event-registrations.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventRegistrationsController } from './event-registrations.controller';

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

export { BaseEventRegistrationsController } from './event-registrations.controller';
export {
  BaseEventRegistrationsService,
  type EventRegistrationRowDto,
  type ListEventRegistrationsParams,
  type ListEventRegistrationsResult,
  type PublicEventRegistrantDto,
} from './event-registrations.service';
