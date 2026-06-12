/**
 * Messages Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseMessagesController } from './message.controller';

@Module({})
export class BaseMessagesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseMessagesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseMessagesController } from './message.controller';
export {
  BaseMessagesService,
  type MessagesRowDto,
  type MessagesCreateData,
  type MessagesUpdateData,
} from './message.service';
