/**
 * Cấu hình HANET — OAuth + webhook + HTTP API.
 * @see https://developers.hanet.ai/document
 * @see https://documenter.getpostman.com/view/13088306/TVeqcn2C
 */
export type HanetConfig = {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  apiBaseUrl: string;
  oauthUrl: string;
  /** MD5(client_secret + id) trên webhook push data. */
  webhookVerify: boolean;
  /** Từ chối webhook thiếu/không khớp hash (khi đã có client secret). */
  webhookVerifyRequired: boolean;
  /** keycode OAuth — tùy chọn, khớp field keycode trong payload. */
  webhookKeycode: string;
  /** placeID mặc định khi gọi partner API. */
  defaultPlaceId: string;
};

function envFlag(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw == null || raw.trim() === '') return defaultValue;
  return raw === 'true' || raw === '1';
}

export function getHanetConfig(): HanetConfig {
  const clientSecret = (process.env.HANET_CLIENT_SECRET ?? '').trim();
  return {
    clientId: (process.env.HANET_CLIENT_ID ?? '').trim(),
    clientSecret,
    accessToken: (process.env.HANET_ACCESS_TOKEN ?? '').trim(),
    refreshToken: (process.env.HANET_REFRESH_TOKEN ?? '').trim(),
    apiBaseUrl: (
      process.env.HANET_API_BASE_URL ?? 'https://partner.hanet.ai'
    ).replace(/\/+$/, ''),
    oauthUrl: (
      process.env.HANET_OAUTH_URL ?? 'https://oauth.hanet.com/token'
    ).replace(/\/+$/, ''),
    webhookVerify: envFlag('HANET_WEBHOOK_VERIFY', Boolean(clientSecret)),
    webhookVerifyRequired: envFlag('HANET_WEBHOOK_VERIFY_REQUIRED', false),
    webhookKeycode: (process.env.HANET_WEBHOOK_KEYCODE ?? '').trim(),
    defaultPlaceId: (process.env.HANET_DEFAULT_PLACE_ID ?? '').trim(),
  };
}

export function isHanetConfigured(config = getHanetConfig()): boolean {
  return Boolean(config.clientId && config.clientSecret);
}
