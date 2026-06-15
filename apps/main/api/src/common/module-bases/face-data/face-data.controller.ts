/**
 * FaceDatas Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import type {
  FaceDatasRowDto,
  FaceDatasCreateData,
  FaceDatasUpdateData,
} from './face-data.service';

export type IFaceDatasControllerService = ICrudControllerService<
  FaceDatasRowDto,
  FaceDatasCreateData,
  FaceDatasUpdateData
>;

@ApiTags('FaceDatas')
export class BaseFaceDatasController extends BaseCrudController<
  FaceDatasRowDto,
  FaceDatasCreateData,
  FaceDatasUpdateData
> {
  constructor(service: IFaceDatasControllerService) {
    super(service, 'facedatas');
  }
}
