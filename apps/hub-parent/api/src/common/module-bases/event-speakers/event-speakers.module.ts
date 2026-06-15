/**
 * EventSpeakers Module — NestJS wiring cho admin event-speakers.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventSpeakersController } from './event-speakers.controller';

@Module({})
export class BaseEventSpeakersModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseEventSpeakersController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseEventSpeakersController } from './event-speakers.controller';
export {
  BaseEventSpeakersService,
  type EventSpeakerRowDto,
  type ListEventSpeakersParams,
  type ListEventSpeakersResult,
} from './event-speakers.service';
