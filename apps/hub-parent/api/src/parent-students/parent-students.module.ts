import { Module, forwardRef } from '@nestjs/common';
import { ParentStudentsService } from './parent-students.service';
import {
  ParentStudentsPublicController,
  ParentStudentsAdminController,
} from './parent-students.controller';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [forwardRef(() => SocketModule)],
  controllers: [ParentStudentsPublicController, ParentStudentsAdminController],
  providers: [ParentStudentsService],
  exports: [ParentStudentsService],
})
export class ParentStudentsModule {}
