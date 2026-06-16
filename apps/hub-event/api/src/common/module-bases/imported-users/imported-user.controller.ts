/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * ImportedUsers Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../crud';
import type {
  ImportedUsersRowDto,
  ImportedUsersCreateData,
  ImportedUsersUpdateData,
} from './imported-user.service';

export type IImportedUsersControllerService = ICrudControllerService<
  ImportedUsersRowDto,
  ImportedUsersCreateData,
  ImportedUsersUpdateData
>;

@ApiTags('ImportedUsers')
export class BaseImportedUsersController extends BaseCrudController<
  ImportedUsersRowDto,
  ImportedUsersCreateData,
  ImportedUsersUpdateData
> {
  constructor(service: IImportedUsersControllerService) {
    super(service, 'imported-users');
  }
}
