/**
 * MessageReads Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseMessageReadsController } from './message-read.controller';

@Module({})
export class BaseMessageReadsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseMessageReadsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseMessageReadsController } from './message-read.controller';
export {
  BaseMessageReadsService,
  type MessageReadsRowDto,
  type MessageReadsCreateData,
  type MessageReadsUpdateData,
} from './message-read.service';
