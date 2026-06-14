/**
 * EventCheckins Module — NestJS wiring cho admin event-checkins.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventCheckinsController } from './event-checkins.controller';

@Module({})
export class BaseEventCheckinsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseEventCheckinsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseEventCheckinsController } from './event-checkins.controller';
export {
  BaseEventCheckinsService,
  type EventCheckinRowDto,
  type ListEventCheckinsParams,
  type ListEventCheckinsResult,
} from './event-checkins.service';
