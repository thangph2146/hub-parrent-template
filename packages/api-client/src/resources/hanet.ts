import type { ApiClient } from "../client";
import { getData, postData } from "./_shared";

export type HanetWebhookUrlsDto = {
  auto: string;
  forEvent: string;
  docs: {
    api: string;
    webhook: string;
    portal: string;
  };
};

export type HanetAdminStatusDto = {
  configured: boolean;
  webhookVerify: boolean;
  webhookVerifyRequired: boolean;
  clientId: string | null;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  apiBaseUrl: string;
  defaultPlaceId: string | null;
  urls: HanetWebhookUrlsDto;
};

export type HanetTestConnectionDto = {
  ok: boolean;
  tokenPreview: string;
  message: string;
};

export type HanetPartnerProbeDto = {
  ok: boolean;
  message: string;
  profile: unknown;
};

export type HanetRegisterPersonByUrlInput = {
  placeId: string;
  name: string;
  aliasId: string;
  url: string;
  personType?: number;
};

export type HanetStoredAvatarRow = {
  id: number;
  hanetPersonId: string | null;
  hanetAliasId: string | null;
  displayName: string | null;
  imagePath: string;
  userId: number | null;
  updatedAt: string | null;
  createdAt: string;
};

export type HanetSyncAvatarsResult = {
  placeId: string;
  pages: number;
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  linkedRegistrations: number;
  linkedUsers: number;
};

export type HanetPersonListPage = {
  placeId: string;
  pageIndex: number;
  pageSize: number;
  items: Array<{
    personId: string;
    displayName: string;
    aliasId: string;
    avatar: string;
  }>;
  total?: number;
};

export type HanetCameraEnsureDto = {
  id: number;
  name: string;
  code: string;
};

export type HanetDeviceOption = {
  deviceId: string;
  name: string;
  placeId?: string;
};

export class HanetAdminApi {
  constructor(private readonly http: ApiClient) {}

  status(eventId?: string): Promise<HanetAdminStatusDto> {
    const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
    return getData<HanetAdminStatusDto>(
      this.http,
      `/admin/hanet/status${query}`,
    );
  }

  testConnection(): Promise<HanetTestConnectionDto> {
    return postData<HanetTestConnectionDto>(
      this.http,
      "/admin/hanet/test-connection",
      {},
    );
  }

  testPartnerApi(): Promise<HanetPartnerProbeDto> {
    return postData<HanetPartnerProbeDto>(
      this.http,
      "/admin/hanet/test-partner",
      {},
    );
  }

  listPlaces(): Promise<unknown> {
    return getData<unknown>(this.http, "/admin/hanet/places");
  }

  listDevices(placeId?: string): Promise<unknown> {
    const query = placeId
      ? `?placeId=${encodeURIComponent(placeId)}`
      : "";
    return getData<unknown>(this.http, `/admin/hanet/devices${query}`);
  }

  getProfile(): Promise<unknown> {
    return postData<HanetPartnerProbeDto>(
      this.http,
      "/admin/hanet/test-partner",
      {},
    ).then((res) => res.profile ?? res);
  }

  getDeviceConnectionStatus(deviceId: string): Promise<unknown> {
    return getData<unknown>(
      this.http,
      `/admin/hanet/devices/connection-status?deviceId=${encodeURIComponent(deviceId)}`,
    );
  }

  ensureCamera(body: {
    deviceId: string;
    name?: string;
  }): Promise<HanetCameraEnsureDto> {
    return postData<HanetCameraEnsureDto>(
      this.http,
      "/admin/hanet/cameras/ensure",
      body,
    );
  }

  registerPersonByUrl(
    body: HanetRegisterPersonByUrlInput,
  ): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/register-by-url",
      body,
    );
  }

  getCheckinsByPlaceDay(params?: {
    placeId?: string;
    date?: string;
  }): Promise<unknown> {
    const search = new URLSearchParams();
    if (params?.placeId) search.set("placeId", params.placeId);
    if (params?.date) search.set("date", params.date);
    const q = search.toString();
    return getData<unknown>(
      this.http,
      `/admin/hanet/checkins${q ? `?${q}` : ""}`,
    );
  }

  listPersons(params?: {
    placeId?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<HanetPersonListPage> {
    const search = new URLSearchParams();
    if (params?.placeId) search.set("placeId", params.placeId);
    if (params?.pageIndex != null) {
      search.set("pageIndex", String(params.pageIndex));
    }
    if (params?.pageSize != null) {
      search.set("pageSize", String(params.pageSize));
    }
    const q = search.toString();
    return getData<HanetPersonListPage>(
      this.http,
      `/admin/hanet/persons${q ? `?${q}` : ""}`,
    );
  }

  syncPersonAvatars(placeId?: string): Promise<HanetSyncAvatarsResult> {
    const q = placeId
      ? `?placeId=${encodeURIComponent(placeId)}`
      : "";
    return postData<HanetSyncAvatarsResult>(
      this.http,
      `/admin/hanet/persons/sync${q}`,
      {},
    );
  }

  listStoredAvatars(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ items: HanetStoredAvatarRow[]; total: number }> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.search) search.set("search", params.search);
    const q = search.toString();
    return getData<{ items: HanetStoredAvatarRow[]; total: number }>(
      this.http,
      `/admin/hanet/avatars${q ? `?${q}` : ""}`,
    );
  }
}
