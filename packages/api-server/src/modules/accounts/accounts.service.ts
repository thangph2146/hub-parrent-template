/**
 * Accounts admin service — profile user hiện tại; app binding entity.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { compare, hash } from 'bcryptjs';
import { toEntityId } from '../../common/entity-id';
import { safeIsoString, safeIsoStringNow } from '../../common/date-utils';

export interface AccountProfileDto {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  citizenId: string | null;
  /** MSSV — đọc từ bảng `students` hoặc email `@st.buh.edu.vn`. */
  studentCode?: string | null;
  emailVerified: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Array<{ id: number; name: string; displayName: string }>;
}

export interface UpdateAccountDto {
  name?: string;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
  citizenId?: string | null;
  avatar?: string | null;
  studentCode?: string | null;
  currentPassword?: string;
  password?: string;
}

export type UpdateAccountResult =
  | { ok: true; profile: AccountProfileDto }
  | {
      ok: false;
      reason:
        | 'not_found'
        | 'wrong_password'
        | 'password_required'
        | 'invalid_student_code';
    };

type UserWithProfile = {
  id: number;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
  citizenId?: string | null;
  emailVerified?: Date | string | null;
  isActive: boolean;
  deletedAt?: Date | string | null;
  password: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type UserRoleWithRole = {
  role: { id: number; name: string; displayName: string };
};

function mapToProfile(
  user: UserWithProfile,
  userRoles: UserRoleWithRole[],
): AccountProfileDto {
  return {
    id: user.id,
    email: user.email ?? '',
    name: user.name ?? null,
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    phone: user.phone ?? null,
    address: user.address ?? null,
    citizenId: user.citizenId ?? null,
    emailVerified: safeIsoString(user.emailVerified),
    isActive: user.isActive,
    createdAt: safeIsoStringNow(user.createdAt),
    updatedAt: safeIsoStringNow(user.updatedAt),
    roles: userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
    })),
  };
}

@Injectable()
export abstract class BaseAccountsService {
  protected abstract getEm(): EntityManager;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getUserRoleEntity(): new () => Record<string, unknown>;

  /** App binding có thể override để gắn MSSV từ entity `Student`. */
  protected async resolveStudentCode(
    _userId: string,
    _email: string,
  ): Promise<string | null> {
    return null;
  }

  async resolveAvatarUploadFolder(
    _userId: string,
  ): Promise<
    { ok: true; folderPath: string } | { ok: false; message: string }
  > {
    return { ok: true, folderPath: 'avatars' };
  }

  async getProfile(userId: string): Promise<AccountProfileDto | null> {
    const User = this.getUserEntity();
    const UserRole = this.getUserRoleEntity();
    const user = await this.getEm().findOne(User, { id: toEntityId(userId) });

    if (!user || (user as UserWithProfile).deletedAt || !(user as UserWithProfile).isActive) {
      return null;
    }

    const userRoles = (await this.getEm().find(
      UserRole,
      { user: toEntityId(userId) },
      { populate: ['role'] },
    )) as UserRoleWithRole[];

    const profile = mapToProfile(user as UserWithProfile, userRoles);
    const studentCode = await this.resolveStudentCode(userId, profile.email);
    return studentCode ? { ...profile, studentCode } : profile;
  }

  async updateProfile(
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<UpdateAccountResult> {
    const User = this.getUserEntity();
    const existing = (await this.getEm().findOne(User, {
      id: toEntityId(userId),
    })) as UserWithProfile | null;

    if (!existing || existing.deletedAt || !existing.isActive) {
      return { ok: false, reason: 'not_found' };
    }

    if (dto.name !== undefined) existing.name = dto.name.trim();
    if (dto.bio !== undefined) existing.bio = dto.bio?.trim() ?? null;
    if (dto.phone !== undefined) existing.phone = dto.phone?.trim() ?? null;
    if (dto.address !== undefined) {
      existing.address = dto.address?.trim() ?? null;
    }
    if (dto.citizenId !== undefined) {
      existing.citizenId = dto.citizenId?.trim() ?? null;
    }
    if (dto.avatar !== undefined) {
      existing.avatar = dto.avatar === null ? null : dto.avatar.trim() || null;
    }

    const newPassword = dto.password?.trim() ?? '';
    if (newPassword) {
      const current = dto.currentPassword?.trim() ?? '';
      if (!current) {
        return { ok: false, reason: 'password_required' };
      }
      const valid = await compare(current, existing.password);
      if (!valid) {
        return { ok: false, reason: 'wrong_password' };
      }
      existing.password = await hash(newPassword, 10);
    }

    await this.getEm().persistAndFlush(existing);

    const profile = await this.getProfile(userId);
    if (!profile) {
      return { ok: false, reason: 'not_found' };
    }
    return { ok: true, profile };
  }
}
