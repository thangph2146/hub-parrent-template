/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable, Logger } from '@nestjs/common';
import { getHanetConfig, type HanetConfig } from './hanet.config';
import {
  assertHanetPartnerOk,
  HANET_RETURN_TOKEN_EXPIRED,
  isHanetPartnerEnvelope,
} from './hanet-partner.response';
import type { HanetPartnerEnvelope } from './hanet-partner.types';

type HanetTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

/**
 * Client HTTP API HANET (partner.hanet.ai) — token từ env hoặc refresh OAuth.
 * Tham số API dùng `token=` (access_token) theo tài liệu HANET.
 */
@Injectable()
export class HanetApiClient {
  private readonly logger = new Logger(HanetApiClient.name);

  private cachedAccessToken: string | null = null;

  getConfig(): HanetConfig {
    return getHanetConfig();
  }

  /** Token ưu tiên env HANET_ACCESS_TOKEN, sau đó cache refresh. */
  async getAccessToken(): Promise<string> {
    const config = this.getConfig();
    if (this.cachedAccessToken) return this.cachedAccessToken;
    if (config.accessToken) return config.accessToken;
    if (config.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) return refreshed;
    }
    throw new Error(
      'Thiếu HANET access token — đặt HANET_ACCESS_TOKEN hoặc HANET_REFRESH_TOKEN trong .env',
    );
  }

  async refreshAccessToken(): Promise<string | null> {
    const config = this.getConfig();
    if (!config.clientId || !config.clientSecret || !config.refreshToken) {
      return null;
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const res = await fetch(config.oauthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = (await res.json()) as HanetTokenResponse;
    if (!res.ok || !data.access_token) {
      this.logger.warn(
        `HANET refresh token failed: ${data.error ?? res.status} ${data.error_description ?? ''}`.trim(),
      );
      return null;
    }

    this.cachedAccessToken = data.access_token;
    if (data.refresh_token) {
      this.logger.debug('HANET refresh trả refresh_token mới — cập nhật HANET_REFRESH_TOKEN trong .env');
    }
    return data.access_token;
  }

  /** POST form-urlencoded tới partner API (pattern HANET: token + params). */
  async postForm<T = Record<string, unknown>>(
    path: string,
    params: Record<string, string | number | undefined>,
  ): Promise<T> {
    const config = this.getConfig();
    const token = await this.getAccessToken();
    const url = `${config.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const body = new URLSearchParams({ token });
    for (const [key, value] of Object.entries(params)) {
      if (value == null || value === '') continue;
      body.set(key, String(value));
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const text = await res.text();
    let parsed: T;
    try {
      parsed = JSON.parse(text) as T;
    } catch {
      throw new Error(`HANET API ${path} — response không phải JSON (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(
        `HANET API ${path} failed (${res.status}): ${JSON.stringify(parsed)}`,
      );
    }

    return parsed;
  }

  async postPartnerRaw(
    path: string,
    params: Record<string, string | number | undefined>,
    retryOnTokenExpired = true,
  ): Promise<HanetPartnerEnvelope> {
    const parsed = await this.postForm<HanetPartnerEnvelope>(path, params);

    if (
      retryOnTokenExpired &&
      isHanetPartnerEnvelope(parsed) &&
      parsed.returnCode === HANET_RETURN_TOKEN_EXPIRED
    ) {
      this.cachedAccessToken = null;
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.postPartnerRaw(path, params, false);
      }
    }

    if (!isHanetPartnerEnvelope(parsed)) {
      throw new Error(`HANET API ${path} — thiếu returnCode trong response`);
    }

    return parsed;
  }

  /** Gọi partner API và assert returnCode === 1. */
  async postPartner<T = unknown>(
    path: string,
    params: Record<string, string | number | undefined>,
  ): Promise<T> {
    const envelope = await this.postPartnerRaw(path, params);
    return assertHanetPartnerOk(envelope, path) as T;
  }
}
