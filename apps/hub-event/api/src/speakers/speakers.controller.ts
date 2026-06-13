/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseSpeakersController as PackageSpeakersController } from '@workspace/api-server/modules/speakers';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { SpeakersService } from './speakers.service';

@ApiTags('Speakers')
@Controller(ADMIN_ROUTES.SPEAKERS)
@Permissions(PERMISSIONS.SPEAKERS_VIEW)
export class SpeakersController extends PackageSpeakersController {
  constructor(@Inject(SpeakersService) speakersService: SpeakersService) {
    super(speakersService);
  }
}
