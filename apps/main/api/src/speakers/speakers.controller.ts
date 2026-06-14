/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseSpeakersController } from '../common/module-bases/speakers/speaker.controller';
import { SpeakersService } from './speakers.service';

@Permissions(PERMISSIONS.SPEAKERS_VIEW)
@Controller(ADMIN_ROUTES.SPEAKERS)
export class SpeakersController extends BaseSpeakersController {
  constructor(service: SpeakersService) {
    super(service);
  }
}
