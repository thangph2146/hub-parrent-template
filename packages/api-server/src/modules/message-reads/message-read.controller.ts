/**
 * MessageReads Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  MessageReadsRowDto,
  MessageReadsCreateData,
  MessageReadsUpdateData,
} from './message-read.service';

export type IMessageReadsControllerService = ICrudControllerService<
  MessageReadsRowDto,
  MessageReadsCreateData,
  MessageReadsUpdateData
>;

@ApiTags('MessageReads')
export class BaseMessageReadsController extends BaseCrudController<
  MessageReadsRowDto,
  MessageReadsCreateData,
  MessageReadsUpdateData
> {
  constructor(service: IMessageReadsControllerService) {
    super(service, 'message-reads');
  }
}
