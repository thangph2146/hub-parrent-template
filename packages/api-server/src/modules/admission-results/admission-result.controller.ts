/**
 * AdmissionResults Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  AdmissionResultsRowDto,
  AdmissionResultsCreateData,
  AdmissionResultsUpdateData,
} from './admission-result.service';

export type IAdmissionResultsControllerService = ICrudControllerService<
  AdmissionResultsRowDto,
  AdmissionResultsCreateData,
  AdmissionResultsUpdateData
>;

@ApiTags('AdmissionResults')
export class BaseAdmissionResultsController extends BaseCrudController<
  AdmissionResultsRowDto,
  AdmissionResultsCreateData,
  AdmissionResultsUpdateData
> {
  constructor(service: IAdmissionResultsControllerService) {
    super(service, 'admission-results');
  }
}
