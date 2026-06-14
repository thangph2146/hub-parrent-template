/**
 * Permissions Decorator.
 *
 * Bám sát pattern `apps/main/api/src/common/permissions.decorator.ts`.
 */
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
