/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BaseContactRequestsController } from '../common/module-bases/contact-requests/contact-request.controller';
import { ContactRequestsService } from './contact-requests.service';

@Permissions(PERMISSIONS.CONTACT_REQUESTS_VIEW)
@Controller(ADMIN_ROUTES.CONTACT_REQUESTS)
export class ContactRequestsController extends BaseContactRequestsController {
  constructor(contactRequestsService: ContactRequestsService) {
    super(contactRequestsService);
  }
}
