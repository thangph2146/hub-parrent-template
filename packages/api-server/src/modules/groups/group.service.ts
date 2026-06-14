/**
 * Groups Service — domain logic (materialize → apps/main/api module-bases).
 */
import { Injectable, Logger } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import {
  relationEntityId,
  safeIsoString,
  safeIsoStringNow,
  toEntityId,
} from '../../common';

export const GROUP_ROLE = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
} as const;

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

export interface GroupWithMembersDto {
  id: number;
  name: string;
  description: string | null;
  avatar: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members: Array<{
    id: number;
    groupId: number | null;
    userId: number | null;
    role: unknown;
    joinedAt: string;
    leftAt: string | null;
    user: unknown;
  }>;
  memberCount: number;
}

export interface GroupMessageDto {
  id: number;
  content: string;
  senderId: number | null;
  receiverId: number | null;
  timestamp: string;
  isRead: boolean;
  replyToId: number | null;
}

function mapGroupWithMembers(group: Record<string, unknown>): GroupWithMembersDto {
  const members = (group.members as Record<string, unknown>[] | undefined) ?? [];
  return {
    id: group.id as number,
    name: String(group.name ?? ''),
    description: (group.description as string | null | undefined) ?? null,
    avatar: (group.avatar as string | null | undefined) ?? null,
    createdById: relationEntityId(group.creator),
    createdAt: safeIsoStringNow(group.createdAt as Date | string | null | undefined),
    updatedAt: safeIsoStringNow(group.updatedAt as Date | string | null | undefined),
    deletedAt: safeIsoString(group.deletedAt as Date | string | null | undefined),
    members: members.map((m) => ({
      id: m.id as number,
      groupId: relationEntityId(m.group),
      userId: relationEntityId(m.user),
      role: m.role,
      joinedAt: safeIsoStringNow(m.joinedAt as Date | string | null | undefined),
      leftAt: safeIsoString(m.leftAt as Date | string | null | undefined),
      user: m.user,
    })),
    memberCount: members.length,
  };
}

@Injectable()
export abstract class BaseGroupsService {
  protected readonly logger = new Logger(BaseGroupsService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected abstract getGroupMemberEntity(): new () => Record<string, unknown>;
  protected abstract getMessageEntity(): new () => Record<string, unknown>;
  protected abstract getMessageReadEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;

  async create(
    createdById: string,
    input: CreateGroupInput,
  ): Promise<GroupWithMembersDto> {
    const em = this.getEm();
    const Group = this.getEntity();
    const GroupMember = this.getGroupMemberEntity();
    const User = this.getUserEntity();
    const { name, description, avatar, memberIds } = input;
    const nameTrim = (name ?? '').trim();
    if (!nameTrim) {
      throw new Error('Tên nhóm là bắt buộc');
    }
    const existing = await em.findOne(Group, {
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

    const group = new Group() as Record<string, unknown>;
    group.name = nameTrim;
    group.description = description?.trim() || null;
    group.avatar = avatar?.trim() || null;
    group.creator = em.getReference(User, toEntityId(createdById));
    em.persist(group);
    await em.flush();

    const groupId = group.id as number;
    for (const userId of uniqueIds) {
      const member = new GroupMember() as Record<string, unknown>;
      member.group = em.getReference(Group, groupId);
      member.user = em.getReference(User, toEntityId(userId));
      member.role =
        userId === createdById ? GROUP_ROLE.OWNER : GROUP_ROLE.MEMBER;
      member.joinedAt = new Date();
      em.persist(member);
    }
    await em.flush();

    const groupWithMembers = await em.findOne(
      Group,
      { id: groupId },
      { populate: ['members', 'members.user', 'creator'] as never },
    );

    if (!groupWithMembers) {
      throw new Error('Không tìm thấy nhóm sau khi tạo');
    }

    return mapGroupWithMembers(groupWithMembers as Record<string, unknown>);
  }

  async list(userId: string, input: ListGroupsInput) {
    const em = this.getEm();
    const Group = this.getEntity();
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
    const whereQuery = where as FilterQuery<Record<string, unknown>>;
    const [data, total] = await Promise.all([
      em.find(Group, whereQuery, {
        populate: ['members', 'members.user', 'creator'] as never,
        orderBy: { updatedAt: 'DESC' },
        offset: (page - 1) * limit,
        limit,
      }),
      em.count(Group, whereQuery),
    ]);
    return {
      data: data.map((row) =>
        mapGroupWithMembers(row as Record<string, unknown>),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<GroupWithMembersDto | null> {
    const em = this.getEm();
    const Group = this.getEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(id),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members', 'members.user', 'creator'] as never },
    );
    if (!group) return null;
    return mapGroupWithMembers(group as Record<string, unknown>);
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; avatar?: string },
  ): Promise<GroupWithMembersDto | null> {
    const em = this.getEm();
    const Group = this.getEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(id),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] as never },
    );
    if (!group) return null;
    const row = group as Record<string, unknown>;
    if (data.name != null) row.name = data.name.trim();
    if (data.description !== undefined) {
      row.description = data.description?.trim() || null;
    }
    if (data.avatar !== undefined) row.avatar = data.avatar?.trim() || null;
    em.persist(group);
    await em.flush();
    const updated = await em.findOne(
      Group,
      { id: toEntityId(id) },
      { populate: ['members', 'members.user', 'creator'] as never },
    );
    return updated
      ? mapGroupWithMembers(updated as Record<string, unknown>)
      : null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const em = this.getEm();
    const Group = this.getEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(id),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] as never },
    );
    if (!group) return false;
    (group as Record<string, unknown>).deletedAt = new Date();
    em.persist(group);
    await em.flush();
    return true;
  }

  async restore(id: string, userId: string): Promise<boolean> {
    void userId;
    const em = this.getEm();
    const Group = this.getEntity();
    const group = await em.findOne(Group, { id: toEntityId(id) });
    if (!group) return false;
    const row = group as Record<string, unknown>;
    if (!row.deletedAt) return false;
    row.deletedAt = null;
    em.persist(group);
    await em.flush();
    return true;
  }

  async hardDelete(id: string, userId: string): Promise<boolean> {
    void userId;
    const em = this.getEm();
    const Group = this.getEntity();
    const group = await em.findOne(Group, { id: toEntityId(id) });
    if (!group) return false;
    em.remove(group);
    await em.flush();
    return true;
  }

  async addMembers(
    groupId: string,
    userId: string,
    memberIds: string[],
  ): Promise<boolean> {
    const em = this.getEm();
    const Group = this.getEntity();
    const GroupMember = this.getGroupMemberEntity();
    const User = this.getUserEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] as never },
    );
    if (!group) return false;
    const gid = toEntityId(groupId);
    const existing = await em.find(
      GroupMember,
      { group: gid, leftAt: null },
      { fields: ['user'] },
    );
    const existingIds = new Set(
      existing
        .map((m) => relationEntityId((m as Record<string, unknown>).user))
        .filter((id): id is number => id != null),
    );
    const toAdd = memberIds
      .map((mid) => toEntityId(mid))
      .filter((mid) => !existingIds.has(mid));
    if (toAdd.length === 0) return true;
    for (const uid of toAdd) {
      const member = new GroupMember() as Record<string, unknown>;
      member.group = em.getReference(Group, gid);
      member.user = em.getReference(User, uid);
      member.role = GROUP_ROLE.MEMBER;
      member.joinedAt = new Date();
      em.persist(member);
    }
    await em.flush();
    return true;
  }

  async removeMember(
    groupId: string,
    userId: string,
    memberUserId: string,
  ): Promise<boolean> {
    const em = this.getEm();
    const Group = this.getEntity();
    const GroupMember = this.getGroupMemberEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] as never },
    );
    if (!group) return false;
    const member = await em.findOne(GroupMember, {
      group: toEntityId(groupId),
      user: toEntityId(memberUserId),
      leftAt: null,
    });
    if (!member) return false;
    (member as Record<string, unknown>).leftAt = new Date();
    em.persist(member);
    await em.flush();
    return true;
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    memberUserId: string,
    role: 'ADMIN' | 'MEMBER',
  ): Promise<boolean> {
    const em = this.getEm();
    const Group = this.getEntity();
    const GroupMember = this.getGroupMemberEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] as never },
    );
    if (!group) return false;
    const members =
      ((group as Record<string, unknown>).members as Record<string, unknown>[]) ??
      [];
    const uid = toEntityId(userId);
    const targetUid = toEntityId(memberUserId);
    const currentMember = members.find(
      (m) => relationEntityId(m.user) === uid,
    );
    const targetMember = members.find(
      (m) => relationEntityId(m.user) === targetUid,
    );
    if (!currentMember || !targetMember) return false;
    if (currentMember.role !== GROUP_ROLE.OWNER) return false;
    if (targetMember.role === GROUP_ROLE.OWNER) return false;
    const newRole = role === 'ADMIN' ? GROUP_ROLE.ADMIN : GROUP_ROLE.MEMBER;
    const member = await em.findOne(GroupMember, {
      id: targetMember.id,
    });
    if (!member) return false;
    (member as Record<string, unknown>).role = newRole;
    em.persist(member);
    await em.flush();
    return true;
  }

  async markRead(groupId: string, userId: string): Promise<boolean> {
    const em = this.getEm();
    const Group = this.getEntity();
    const Message = this.getMessageEntity();
    const MessageRead = this.getMessageReadEntity();
    const User = this.getUserEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] as never },
    );
    if (!group) return false;
    const gid = toEntityId(groupId);
    const messages = await em.find(
      Message,
      { group: gid, deletedAt: null },
      { fields: ['id'] },
    );
    const messageIds = messages.map((m) => (m as Record<string, unknown>).id as number);
    const existing = await em.find(
      MessageRead,
      { user: toEntityId(userId), message: { $in: messageIds } },
      { fields: ['message'] },
    );
    const existingIds = new Set(
      existing
        .map((r) => relationEntityId((r as Record<string, unknown>).message))
        .filter((id): id is number => id != null),
    );
    const toCreate = messages.filter(
      (m) => !existingIds.has((m as Record<string, unknown>).id as number),
    );
    if (toCreate.length > 0) {
      for (const m of toCreate) {
        const read = new MessageRead() as Record<string, unknown>;
        read.message = em.getReference(
          Message,
          (m as Record<string, unknown>).id as number,
        );
        read.user = em.getReference(User, toEntityId(userId));
        em.persist(read);
      }
      await em.flush();
    }
    return true;
  }

  async getMessages(
    groupId: string,
    userId: string,
    limit: number = 100,
  ): Promise<GroupMessageDto[]> {
    const em = this.getEm();
    const Group = this.getEntity();
    const Message = this.getMessageEntity();
    const MessageRead = this.getMessageReadEntity();
    const group = await em.findOne(
      Group,
      {
        id: toEntityId(groupId),
        deletedAt: null,
        members: { user: toEntityId(userId), leftAt: null },
      },
      { populate: ['members'] as never },
    );
    if (!group) return [];
    const gid = toEntityId(groupId);
    const messages = await em.find(
      Message,
      { group: gid, deletedAt: null },
      {
        orderBy: { createdAt: 'ASC' },
        limit,
        populate: ['sender', 'receiver', 'parent'] as never,
      },
    );
    const messageIds = messages.map(
      (m) => (m as Record<string, unknown>).id as number,
    );
    const reads = await em.find(
      MessageRead,
      { user: toEntityId(userId), message: { $in: messageIds } },
      { fields: ['message'] },
    );
    const readSet = new Set(
      reads
        .map((r) => relationEntityId((r as Record<string, unknown>).message))
        .filter((id): id is number => id != null),
    );
    return messages.map((m) => {
      const row = m as Record<string, unknown>;
      const id = row.id as number;
      return {
        id,
        content: String(row.content ?? ''),
        senderId: relationEntityId(row.sender),
        receiverId: relationEntityId(row.receiver),
        timestamp: safeIsoStringNow(row.createdAt as Date | string | null | undefined),
        isRead: readSet.has(id),
        replyToId: relationEntityId(row.parent),
      };
    });
  }
}
