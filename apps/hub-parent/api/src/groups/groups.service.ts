/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { Message } from '../entities/message.entity';
import { MessageRead } from '../entities/message-read.entity';
import { User } from '../entities/user.entity';
import { BaseGroupsService } from '../common/module-bases/groups/group.service';

export type {
  CreateGroupInput,
  ListGroupsInput,
  GroupWithMembersDto,
  GroupMessageDto,
} from '../common/module-bases/groups/group.service';

@Injectable()
export class GroupsService extends BaseGroupsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Group as unknown as new () => Record<string, unknown>;
  }

  protected getGroupMemberEntity() {
    return GroupMember as unknown as new () => Record<string, unknown>;
  }

  protected getMessageEntity() {
    return Message as unknown as new () => Record<string, unknown>;
  }

  protected getMessageReadEntity() {
    return MessageRead as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }
}
