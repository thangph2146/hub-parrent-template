import type { ApiClient } from "../client";
import { deleteData, getData, patchData, postData } from "./_shared";

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
  webhookLocalhost?: boolean;
  liveBuffer?: {
    totalBuffered: number;
    latestAt: string | null;
  };
  webhookIngest?: {
    totalBuffered: number;
    lastReceivedAt: string | null;
    lastDeviceId: string | null;
    lastPersonName: string | null;
  };
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

export type HanetRegisterPersonInput = {
  placeId: string;
  name: string;
  aliasId: string;
  fileBase64: string;
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
  hanetTotal?: number;
  hanetListCap?: number;
  listLimited?: boolean;
};

export type EventHanetReconcileResult = {
  eventId: string;
  placeId: string;
  mode: "day" | "timestamp";
  total: number;
  applied: number;
  duplicates: number;
  unmatched: number;
  errors: number;
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
  /** Số dòng admin phân trang được (face_data hoặc ~50 live HANET). */
  total: number;
  /** Tổng trên HANET (getTotalPersonByPlaceID) — tham chiếu. */
  hanetTotal?: number;
  /** Số bản ghi đã lưu face_data. */
  syncedTotal?: number;
  hanetListCap?: number;
  listLimited?: boolean;
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

export type HanetCreatePlaceInput = {
  placeName: string;
  address?: string;
  type?: number;
};

export type HanetUpdatePlaceInput = {
  placeId: string;
  placeName: string;
  address?: string;
};

export type HanetPlaceMutationResult = {
  placeId: string | null;
  data?: unknown;
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

  listPartnerUsers(): Promise<unknown> {
    return getData<unknown>(this.http, "/admin/hanet/partner/users");
  }

  removePartnerUser(clientId: string): Promise<unknown> {
    return deleteData<unknown>(
      this.http,
      `/admin/hanet/partner/users?clientId=${encodeURIComponent(clientId)}`,
    );
  }

  updatePartnerToken(
    body?: Record<string, string>,
  ): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/partner/update-token",
      body ?? {},
    );
  }

  listPlaces(): Promise<unknown> {
    return getData<unknown>(this.http, "/admin/hanet/places");
  }

  getPlaceInfo(placeId: string): Promise<unknown> {
    return getData<unknown>(
      this.http,
      `/admin/hanet/places/info?placeId=${encodeURIComponent(placeId)}`,
    );
  }

  createPlace(body: HanetCreatePlaceInput): Promise<HanetPlaceMutationResult> {
    return postData<HanetPlaceMutationResult>(
      this.http,
      "/admin/hanet/places",
      body,
    );
  }

  updatePlace(body: HanetUpdatePlaceInput): Promise<HanetPlaceMutationResult> {
    return patchData<HanetPlaceMutationResult>(
      this.http,
      "/admin/hanet/places",
      body,
    );
  }

  removePlace(placeId: string): Promise<HanetPlaceMutationResult> {
    return deleteData<HanetPlaceMutationResult>(
      this.http,
      `/admin/hanet/places?placeId=${encodeURIComponent(placeId)}`,
    );
  }

  listDevices(placeId?: string): Promise<unknown> {
    const query = placeId
      ? `?placeId=${encodeURIComponent(placeId)}`
      : "";
    return getData<unknown>(this.http, `/admin/hanet/devices${query}`);
  }

  getDeviceInfo(deviceId: string): Promise<unknown> {
    return getData<unknown>(
      this.http,
      `/admin/hanet/devices/info?deviceId=${encodeURIComponent(deviceId)}`,
    );
  }

  updateDevice(body: {
    deviceId: string;
    deviceName: string;
  }): Promise<unknown> {
    return patchData<unknown>(this.http, "/admin/hanet/devices", body);
  }

  setDeviceMqtt(
    body: { deviceId: string } & Record<string, string | number | boolean>,
  ): Promise<unknown> {
    return postData<unknown>(this.http, "/admin/hanet/devices/mqtt", body);
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
    placeId?: string;
    placeName?: string;
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

  updatePersonFaceByUrl(body: {
    placeId: string;
    url: string;
    personId: string;
  }): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/face/update-by-url",
      body,
    );
  }

  updatePersonFaceByUrlAlias(body: {
    placeId: string;
    url: string;
    aliasId: string;
  }): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/face/update-by-url-by-alias-id",
      body,
    );
  }

  updatePersonFaceByUrlPersonId(body: {
    placeId: string;
    url: string;
    personId: string;
  }): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/face/update-by-url-by-person-id",
      body,
    );
  }

  updatePersonFaceByImage(body: {
    placeId: string;
    fileBase64: string;
    personId: string;
  }): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/face/update-by-image",
      body,
    );
  }

  updatePersonFaceByImageAlias(body: {
    placeId: string;
    fileBase64: string;
    aliasId: string;
  }): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/face/update-by-image-by-alias-id",
      body,
    );
  }

  updatePersonFaceByImagePersonId(body: {
    placeId: string;
    fileBase64: string;
    personId: string;
  }): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/face/update-by-image-by-person-id",
      body,
    );
  }

  takePersonFacePicture(body: {
    placeId: string;
    deviceId: string;
    personId?: string;
    aliasId?: string;
  }): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/face/take-picture",
      body,
    );
  }

  registerPerson(body: HanetRegisterPersonInput): Promise<unknown> {
    return postData<unknown>(this.http, "/admin/hanet/person/register", body);
  }

  listPersonByAliasAll(aliasId: string): Promise<unknown> {
    return getData<unknown>(
      this.http,
      `/admin/hanet/person/by-alias-all?aliasId=${encodeURIComponent(aliasId)}`,
    );
  }

  listPersonByAlias(params: {
    aliasId: string;
    placeId?: string;
  }): Promise<unknown> {
    const search = new URLSearchParams({ aliasId: params.aliasId });
    if (params.placeId) search.set("placeId", params.placeId);
    return getData<unknown>(
      this.http,
      `/admin/hanet/person/by-alias?${search.toString()}`,
    );
  }

  getPersonUserByAlias(params: {
    aliasId: string;
    placeId?: string;
  }): Promise<unknown> {
    const search = new URLSearchParams({ aliasId: params.aliasId });
    if (params.placeId) search.set("placeId", params.placeId);
    return getData<unknown>(
      this.http,
      `/admin/hanet/person/user-by-alias?${search.toString()}`,
    );
  }

  getPersonUserById(params: {
    personId: string;
    placeId?: string;
  }): Promise<unknown> {
    const search = new URLSearchParams({ personId: params.personId });
    if (params.placeId) search.set("placeId", params.placeId);
    return getData<unknown>(
      this.http,
      `/admin/hanet/person/user-by-id?${search.toString()}`,
    );
  }

  updatePerson(body: Record<string, unknown>): Promise<unknown> {
    return patchData<unknown>(this.http, "/admin/hanet/person", body);
  }

  updatePersonInfo(body: Record<string, unknown>): Promise<unknown> {
    return patchData<unknown>(this.http, "/admin/hanet/person/info", body);
  }

  updatePersonAliasId(body: Record<string, unknown>): Promise<unknown> {
    return patchData<unknown>(this.http, "/admin/hanet/person/alias-id", body);
  }

  removePerson(params: {
    personId: string;
    placeId?: string;
  }): Promise<unknown> {
    const search = new URLSearchParams({ personId: params.personId });
    if (params.placeId) search.set("placeId", params.placeId);
    return deleteData<unknown>(
      this.http,
      `/admin/hanet/person/by-id?${search.toString()}`,
    );
  }

  removePersonByPlace(params: {
    aliasId: string;
    placeId?: string;
  }): Promise<unknown> {
    const search = new URLSearchParams({ aliasId: params.aliasId });
    if (params.placeId) search.set("placeId", params.placeId);
    return deleteData<unknown>(
      this.http,
      `/admin/hanet/person/by-place?${search.toString()}`,
    );
  }

  removePersonsByAliasIds(body: Record<string, unknown>): Promise<unknown> {
    return postData<unknown>(
      this.http,
      "/admin/hanet/person/remove-by-alias-ids",
      body,
    );
  }

  removeAllPersonsInPlace(placeId: string): Promise<unknown> {
    return deleteData<unknown>(
      this.http,
      `/admin/hanet/person/in-place?placeId=${encodeURIComponent(placeId)}`,
      { timeoutMs: 120_000 },
    );
  }

  removePersonById(params: {
    personId: string;
    placeId?: string;
  }): Promise<unknown> {
    const search = new URLSearchParams({ personId: params.personId });
    if (params.placeId) search.set("placeId", params.placeId);
    return deleteData<unknown>(
      this.http,
      `/admin/hanet/person/by-id?${search.toString()}`,
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

  getCheckinsByPlaceTimestamp(params: {
    placeId?: string;
    from: string;
    to: string;
  }): Promise<unknown> {
    const search = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    if (params.placeId) search.set("placeId", params.placeId);
    return getData<unknown>(
      this.http,
      `/admin/hanet/checkins/timestamp?${search.toString()}`,
    );
  }

  reconcileEventCheckins(
    eventId: string,
    body?: {
      placeId?: string;
      date?: string;
      from?: string;
      to?: string;
    },
  ): Promise<EventHanetReconcileResult> {
    return postData<EventHanetReconcileResult>(
      this.http,
      `/admin/hanet/events/${encodeURIComponent(eventId)}/reconcile-checkins`,
      body ?? {},
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
