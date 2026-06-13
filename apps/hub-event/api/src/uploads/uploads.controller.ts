/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseUploadsController as PackageUploadsController } from '@workspace/api-server/modules/uploads';
import { UploadsService } from './uploads.service';

export class UploadsController extends PackageUploadsController {
  constructor(@Inject(UploadsService) uploadsService: UploadsService) {
    super(uploadsService);
  }
}
