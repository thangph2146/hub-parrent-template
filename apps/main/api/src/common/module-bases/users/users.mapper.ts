/**
 * Users Mapper
 * Maps between User entity and DTOs
 */
import type {
  UserRowDto,
  UserRoleDto,
  DevLoginOption,
  DevLoginOptionsQuery,
  DevLoginRole,
} from '../../module-types';

/**
 * Map user entity to UserRowDto
 * This is a base mapper that can be extended by app-specific implementations
 */
export function mapUserToRowDto(
  user: {
    id: number | string;
    email?: string | null;
    name?: string | null;
    bio?: string | null;
    avatar?: string | null;
    emailVerified?: Date | string | null;
    phone?: string | null;
    address?: string | null;
    citizenId?: string | null;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string | null;
    userRoles?: Array<{
      role: { id: number; name: string; displayName: string };
    }>;
  },
  options?: {
    mapDate?: (date: Date | string | null | undefined) => string | null;
  },
): UserRowDto {
  const mapDate = options?.mapDate ?? defaultMapDate;

  return {
    id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
    email: user.email ?? '',
    name: user.name ?? null,
    bio: user.bio ?? null,
    avatar: user.avatar ?? null,
    emailVerified: mapDate(user.emailVerified),
    phone: user.phone ?? null,
    address: user.address ?? null,
    citizenId: user.citizenId ?? null,
    isActive: user.isActive,
    createdAt: mapDate(user.createdAt) ?? new Date().toISOString(),
    updatedAt: mapDate(user.updatedAt) ?? new Date().toISOString(),
    deletedAt: mapDate(user.deletedAt ?? null),
    roles: mapUserRoles(user.userRoles),
  };
}

/**
 * Map user roles to UserRoleDto array
 */
export function mapUserRoles(
  userRoles?: Array<{
    role: { id: number; name: string; displayName: string };
  }>,
): UserRoleDto[] {
  if (!userRoles) return [];
  return userRoles.map((ur) => ({
    id: ur.role.id,
    name: ur.role.name,
    displayName: ur.role.displayName,
  }));
}

function parseRoleNamesCsv(value: string | undefined): string[] {
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

function listDevLoginRoles(
  userRoles?: Array<{
    role?: {
      id: number;
      name: string;
      displayName?: string | null;
      deletedAt?: Date | string | null;
    } | null;
  }>,
): DevLoginRole[] {
  const roles = (userRoles ?? [])
    .map((userRole) => userRole.role)
    .filter((role): role is NonNullable<typeof role> =>
      Boolean(role && role.deletedAt == null),
    );

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

/**
 * Map user to dev login option
 */
export function mapUserToDevLoginOption(user: {
  id: number | string;
  email?: string | null;
  name?: string | null;
  isActive?: boolean;
  userRoles?: Array<{
    role?: {
      id: number;
      name: string;
      displayName?: string | null;
      deletedAt?: Date | string | null;
    } | null;
  }>;
}): DevLoginOption | null {
  const email = user.email?.trim() ?? '';
  if (!email) return null;

  const roles = listDevLoginRoles(user.userRoles);
  const roleNames = roles.map((role) => role.name);
  const roleLabels = roles.map((role) => role.displayName);
  const isActive = user.isActive !== false;
  const statusLabel = isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';
  const roleDescription =
    roleLabels.length > 0 ? roleLabels.join(', ') : 'Chưa gán vai trò';

  return {
    id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
    email: email.toLowerCase(),
    name: user.name ?? null,
    isActive,
    roleNames,
    roleLabels,
    roles,
    description: `${statusLabel} | ${roleDescription}`,
  };
}

export function filterDevLoginOptions(
  options: DevLoginOption[],
  query: DevLoginOptionsQuery = {},
): DevLoginOption[] {
  const role = query.role?.trim().toLowerCase();
  const roles = parseRoleNamesCsv(query.roles);
  const excludeRoles = parseRoleNamesCsv(query.excludeRoles);
  const emailSuffix = query.emailSuffix?.trim().toLowerCase();
  const activeOnly = query.activeOnly !== false;
  const search = query.search?.trim().toLowerCase();

  return options.filter((option) => {
    const names = option.roleNames.map((name) => name.toLowerCase());

    if (activeOnly && option.isActive === false) return false;
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
    if (search) {
      const matchesSearch =
        option.email.toLowerCase().includes(search) ||
        (option.name?.toLowerCase().includes(search) ?? false);
      if (!matchesSearch) return false;
    }
    return true;
  });
}

/**
 * Default date mapper
 */
function defaultMapDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
}

/**
 * Build LIKE pattern for search
 */
export function buildSearchPattern(search: string): string {
  return `%${search.trim()}%`;
}

/**
 * Build search conditions for multiple fields
 */
export function buildSearchConditions(
  search: string,
  fields: string[],
): Record<string, { $like: string }>[] {
  const pattern = buildSearchPattern(search);
  return fields.map((field) => ({ [field]: { $like: pattern } }));
}
