# HANET Partner API — hướng dẫn chuẩn (monorepo)

Tài liệu ghi **cách gửi request**, **body đính kèm** theo [Postman HANET](https://documenter.getpostman.com/view/13088306/TVeqcn2C), cách Hub monorepo proxy, và pitfall tích hợp check-in.

**Postman (person / alias):** https://documenter.getpostman.com/view/13088306/TVeqcn2C#cc125df3-9e34-443d-a6ff-d0a6fecb0f1e

**Nguồn sự thật mã:**

| Layer | Đường dẫn |
|-------|-----------|
| Postman ↔ Hub route map | `packages/admin-app/src/lib/hanet-postman.ts` |
| HTTP client + OAuth refresh | `apps/*/api/src/hanet/hanet-api.client.ts` |
| Gọi partner + map params | `apps/*/api/src/hanet/hanet-partner.service.ts` |
| Hub camelCase → `placeID`, `personID` | `apps/*/api/src/hanet/hanet-partner-params.ts` |
| Envelope `returnCode` | `apps/*/api/src/hanet/hanet-partner.response.ts` |
| Admin proxy Nest | `apps/*/api/src/hanet/hanet-admin.controller.ts` |
| SDK admin / check-in UI | `packages/api-client/src/resources/hanet.ts` |
| Biến môi trường | `packages/api-server/deploy/nest/.env.example` (mục HANET) |

**Product line:** `@api` (main dev) + `@hub-checkin/api` (deploy check-in). Sửa ưu tiên `apps/main/api` → `pnpm api:regenerate:checkin` nếu cần đồng bộ hub-event.

---

## 1. Tài liệu gốc & response

- **Postman:** https://documenter.getpostman.com/view/13088306/TVeqcn2C  
- **Base URL partner:** `https://partner.hanet.ai`  
- **OAuth token:** `https://oauth.hanet.com/token`  
- **Đăng ký app:** https://developers.hanet.ai/apps  

### 1.1 Envelope

```json
{
  "returnCode": 1,
  "returnMessage": "SUCCESS",
  "data": {}
}
```

| `returnCode` | Ý nghĩa |
|--------------|---------|
| `1` | Thành công |
| `!= 1` | Lỗi — đọc `returnMessage` |

Token hết hạn: `-103` / `401` → Hub refresh OAuth và gọi lại một lần.

### 1.2 Mã lỗi thường gặp

| Mã | Ghi chú |
|----|---------|
| `-1` | `INVALID_INPUT_ERROR` |
| `-103` | Token hết hạn |
| `-5003` | `PERSON_GET_ERROR` |
| `-5011` | `PERSON_NOT_FOUND_ERROR` |
| `-9006` | Ảnh register không hợp lệ |
| `-1005` | Place không tồn tại |

---

## 2. Cách gửi request (chuẩn Postman)

### 2.1 Partner API — mẫu chung

| Thuộc tính | Giá trị |
|------------|---------|
| Method | `POST` (trừ OAuth authorize = `GET`) |
| URL | `https://partner.hanet.ai/<path>` |
| Header | `Content-Type: application/x-www-form-urlencoded` |
| Auth | Field form **`token`** = `access_token` (không `Authorization: Bearer`) |
| Body | `x-www-form-urlencoded` — mỗi param Postman là một field |

Postman đôi khi ghi header `application/json` nhưng body vẫn urlencoded (`--data-urlencode`). Hub luôn dùng `application/x-www-form-urlencoded` (`HanetApiClient.postForm`).

```bash
curl --location 'https://partner.hanet.ai/<path>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'token=<ACCESS_TOKEN>' \
  --data-urlencode 'placeID=903038'
```

Field rỗng — Hub **không gửi** lên partner.

### 2.2 OAuth — lấy access token

| Bước | Method | URL | Body (form) |
|------|--------|-----|-------------|
| Authorize | `GET` | `https://oauth.hanet.com/oauth2/authorize?...` | — |
| Token / refresh | `POST` | `https://oauth.hanet.com/token` | `grant_type`, `client_id`, `client_secret`, `refresh_token` hoặc `code` |

```bash
curl 'https://oauth.hanet.com/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=refresh_token' \
  --data-urlencode 'client_id=<CLIENT_ID>' \
  --data-urlencode 'client_secret=<CLIENT_SECRET>' \
  --data-urlencode 'refresh_token=<REFRESH_TOKEN>'
```

### 2.3 Multipart — upload ảnh khuôn mặt

Endpoint `POST /person/register` và `POST /person/updateByFaceImage*`:

- `Content-Type: multipart/form-data`
- Fields: `token`, `placeID`, `personID` hoặc `aliasID`, file field **`file`** (JPEG/PNG)

Hub proxy: `POST /api/admin/hanet/person/face/update-by-image*`.

### 2.4 Gọi qua Hub (khuyến nghị)

| Tầng | Format |
|------|--------|
| Admin UI | `api.hanet.*` (`@workspace/api-client`) |
| Hub Nest | JSON / query `camelCase` (`placeId`, `personId`) |
| Partner | Form `placeID`, `personID`, … + `token` |

**Không** gọi `partner.hanet.ai` từ browser.

---

## 3. Bảng endpoint — body đính kèm (Partner)

Prefix URL: `https://partner.hanet.ai`. Mọi request thêm `token=<ACCESS_TOKEN>`.

Cột **Hub** = `/api/admin/hanet/...` (có thể cần header `x-user-id` khi dev).

### 3.1 Profile & Partner

| Partner `POST` | Body (form) | Bắt buộc | Hub |
|----------------|-------------|----------|-----|
| `/profile/getProfile` | `token` | token | `GET /profile` |
| `/partner/updateToken` | `token` + field Postman | token | `POST /partner/update-token` |
| `/partner/addPlacePartner` | `token`, `placeID` | cả hai | (nội bộ sau addPlace) |
| `/partner/removePlacePartner` | `token`, `placeID` | cả hai | (trước removePlace) |
| `/partner/removeUserPartner` | `token`, `clientID` | cả hai | `DELETE /partner/users?clientId=` |
| `/partner/getListUserPartner` | `token` | token | `GET /partner/users` |

### 3.2 Place

| Partner `POST` | Body (form) | Bắt buộc | Hub |
|----------------|-------------|----------|-----|
| `/place/getPlaces` | `token` | token | `GET /places` |
| `/place/getPlaceInfo` | `token`, `placeID` | cả hai | `GET /places/info?placeId=` |
| `/place/addPlace` | `token`, **`name`**, `address?`, `type?` | name | `POST /places` — field **`name`** (không `placeName`) |
| `/place/updatePlace` | `token`, `placeID`, **`name`**, `address?` | placeID, name | `PATCH /places` |
| `/place/removePlace` | `token`, `placeID` | cả hai | `DELETE /places?placeId=` |

```bash
curl 'https://partner.hanet.ai/place/addPlace' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'name=HUB - Co so The Duc' \
  --data-urlencode 'address=...' \
  --data-urlencode 'type=0'
```

### 3.3 Device

| Partner `POST` | Body (form) | Bắt buộc | Hub |
|----------------|-------------|----------|-----|
| `/device/getListDeviceByPlace` | `token`, `placeID` | cả hai | `GET /devices?placeId=` |
| `/device/getDeviceInfo` | `token`, `deviceID` | cả hai | `GET /devices/info?deviceId=` |
| `/device/getConnectionStatus` | `token`, **`deviceIDs`** | deviceIDs | `GET /devices/connection-status?deviceId=` |
| `/device/updateDevice` | `token`, `deviceID`, `deviceName` | cả ba | `PATCH /devices` |
| `/device/setDeviceMQTT` | `token`, `deviceID` + field MQTT | deviceID | `POST /devices/mqtt` |

### 3.4 Person — đọc / tra cứu

| Partner `POST` | Body (form) | Bắt buộc | Hub |
|----------------|-------------|----------|-----|
| `/person/getListByPlace` | `token`, `placeID`, `pageIndex`, `pageSize`, `personType?` | placeID | `GET /persons?...` — **pageIndex partner 1-based** |
| `/person/getTotalPersonByPlaceID` | `token`, `placeID` | cả hai | (kèm persons) |
| `/person/getListByAliasIDAllPlace` | `token`, `aliasID` | cả hai | `GET /person/by-alias-all?aliasId=` |
| `/person/getListByAliasID` | `token`, `aliasID`, `placeIDs?` | aliasID | `GET /person/by-alias?...` |
| `/person/getUserInfoByAliasID` | `token`, `aliasID` (+ `placeID` Hub) | aliasID | `GET /person/user-by-alias` |
| `/person/getUserInfoByPersonID` | `token`, **`personID`** | cả hai | `GET /person/user-by-id?personId=` |

```bash
curl 'https://partner.hanet.ai/person/getListByPlace' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'placeID=903038' \
  --data-urlencode 'pageIndex=1' \
  --data-urlencode 'pageSize=50'
```

### 3.5 Person — đăng ký / cập nhật

| Partner `POST` | Body (form) | Bắt buộc | Hub |
|----------------|-------------|----------|-----|
| `/person/register` | `token`, `placeID`, **`name`**, **`aliasID`**, multipart **`file`** (JPEG/PNG) | placeID, name, aliasID, file | `POST /person/register` — Hub gửi `fileBase64` |
| `/person/registerByUrl` | `token`, `placeID`, `name`, `aliasID`, **`url`**, `personType?` | + url | `POST /person/register-by-url` |
| `/person/update` | `token`, `placeID`, **`personID`**, … | personID | `PATCH /person` |
| `/person/updateInfo` | `token`, `placeID`, **`personID`**, … | personID | `PATCH /person/info` |
| `/person/updateAliasID` | `token`, `placeID`, **`personID`**, **`aliasID`** | personID, aliasID | `PATCH /person/alias-id` |
| `/person/updateByFaceUrl` | `token`, `placeID`, `personID`, `url` | personID, url | `POST /person/face/update-by-url` |
| `/person/updateByFaceUrlByAliasID` | `token`, `placeID`, `aliasID`, `url` | aliasID, url | `.../update-by-url-by-alias-id` |
| `/person/updateByFaceImage` | multipart: `token`, `placeID`, `personID`, **`file`** | personID, file | `POST /person/face/update-by-image` |
| `/person/takeFacePicture` | `token`, `placeID`, `deviceID`, `personID` hoặc `aliasID` | placeID, deviceID | `POST /person/face/take-picture` |

`personType`: `0` nhân viên · `1` khách (mặc định sự kiện).

```bash
curl 'https://partner.hanet.ai/person/registerByUrl' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'placeID=903038' \
  --data-urlencode 'name=Nguyen Van A' \
  --data-urlencode 'aliasID=SV001' \
  --data-urlencode 'url=https://domain.com/api/uploads/.../avatar.jpg' \
  --data-urlencode 'personType=1'
```

### 3.6 Person — xóa (khác nhau từng API)

| Partner `POST` | Body (form) | ID dùng | Hub |
|----------------|-------------|---------|-----|
| `/person/remove` | `token`, **`aliasID`** | alias — mọi place | Không map UI bảng personID |
| `/person/removeByPlace` | `token`, **`aliasID`**, **`placeID`** | alias + place | `DELETE /person/by-place?...` |
| `/person/removePersonByListAliasID` | `token`, **`listAliasID`** (csv) | nhiều alias | `POST /person/remove-by-alias-ids` |
| `/person/removeAllPersonInPlace` | `token`, **`placeID`** | place only | `DELETE /person/in-place?placeId=` |
| `/person/removePersonByID` | `token`, **`personID`** | person only | `DELETE /person/by-id?personId=` |

```bash
# Xóa theo personID (admin bảng Người)
curl 'https://partner.hanet.ai/person/removePersonByID' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'personID=2989810350519484416'

# Xóa theo aliasID — KHÁC removePersonByID
curl 'https://partner.hanet.ai/person/remove' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'aliasID=SV001'

curl 'https://partner.hanet.ai/person/removeAllPersonInPlace' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'placeID=903038'
```

Sau xóa qua Hub: `purgeStoredPersons()` trên `face_data` — xem mục 6.1.

### 3.7 Check-in

| Partner `POST` | Body (form) | Bắt buộc | Hub |
|----------------|-------------|----------|-----|
| `/person/getCheckinByPlaceIdInDay` | `token`, `placeID`, **`date`** (`yyyy-MM-dd`) | cả ba | `GET /checkins?placeId=&date=` |
| `/person/getTotalCheckinByPlaceIdInDay` | `token`, `placeID`, `date` | cả ba | (kèm `total`) |
| `/person/getCheckinByPlaceIdInTimestamp` | `token`, `placeID`, **`from`**, **`to`** (`DDMMYYYYHHmmss`) | cả bốn | `GET /checkins/timestamp?...` |
| `/person/getTotalCheckinByPlaceIdInTimestamp` | `token`, `placeID`, `from`, `to` | cả bốn | (kèm `total`) |

```bash
curl 'https://partner.hanet.ai/person/getCheckinByPlaceIdInDay' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'placeID=903038' \
  --data-urlencode 'date=2026-06-16'

curl 'https://partner.hanet.ai/person/getCheckinByPlaceIdInTimestamp' \
  --data-urlencode 'token=<TOKEN>' \
  --data-urlencode 'placeID=903038' \
  --data-urlencode 'from=16062026080000' \
  --data-urlencode 'to=16062026180000'
```

**Response `data[]`:**

| Field | Ghi chú |
|-------|---------|
| `personName`, `personID`, `aliasID` | Rỗng khi `type=2` |
| `type` | `0` vào · `1` ra · `2` chưa nhận diện |
| `checkinTime` | Epoch ms |
| `deviceID`, `deviceName`, `avatar` | Camera + ảnh lượt |

### 3.8 Department (chưa proxy Hub)

`/department/*` — xem Postman; chưa có `/admin/hanet/department/*`.

---

## 4. OAuth & token trong Hub

1. App trên developers.hanet.ai → `HANET_CLIENT_ID`, `HANET_CLIENT_SECRET`.  
2. Lưu `HANET_ACCESS_TOKEN` + `HANET_REFRESH_TOKEN` trong `.env` API.  
3. `HanetApiClient.getAccessToken()` — cache + refresh.  
4. Mọi partner call: `token` trong form body.

**Test:** `POST /api/admin/hanet/test-partner` → `/profile/getProfile`.

Chi tiết biến: `packages/api-server/deploy/nest/.env.example`.

---

## 5. Quy ước tham số Hub ↔ Partner

| Hub (camelCase) | Partner |
|-----------------|---------|
| `placeId` | `placeID` |
| `personId` | `personID` |
| `aliasId` | `aliasID` |
| `deviceId` | `deviceID` |
| `aliasIds` | `listAliasID` (csv) |

- `placeId` trống → `HANET_DEFAULT_PLACE_ID` hoặc place đầu từ `getPlaces`.  
- `getListByPlace`: Hub `pageIndex` **0-based** → partner **`pageIndex + 1`**.  
- Check-in ngày: `yyyy-MM-dd`. Khoảng thời gian: `DDMMYYYYHHmmss`.

Map code: `buildHanetPersonParams()` trong `hanet-partner-params.ts`.

---

## 6. Pitfall & hành vi Hub

### 6.1 List person & `face_data`

Nếu đã sync (`face_data` > 0), admin «Người» **ưu tiên cache local**. Sau xóa HANET → **`purgeStoredPersons`**. `getListByPlace` ~50 person/lần — sync cho dataset lớn.

### 6.2 `registerByUrl`

URL ảnh **HTTPS public** (`API_PUBLIC_URL`). Localhost không tải được. Ưu tiên **JPG**.

### 6.3 `addPlace` / `updatePlace`

Partner dùng field **`name`**, không `placeName`.

### 6.4 Webhook vs API check-in

Webhook: `person_type` `0`/`1`. API list check-in: field `type` (`2` = chưa nhận diện). Xem `hanet-payload.ts`, [`REALTIME.md`](../api-client-pattern/REALTIME.md).

---

## 7. Admin UI & SDK

- UI: `packages/admin-app/src/modules/hanet/*`  
- Endpoint hiển thị: `HANET_PAGE_ENDPOINTS` (`hanet-postman.ts`)  
- HTTP: `api.hanet.*` — không `fetch` trực tiếp partner  
- Mutation: `useAdminMutation`

---

## 8. Checklist agent

1. Đọc mục 3 — **đúng body** (`personID` ≠ `aliasID`).  
2. Product line: `main/api` vs `hub-checkin/api`.  
3. Sửa `hanet-partner.service.ts` / `hanet-admin.service.ts`.  
4. Cập nhật `hanet-postman.ts` + `api-client` nếu đổi Hub route.  
5. Purge `face_data` sau delete person.  
6. `pnpm verify:api-contract` · `pnpm check`.

---

## 9. Tham chiếu code

```ts
// packages/admin-app/src/lib/hanet-postman.ts
export const HANET_POSTMAN_DOCS_URL
export const HANET_PARTNER_ENDPOINTS
export const HANET_PAGE_ENDPOINTS
```

```bash
pnpm graphify:brief --task "API HANET check-in"
```
