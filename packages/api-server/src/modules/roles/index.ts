/**
 * Roles Module barrel export.
 */
export {
  BaseRolesService,
  BaseRolesController,
  BaseRolesModule,
} from './roles.module';

export type { IRolesControllerService } from './role.controller';

export type {
  RolesRowDto,
  RolesCreateData,
  RolesUpdateData,
} from './role.service';
