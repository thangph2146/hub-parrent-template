/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseFaceDatasController } from '../common/module-bases/face-data/face-data.controller';
import { FaceDataService } from './face-data.service';

@Permissions(PERMISSIONS.FACE_DATA_VIEW)
@Controller(ADMIN_ROUTES.FACE_DATA)
export class FaceDataController extends BaseFaceDatasController {
  constructor(service: FaceDataService) {
    super(service);
  }
}
