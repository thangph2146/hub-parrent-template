/**
 * Sessions Module.
 *
 * Bám sát pattern của `apps/main/api/src/sessions/sessions.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseSessionsController } from './session.controller';

@Module({})
export class BaseSessionsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseSessionsController,
      ],
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
