/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Student } from '../entities/student.entity';
import {
  BaseAccountsService,
  type UpdateAccountDto,
  type UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';
import { HanetPersonRegisterService } from '../hanet/hanet-person-register.service';
import { toEntityId } from '../common/entity-id';
import {
  avatarFolderPath,
  isStudentAccountRole,
  normalizeNumericStudentCode,
  studentCodeFromSchoolEmail,
} from '../common/student-code-resolve';

export type {
  AccountProfileDto,
  UpdateAccountDto,
  UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';

@Injectable()
export class AccountsService extends BaseAccountsService {
  constructor(
    private readonly em: EntityManager,
    private readonly hanetPersonRegister: HanetPersonRegisterService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity() {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected override async resolveStudentCode(
    userId: string,
    email: string,
  ): Promise<string | null> {
    const student = await this.em.findOne(Student, {
      user: toEntityId(userId),
      deletedAt: null,
    });
    const fromDb = normalizeNumericStudentCode(student?.studentCode);
    if (fromDb) return fromDb;
    return studentCodeFromSchoolEmail(email);
  }

  override async resolveAvatarUploadFolder(userId: string): Promise<
    { ok: true; folderPath: string } | { ok: false; message: string }
  > {
    const profile = await this.getProfile(userId);
    if (!profile) {
      return { ok: false, message: 'Không tìm thấy tài khoản' };
    }

    if (isStudentAccountRole(profile.roles)) {
      const code = normalizeNumericStudentCode(profile.studentCode);
      if (!code) {
        return {
          ok: false,
          message:
            'Mã số sinh viên phải là số (5–12 chữ số). Vui lòng nhập và lưu hồ sơ trước khi tải ảnh.',
        };
      }
      return { ok: true, folderPath: avatarFolderPath(code) };
    }

    return { ok: true, folderPath: avatarFolderPath(String(profile.id)) };
  }

  private async upsertStudentCode(
    userId: string,
    rawCode: string,
    name: string | null,
    email: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const code = normalizeNumericStudentCode(rawCode);
    if (!code) {
      return {
        ok: false,
        message: 'Mã số sinh viên phải là số (5–12 chữ số).',
      };
    }

    const taken = await this.em.findOne(
      Student,
      { studentCode: code, deletedAt: null },
      { populate: ['user'] },
    );
    if (taken && String(taken.user?.id) !== String(toEntityId(userId))) {
      return {
        ok: false,
        message: 'Mã số sinh viên đã được liên kết với tài khoản khác.',
      };
    }

    let student = await this.em.findOne(Student, {
      user: toEntityId(userId),
      deletedAt: null,
    });

    if (!student) {
      student = new Student();
      student.studentCode = code;
      student.name = name?.trim() || null;
      student.email = email.trim();
      student.user = this.em.getReference(User, toEntityId(userId));
      student.isActive = true;
      this.em.persist(student);
    } else {
      student.studentCode = code;
      if (name?.trim()) student.name = name.trim();
      if (email.trim()) student.email = email.trim();
    }

    await this.em.flush();
    return { ok: true };
  }

  override async updateProfile(
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<UpdateAccountResult> {
    if (dto.studentCode !== undefined) {
      const user = await this.em.findOne(User, { id: toEntityId(userId) });
      if (!user || user.deletedAt || !user.isActive) {
        return { ok: false, reason: 'not_found' };
      }
      const upsert = await this.upsertStudentCode(
        userId,
        dto.studentCode ?? '',
        dto.name ?? user.name ?? null,
        user.email ?? '',
      );
      if (!upsert.ok) {
        return { ok: false, reason: 'invalid_student_code' };
      }
    }

    const result = await super.updateProfile(userId, dto);
    if (!result.ok || dto.avatar === undefined) {
      return result;
    }

    const avatar = result.profile.avatar?.trim();
    if (!avatar) {
      return result;
    }

    void this.hanetPersonRegister.syncUserFaceToHanet({
      userId: result.profile.id,
      email: result.profile.email,
      name: result.profile.name?.trim() || result.profile.email,
      avatarUrl: avatar,
    });

    return result;
  }
}
