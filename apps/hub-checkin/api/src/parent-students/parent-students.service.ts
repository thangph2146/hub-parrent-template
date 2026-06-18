/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AdminRealtimeBroadcastService } from '../common/admin/realtime/broadcast.service';
import { ParentStudent } from '../entities/parent-student.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import {
  BaseParentStudentsService,
  type ParentStudentsRealtimePort,
} from '../common/module-bases/parent-students/parent-student.service';

export type {
  ParentStudentsRowDto,
  ListParentStudentsResult,
  AddParentStudentInput,
} from '../common/module-bases/parent-students/parent-student.service';

/** @deprecated Dùng `ParentStudentsRowDto`. */
export type ParentStudentRowDto =
  import('../common/module-bases/parent-students/parent-student.service').ParentStudentsRowDto;

@Injectable()
export class ParentStudentsService extends BaseParentStudentsService {
  constructor(
    private readonly em: EntityManager,
    private readonly adminRealtime: AdminRealtimeBroadcastService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return ParentStudent as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getStudentEntity() {
    return Student as unknown as new () => Record<string, unknown>;
  }

  protected getAdminRealtime(): ParentStudentsRealtimePort {
    return this.adminRealtime;
  }
}
