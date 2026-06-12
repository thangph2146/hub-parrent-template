/**
 * Sessions Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseSessionsController } from './session.controller';

@Module({})
export class BaseSessionsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseSessionsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseSessionsController } from './session.controller';
export {
  BaseSessionsService,
  type SessionsRowDto,
  type SessionsCreateData,
  type SessionsUpdateData,
} from './session.service';
