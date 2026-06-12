/**
 * Events Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventsController } from './event.controller';

@Module({})
export class BaseEventsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseEventsController],
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
