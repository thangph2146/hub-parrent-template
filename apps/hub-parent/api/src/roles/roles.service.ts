/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { isProtectedAdminEmail } from '../config/protected-admin';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { BaseRolesService } from '../common/module-bases/roles/role.service';

export type {
  RolesRowDto,
  ListRolesParams,
  ListRolesResult,
  RolesCreateData,
  RolesUpdateData,
} from '../common/module-bases/roles/role.service';

/** @deprecated Dùng `RolesRowDto` từ module-bases. */
export type RoleRowDto =
  import('../common/module-bases/roles/role.service').RolesRowDto;

@Injectable()
export class RolesService extends BaseRolesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected isProtectedAdminEmail(email: string | null | undefined): boolean {
    return isProtectedAdminEmail(email);
  }
}
