/** NestJS OOP — extends local Base* (materialize → apps/main/api module-bases). */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseSystemService } from '../common/module-bases/system/system.service';
import { ormEntities } from '../mikro-orm/orm-entities';
import {
  runSuperadminBootstrap,
  ensureActingUserRoleAfterImport,
  ensureSeedUserRoleLinks,
} from '../seeds/superadmin-bootstrap.runner';

@Injectable()
export class SystemService extends BaseSystemService {
  constructor(protected readonly em: EntityManager) {
    super(em, ormEntities, {
      runSuperadminBootstrap,
      ensureSeedUserRoleLinks,
      ensureActingUserRoleAfterImport,
    });
  }
}
