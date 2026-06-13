/**
 * Sessions module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseSessionsService,
  BaseSessionsService as BaseSessionsAdminService,
} from './sessions.service';
export {
  BaseSessionsController,
  BaseSessionsController as BaseSessionsAdminController,
} from './sessions.controller';
export type { ISessionsControllerService } from './sessions.controller';
/** @deprecated Dùng `ISessionsControllerService`. */
export type { ISessionsControllerService as ISessionsAdminControllerService } from './sessions.controller';
export type {
  SessionRowDto,
  ListSessionsParams,
  ListSessionsResult,
  AccountWithSessionStatusDto,
  ListAccountsWithSessionStatusParams,
  ListAccountsWithSessionStatusResult,
} from './sessions.service';
export type { ISessionsSocketGateway, ISessionsSocketGateway as ISessionsAdminSocketGateway } from './sessions.controller';
export { BaseSessionsModule } from './sessions.module';
