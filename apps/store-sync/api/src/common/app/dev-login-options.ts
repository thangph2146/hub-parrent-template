/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { Role } from '../../entities/role.entity';
import type { User } from '../../entities/user.entity';
import type { UserRole } from '../../entities/user-role.entity';

export type DevLoginRoleDto = {
  id: number;
  name: string;
  displayName: string;
};

export type DevLoginOptionDto = {
  id: number;
  email: string;
  name: string | null;
  isActive: boolean;
  roleNames: string[];
  roleLabels: string[];
  roles: DevLoginRoleDto[];
  description: string;
};

export type DevLoginOptionsQuery = {
  /** Lọc user có role này (vd. student). */
  role?: string;
  /** Lọc user có ít nhất một role (vd. parent,user). */
  roles?: string;
  /** Loại user có bất kỳ role nào trong danh sách. */
  excludeRoles?: string;
  /** Lọc email kết thúc bằng hậu tố (vd. @st.buh.edu.vn). */
  emailSuffix?: string;
  /** Lọc theo email hoặc tên (development login options). */
  search?: string;
  /** Mặc định true — chỉ user đang hoạt động. */
  activeOnly?: boolean;
};

function parseCsv(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return [
    ...new Set(
      value
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

function listUserRoles(userRoles: UserRole[] | undefined): DevLoginRoleDto[] {
  const roles = (userRoles ?? [])
    .map((userRole) => userRole.role)
    .filter((role): role is Role => Boolean(role && role.deletedAt == null));

  const seen = new Set<number>();
  return roles
    .map((role) => ({
      id: role.id,
      name: role.name.trim(),
      displayName: (role.displayName?.trim() || role.name).trim(),
    }))
    .filter((role) => {
      if (!role.name || seen.has(role.id)) return false;
      seen.add(role.id);
      return true;
    });
}

export function mapUserToDevLoginOption(user: User): DevLoginOptionDto | null {
  const email = user.email?.trim() ?? '';
  if (!email) return null;

  const roles = listUserRoles(user.userRoles);
  const roleNames = roles.map((role) => role.name);
  const roleLabels = roles.map((role) => role.displayName);
  const statusLabel = user.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';
  const roleDescription =
    roleLabels.length > 0 ? roleLabels.join(', ') : 'Chưa gán vai trò';

  return {
    id: user.id,
    email,
    name: user.name ?? null,
    isActive: user.isActive,
    roleNames,
    roleLabels,
    roles,
    description: `${statusLabel} | ${roleDescription}`,
  };
}

export function filterDevLoginOptions(
  options: DevLoginOptionDto[],
  query: DevLoginOptionsQuery = {},
): DevLoginOptionDto[] {
  const role = query.role?.trim().toLowerCase();
  const roles = parseCsv(query.roles);
  const excludeRoles = parseCsv(query.excludeRoles);
  const emailSuffix = query.emailSuffix?.trim().toLowerCase();
  const activeOnly = query.activeOnly !== false;

  return options.filter((option) => {
    const names = option.roleNames.map((name) => name.toLowerCase());

    if (activeOnly && !option.isActive) return false;
    if (role && !names.includes(role)) return false;
    if (roles.length > 0 && !roles.some((name) => names.includes(name))) {
      return false;
    }
    if (
      excludeRoles.length > 0 &&
      excludeRoles.some((name) => names.includes(name))
    ) {
      return false;
    }
    if (
      emailSuffix &&
      !option.email.trim().toLowerCase().endsWith(emailSuffix)
    ) {
      return false;
    }
    return true;
  });
}
