/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Sessions Module — NestJS wiring cho admin sessions.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseSessionsController } from './sessions.controller';

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

export { BaseSessionsController } from './sessions.controller';
export {
  BaseSessionsService,
  type SessionRowDto,
  type ListSessionsParams,
  type ListSessionsResult,
  type AccountWithSessionStatusDto,
  type ListAccountsWithSessionStatusParams,
  type ListAccountsWithSessionStatusResult,
} from './sessions.service';
