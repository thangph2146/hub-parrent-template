/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
export type AdminCacheInvalidateAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'purge'
  | 'bulk'
  | 'mutate';

export type AdminCacheInvalidatePayload = {
  resource: string;
  action: AdminCacheInvalidateAction;
  id?: string;
};

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Không broadcast invalidate (đã có event socket riêng hoặc không có list admin). */
const SKIP_RESOURCES = new Set([
  'auth',
  'dashboard',
  'sessions',
  'messages',
  'conversations',
  'notifications',
  'event-registrations',
  'event-checkins',
  'event-checkouts',
  'event-speakers',
  'hanet',
]);

export function parseAdminRealtimeInvalidate(
  method: string,
  url: string,
): AdminCacheInvalidatePayload | null {
  const verb = method.toUpperCase();
  if (!MUTATING_METHODS.has(verb)) return null;

  const path = (url.split('?')[0] ?? '').replace(/\/+$/, '');
  const match = path.match(
    /\/admin\/([a-z0-9-]+)(?:\/([^/]+))?(?:\/([^/]+))?/i,
  );
  if (!match) return null;

  const resource = (match[1] ?? '').toLowerCase();
  if (SKIP_RESOURCES.has(resource)) return null;

  const seg2 = match[2];
  const seg3 = match[3];

  if (!seg2) {
    return {
      resource,
      action: verb === 'POST' ? 'create' : 'mutate',
    };
  }

  if (seg2 === 'bulk') {
    return { resource, action: 'bulk' };
  }

  if (seg3 === 'hard-delete') {
    return { resource, action: 'purge', id: seg2 };
  }

  if (seg3 === 'restore') {
    return { resource, action: 'restore', id: seg2 };
  }

  const id = seg2;
  if (verb === 'DELETE') {
    return { resource, action: 'delete', id };
  }

  if (verb === 'POST' || verb === 'PUT' || verb === 'PATCH') {
    return { resource, action: verb === 'POST' ? 'mutate' : 'update', id };
  }

  return { resource, action: 'mutate', id };
}
