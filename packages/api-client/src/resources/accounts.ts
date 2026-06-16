import type { ApiClient } from "../client";
import { getData, postData, putData } from "./_shared";

export type AccountRoleRef = {
  id: number;
  name: string;
  displayName: string;
};

/** GET/PUT `/admin/accounts` — hồ sơ user đang đăng nhập (header X-User-Id). */
export type AccountProfile = {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  citizenId: string | null;
  /** MSSV — cổng sinh viên (đọc-only). */
  studentCode?: string | null;
  emailVerified: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: AccountRoleRef[];
};

export type UpdateAccountInput = {
  name?: string;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
  citizenId?: string | null;
  avatar?: string | null;
  studentCode?: string | null;
  /** Một số client (cổng sinh viên) đặt mật khẩu mới qua PUT `/admin/accounts`. */
  password?: string;
};

export type ChangeAccountPasswordInput = {
  currentPassword: string;
  password: string;
};

type ApiAccountRow = AccountProfile;

export class AccountsApi {
  constructor(private readonly http: ApiClient) {}

  async get(): Promise<AccountProfile> {
    return getData<ApiAccountRow>(this.http, "/admin/accounts");
  }

  async update(input: UpdateAccountInput): Promise<AccountProfile> {
    return putData<ApiAccountRow>(this.http, "/admin/accounts", {
      name: input.name,
      bio: input.bio,
      phone: input.phone,
      address: input.address,
      citizenId: input.citizenId,
      avatar: input.avatar,
      studentCode: input.studentCode,
      password: input.password,
    });
  }

  async changePassword(
    input: ChangeAccountPasswordInput,
  ): Promise<AccountProfile> {
    return putData<ApiAccountRow>(this.http, "/admin/accounts", {
      currentPassword: input.currentPassword,
      password: input.password,
    });
  }

  /** POST `/admin/accounts/avatar` — self-service avatar (không cần `uploads:create`). */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const fd = new FormData();
    fd.append("file", file);
    return postData<{ url: string }>(this.http, "/admin/accounts/avatar", fd);
  }
}
