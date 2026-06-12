/**
 * VerificationTokens Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  VerificationTokensRowDto,
  VerificationTokensCreateData,
  VerificationTokensUpdateData,
} from './verification-token.service';

export type IVerificationTokensControllerService = ICrudControllerService<
  VerificationTokensRowDto,
  VerificationTokensCreateData,
  VerificationTokensUpdateData
>;

@ApiTags('VerificationTokens')
export class BaseVerificationTokensController extends BaseCrudController<
  VerificationTokensRowDto,
  VerificationTokensCreateData,
  VerificationTokensUpdateData
> {
  constructor(service: IVerificationTokensControllerService) {
    super(service, 'verification-tokens');
  }
}
