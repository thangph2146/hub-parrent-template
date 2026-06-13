import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseSystemService } from '@workspace/api-server/modules/system';
import { ormEntities } from '../mikro-orm/orm-entities';
import {
  runSuperadminBootstrap,
  ensureActingUserRoleAfterImport,
  ensureSeedUserRoleLinks,
} from '../seeds/superadmin-bootstrap.runner';

@Injectable()
export class SystemService extends BaseSystemService {
  constructor(em: EntityManager) {
    super(em, ormEntities, {
      runSuperadminBootstrap,
      ensureSeedUserRoleLinks,
      ensureActingUserRoleAfterImport,
    });
  }
}
