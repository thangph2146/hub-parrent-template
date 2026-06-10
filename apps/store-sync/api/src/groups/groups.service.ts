import { Injectable, Logger } from '@nestjs/common';
import { toEntityId, toEntityIdList, relationEntityId } from '../common/entity-id';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Group } from '../entities/group.entity';
import { GroupMember, GroupRole } from '../entities/group-member.entity';
import { Message } from '../entities/message.entity';
import { MessageRead } from '../entities/message-read.entity';
import { User } from '../entities/user.entity';

export interface CreateGroupInput {
  name: string;
  description?: string | null;
  avatar?: string | null;
  memberIds: string[];
}

export interface ListGroupsInput {
  page: number;
  limit: number;
  search?: string;
  includeDeleted?: boolean;
}

function mapGroupWithMembers(group: Group) {
  return {
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    avatar: group.avatar ?? null,
    createdById: relationEntityId(group.creator),
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    deletedAt: group.deletedAt?.toISOString() ?? null,
    members: (group.members || []).map((m: any) => ({
      id: m.id,
      groupId: relationEntityId(m.group),
      userId: relationEntityId(m.user),
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      leftAt: m.leftAt?.toISOString() ?? null,
      user: m.user,
    })),
    memberCount: (group.members || []).length,
  };
}

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(private readonly em: EntityManager) {}

  async create(createdById: string, input: CreateGroupInput) {
    const { name, description, avatar, memberIds } = input;
    const nameTrim = (name ?? '').trim();
    if (!nameTrim) {
      throw new Error('Tên nhóm là bắt buộc');
    }
    const existing = await this.em.findOne(Group, {
      name: nameTrim,
      deletedAt: null,
      members: { user: toEntityId(createdById), leftAt: null },
    });
    if (existing) {
      throw new Error('Đã tồn tại nhóm với tên này. Vui lòng chọn tên khác.');
    }
    const uniqueIds = Array.from(
      new Set([createdById, ...(memberIds ?? []).filter(Boolean)]),
    );

    const group = new Group();
    group.name = nameTrim;
    group.description = description?.trim() || null;
    group.avatar = avatar?.trim() || null;
    group.creator = this.em.getReference(User, toEntityId(createdById));
    this.em.persist(group);
    await this.em.flush();

    for (const userId of uniqueIds) {
      const member = new GroupMember();
      member.group = this.em.getReference(Group, group.id);
      member.user = this.em.getReference(User, toEntityId(userId));
      member.role = userId === createdById ? GroupRole.OWNER : GroupRole.MEMBER;
      member.joinedAt = new Date();
      this.em.persist(member);
    }
    await this.em.flush();

    const groupWithMembers = await this.em.findOne(
      Group,
      { id: group.id },
      { populate: ['members', 'members.user', 'creator'] },
    );

    if (!groupWithMembers) {
      throw new Error('Không tìm thấy nhóm sau khi tạo');
    }

    return mapGroupWithMembers(groupWithMembers);
  }

  async list(userId: string, input: ListGroupsInput) {
    const { page, limit, search, includeDeleted } = input;
    const where: Record<string, unknown> = {
      members: { user: toEntityId(userId), leftAt: null },
    };
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (search?.trim()) {
      const term = search.trim();
      where.$or = [
        { name: { $like: `%${term}%` } },
        { description: { $like: `%${term}%` } },
      ];
    }
    const [data, total] = await Promise.all([
      this.em.find(Group, where as FilterQuery<Group>, {
        populate: ['members', 'members.user', 'creator'],
        orderBy: { updatedAt: 'DESC' },
        offset: (page - 1) * limit,
        limit,
      }),
      this.em.count(Group, where as FilterQuery<Group>),
    ]);
    return {
      data: data.map(mapGroupWithMembers),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string, userId: string) {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(id),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members', 'members.user', 'creator'] },
    );
    if (!group) return null;
    return mapGroupWithMembers(group);
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; avatar?: string },
  ) {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(id),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] },
    );
    if (!group) return null;
    if (data.name != null) group.name = data.name.trim();
    if (data.description !== undefined)
      group.description = data.description?.trim() || null;
    if (data.avatar !== undefined) group.avatar = data.avatar?.trim() || null;
    this.em.persist(group);
    await this.em.flush();
    const updated = await this.em.findOne(
      Group,
      { id: toEntityId(id) },
      { populate: ['members', 'members.user', 'creator'] },
    );
    return updated ? mapGroupWithMembers(updated) : null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(id),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] },
    );
    if (!group) return false;
    group.deletedAt = new Date();
    this.em.persist(group);
    await this.em.flush();
    return true;
  }

  async restore(id: string, userId: string): Promise<boolean> {
    void userId; // Reserved for future permission check
    const group = await this.em.findOne(Group, { id: toEntityId(id) });
    if (!group || !group.deletedAt) return false;
    group.deletedAt = null;
    this.em.persist(group);
    await this.em.flush();
    return true;
  }

  async hardDelete(id: string, userId: string): Promise<boolean> {
    void userId; // Reserved for future permission check
    const group = await this.em.findOne(Group, { id: toEntityId(id) });
    if (!group) return false;
    this.em.remove(group);
    await this.em.flush();
    return true;
  }

  async addMembers(
    groupId: string,
    userId: string,
    memberIds: string[],
  ): Promise<boolean> {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] },
    );
    if (!group) return false;
    const gid = toEntityId(groupId);
    const existing = await this.em.find(
      GroupMember,
      { group: gid, leftAt: null },
      { fields: ['user'] },
    );
    const existingIds = new Set(
      existing
        .map((m) => relationEntityId(m.user))
        .filter((id): id is number => id != null),
    );
    const toAdd = memberIds
      .map((id) => toEntityId(id))
      .filter((id) => !existingIds.has(id));
    if (toAdd.length === 0) return true;
    for (const uid of toAdd) {
      const member = new GroupMember();
      member.group = this.em.getReference(Group, gid);
      member.user = this.em.getReference(User, uid);
      member.role = GroupRole.MEMBER;
      member.joinedAt = new Date();
      this.em.persist(member);
    }
    await this.em.flush();
    return true;
  }

  async removeMember(
    groupId: string,
    userId: string,
    memberUserId: string,
  ): Promise<boolean> {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] },
    );
    if (!group) return false;
    const member = await this.em.findOne(GroupMember, {
      group: toEntityId(groupId),
      user: toEntityId(memberUserId),
      leftAt: null,
    });
    if (!member) return false;
    member.leftAt = new Date();
    this.em.persist(member);
    await this.em.flush();
    return true;
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    memberUserId: string,
    role: 'ADMIN' | 'MEMBER',
  ): Promise<boolean> {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] },
    );
    if (!group) return false;
    const members = group.members || [];
    const uid = toEntityId(userId);
    const targetUid = toEntityId(memberUserId);
    const currentMember = members.find((m) => relationEntityId(m.user) === uid);
    const targetMember = members.find(
      (m) => relationEntityId(m.user) === targetUid,
    );
    if (!currentMember || !targetMember) return false;
    if (currentMember.role !== GroupRole.OWNER) return false;
    if (targetMember.role === GroupRole.OWNER) return false;
    const newRole = role === 'ADMIN' ? GroupRole.ADMIN : GroupRole.MEMBER;
    const member = await this.em.findOne(GroupMember, {
      id: targetMember.id,
    });
    if (!member) return false;
    member.role = newRole;
    this.em.persist(member);
    await this.em.flush();
    return true;
  }

  async markRead(groupId: string, userId: string): Promise<boolean> {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] },
    );
    if (!group) return false;
    const gid = toEntityId(groupId);
    const messages = await this.em.find(
      Message,
      { group: gid, deletedAt: null },
      { fields: ['id'] },
    );
    const messageIds = messages.map((m) => m.id);
    const existing = await this.em.find(
      MessageRead,
      { user: toEntityId(userId), message: { $in: messageIds } },
      { fields: ['message'] },
    );
    const existingIds = new Set(
      existing
        .map((r) => relationEntityId(r.message))
        .filter((id): id is number => id != null),
    );
    const toCreate = messages.filter((m) => !existingIds.has(m.id));
    if (toCreate.length > 0) {
      for (const m of toCreate) {
        const read = new MessageRead();
        read.message = this.em.getReference(Message, m.id);
        read.user = this.em.getReference(User, toEntityId(userId));
        this.em.persist(read);
      }
      await this.em.flush();
    }
    return true;
  }

  async getMessages(
    groupId: string,
    userId: string,
    limit: number = 100,
  ): Promise<
    Array<{
      id: number;
      content: string;
      senderId: number | null;
      receiverId: number | null;
      timestamp: string;
      isRead: boolean;
      replyToId: number | null;
    }>
  > {
    const group = await this.em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] },
    );
    if (!group) return [];
    const gid = toEntityId(groupId);
    const messages = await this.em.find(
      Message,
      { group: gid, deletedAt: null },
      {
        orderBy: { createdAt: 'ASC' },
        limit,
        populate: ['sender', 'receiver', 'parent'],
      },
    );
    const messageIds = messages.map((m) => m.id);
    const reads = await this.em.find(
      MessageRead,
      { user: toEntityId(userId), message: { $in: messageIds } },
      { fields: ['message'] },
    );
    const readSet = new Set(
      reads
        .map((r) => relationEntityId(r.message))
        .filter((id): id is number => id != null),
    );
    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderId: relationEntityId(m.sender),
      receiverId: relationEntityId(m.receiver),
      timestamp: m.createdAt.toISOString(),
      isRead: readSet.has(m.id),
      replyToId: relationEntityId(m.parent),
    }));
  }
}
