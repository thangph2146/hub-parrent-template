/**
 * EventSpeakers Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventSpeakersController } from './event-speaker.controller';

@Module({})
export class BaseEventSpeakersModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseEventSpeakersController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseEventSpeakersController } from './event-speaker.controller';
export {
  BaseEventSpeakersService,
  type EventSpeakersRowDto,
  type EventSpeakersCreateData,
  type EventSpeakersUpdateData,
} from './event-speaker.service';
