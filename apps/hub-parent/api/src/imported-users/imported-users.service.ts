/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ImportedUser } from '../entities/imported-user.entity';
import { BaseImportedUsersService } from '../common/module-bases/imported-users/imported-user.service';
export type {
  ImportedUsersRowDto,
  ImportedUsersCreateData,
  ImportedUsersUpdateData,
} from '../common/module-bases/imported-users/imported-user.service';

@Injectable()
export class ImportedUsersService extends BaseImportedUsersService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return ImportedUser as unknown as new () => Record<string, unknown>;
  }
}
