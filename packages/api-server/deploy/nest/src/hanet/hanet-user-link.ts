import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { FaceData } from '../entities/face-data.entity';
import { User } from '../entities/user.entity';

/** Gắn face_data.user khi alias HANET là email khớp tài khoản hệ thống. */
export async function linkFaceDataToUserByEmail(
  em: EntityManager,
  face: FaceData,
  email: string,
): Promise<number | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) return null;

  const user = await em.findOne(User, {
    email: normalized,
    deletedAt: null,
    isActive: true,
  } as FilterQuery<User>);

  if (!user) return null;

  const currentUserId = face.user?.id ?? null;
  if (currentUserId === user.id) return user.id;

  face.user = user;
  await em.flush();
  return user.id;
}
