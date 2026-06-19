/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import 'dotenv/config';

const RAW = process.env.PROTECTED_ADMIN_EMAILS ?? '';
const LIST: string[] = RAW.split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isProtectedAdminEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return LIST.includes(email.trim().toLowerCase());
}

/** Tài khoản protected chỉ được sửa khi chính email đó thực hiện (self-edit). */
export function canEditProtectedAdminUser(
  actorEmail: string | null | undefined,
  targetEmail: string | null | undefined,
): boolean {
  if (!isProtectedAdminEmail(targetEmail)) return true;
  if (!actorEmail || !targetEmail) return false;
  return actorEmail.trim().toLowerCase() === targetEmail.trim().toLowerCase();
}
