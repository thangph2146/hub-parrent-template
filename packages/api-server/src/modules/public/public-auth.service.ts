import { Injectable } from '@nestjs/common';
import type { EntityManager } from '@mikro-orm/core';
import { AUTH_ROLE_NAMES } from '../../config';
import type { AuthLoginPayload } from '../auth/auth.service';

export interface CreatePublicRegisterDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface IPublicAuthUsersDeps {
  create(data: {
    email: string;
    name: string;
    password: string;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    roleIds: string[];
  }): Promise<{ id: number | string }>;
}

export interface IPublicAuthSessionDeps {
  getAuthPayloadByUserId(userId: string): Promise<AuthLoginPayload | null>;
}

@Injectable()
export abstract class BasePublicAuthService {
  protected abstract getEm(): EntityManager;
  protected abstract getRoleEntity(): new () => Record<string, unknown>;
  protected abstract getSettingEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getUsersService(): IPublicAuthUsersDeps;
  protected abstract getAuthService(): IPublicAuthSessionDeps;

  private async getDefaultNewUserRole(): Promise<{ name: string; displayName: string }> {
    const em = this.getEm();
    const Setting = this.getSettingEntity();
    const setting = await em.findOne(Setting, { key: 'default_new_user_role' } as never);
    const value = (setting as Record<string, unknown> | null)?.value;
    if (value && typeof value === 'string') {
      const roleName = value.trim().toLowerCase().replace(/^"|"$/g, '');
      if (roleName) return { name: roleName, displayName: roleName };
    }
    return { name: AUTH_ROLE_NAMES.PARENT, displayName: 'Phụ huynh' };
  }

  private async ensureDefaultRole(): Promise<Record<string, unknown>> {
    const em = this.getEm();
    const Role = this.getRoleEntity();
    const defaultRoleCfg = await this.getDefaultNewUserRole();
    let role = await em.findOne(Role, { name: defaultRoleCfg.name } as never);
    if (role) return role as Record<string, unknown>;

    role = new Role() as Record<string, unknown>;
    role.name = defaultRoleCfg.name;
    role.displayName = defaultRoleCfg.displayName;
    role.description = `Tài khoản ${defaultRoleCfg.displayName.toLowerCase()} đăng ký công khai`;
    role.permissions = null;
    role.isActive = true;
    em.persist(role);
    await em.flush();
    return role;
  }

  async register(dto: CreatePublicRegisterDto): Promise<AuthLoginPayload> {
    const em = this.getEm();
    const User = this.getUserEntity();
    const email = dto.email.trim().toLowerCase();
    const fullName = dto.fullName.trim();
    const password = dto.password;

    if (!fullName || !email || !password) {
      throw new Error('Vui lòng nhập đầy đủ họ tên, email và mật khẩu.');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    const existing = await em.findOne(User, { email } as never);
    if (existing) {
      throw new Error(
        'Email đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.',
      );
    }

    const defaultRole = await this.ensureDefaultRole();
    const created = await this.getUsersService().create({
      email,
      name: fullName,
      password,
      phone: dto.phone?.trim() || null,
      address: dto.address?.trim() || null,
      isActive: true,
      roleIds: [String(defaultRole.id)],
    });

    const payload = await this.getAuthService().getAuthPayloadByUserId(
      String(created.id),
    );
    if (!payload) {
      throw new Error(
        'Đăng ký thành công nhưng chưa thể khởi tạo phiên đăng nhập.',
      );
    }

    return payload;
  }
}
