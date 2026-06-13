/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseFaceDatasController as PackageFaceDataController } from '@workspace/api-server/modules/face-data';
import { FaceDataService } from './face-data.service';

@ApiTags('FaceData')
export class FaceDataController extends PackageFaceDataController {
  constructor(@Inject(FaceDataService) faceDataService: FaceDataService) {
    super(faceDataService);
  }
}
