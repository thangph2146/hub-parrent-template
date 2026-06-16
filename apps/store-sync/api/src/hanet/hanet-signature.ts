/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { createHash } from 'node:crypto';

/** MD5(client_secret + id) — xác thực webhook push data HANET. */
export function computeHanetWebhookHash(
  clientSecret: string,
  recordId: string,
): string {
  return createHash('md5')
    .update(`${clientSecret}${recordId}`, 'utf8')
    .digest('hex')
    .toLowerCase();
}

export function verifyHanetWebhookHash(
  clientSecret: string,
  recordId: string,
  hash: string,
): boolean {
  if (!clientSecret || !recordId || !hash) return false;
  const expected = computeHanetWebhookHash(clientSecret, recordId);
  return expected === hash.trim().toLowerCase();
}
