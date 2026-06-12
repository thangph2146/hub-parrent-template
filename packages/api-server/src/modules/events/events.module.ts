/**
 * Events Module.
 *
 * Bám sát pattern của `apps/main/api/src/events/events.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventsController } from './event.controller';

@Module({})
export class BaseEventsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseEventsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseEventsController } from './event.controller';
export {
  BaseEventsService,
  type EventsRowDto,
  type EventsCreateData,
  type EventsUpdateData,
} from './event.service';
