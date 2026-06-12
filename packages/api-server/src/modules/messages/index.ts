/**
 * Messages Module barrel export.
 */
export {
  BaseMessagesService,
  BaseMessagesController,
  BaseMessagesModule,
} from './messages.module';

export type { IMessagesControllerService } from './message.controller';

export type {
  MessagesRowDto,
  MessagesCreateData,
  MessagesUpdateData,
} from './message.service';
