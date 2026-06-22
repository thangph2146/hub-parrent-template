/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { BaseStudentsService } from '../common/module-bases/students/student.service';
export type {
  StudentsRowDto,
  StudentsCreateData,
  StudentsUpdateData,
} from '../common/module-bases/students/student.service';

@Injectable()
export class StudentsService extends BaseStudentsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }
}
