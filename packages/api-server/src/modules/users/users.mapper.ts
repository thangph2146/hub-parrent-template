/**
 * Users Mapper
 * Maps between User entity and DTOs
 */
import type {
  UserRowDto,
  UserRoleDto,
  DevLoginOption,
} from '../../types';

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

/**
 * Map user to dev login option
 */
export function mapUserToDevLoginOption(
  user: {
    id: number | string;
    email?: string | null;
    name?: string | null;
    userRoles?: Array<{
      role: { name: string };
    }>;
  },
): DevLoginOption | null {
  if (!user.email?.trim()) return null;

  return {
    id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
    email: user.email.trim().toLowerCase(),
    name: user.name ?? null,
    roleNames: user.userRoles?.map((ur) => ur.role.name) ?? [],
  };
}

/**
 * Default date mapper
 */
function defaultMapDate(
  date: Date | string | null | undefined,
): string | null {
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
