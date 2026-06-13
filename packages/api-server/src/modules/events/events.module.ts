/**
 * Events Module — NestJS wiring cho admin events.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventsController } from './events.controller';

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

export { BaseEventsController } from './events.controller';
export {
  BaseEventsService,
  type EventRowDto,
  type ListEventsParams,
  type ListEventsResult,
} from './events.service';
