import { Injectable } from '@nestjs/common';
import { SocketGateway } from '../../../socket/socket.gateway';
import type {
  AdminStatusChangePayload,
  ParentStudentReviewSocketPayload,
} from '../../../socket/socket.types';

/** Broadcast realtime cho admin: đổi trạng thái / thông báo chuẩn. */
@Injectable()
export class AdminRealtimeBroadcastService {
  constructor(private readonly socketGateway: SocketGateway) {}

  statusChanged(payload: AdminStatusChangePayload): void {
    this.socketGateway.emitAdminStatusChange(payload);
  }

  pendingApproval(payload: {
    resource: string;
    id: number;
    status: string;
    title: string;
    description?: string | null;
    actionUrl?: string | null;
    /** Người gửi yêu cầu — không nhận toast admin trùng trên tab của họ. */
    actorUserId?: string;
  }): void {
    this.socketGateway.emitAdminStatusChange({
      resource: payload.resource,
      id: payload.id,
      status: payload.status,
      title: payload.title,
      description: payload.description ?? null,
      actionUrl: payload.actionUrl ?? null,
      actorUserId: payload.actorUserId,
    });
  }

  parentStudentReviewed(payload: ParentStudentReviewSocketPayload): void {
    this.socketGateway.emitParentStudentReview(payload);
  }
}
