/**
 * EventCheckins Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventCheckinsController } from './event-checkin.controller';

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

export { BaseEventCheckinsController } from './event-checkin.controller';
export {
  BaseEventCheckinsService,
  type EventCheckinsRowDto,
  type EventCheckinsCreateData,
  type EventCheckinsUpdateData,
} from './event-checkin.service';
