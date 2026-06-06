# Realtime Admin (Socket.IO) — chuẩn microservice

Tài liệu mô tả đồng bộ realtime giữa `apps/api` (server) và `apps/backend` (admin client) qua hợp đồng `@workspace/api-client/realtime`.

## Ranh giới service

```
apps/api          — Socket.IO server, emit event, lưu notification DB
packages/api-client/realtime — Hợp đồng event + type + query-key map (client)
apps/backend      — Một socket admin, invalidate React Query + toast
```

- **Không** import `apps/api` từ backend/frontend.
- **Không** import `@workspace/api-client` từ `apps/api` (ESLint boundary).
- Types server (`apps/api/src/socket/socket.types.ts`) và client (`packages/api-client/src/realtime/types.ts`) phải **khớp tên event + shape payload** khi thêm event mới.

## Import chuẩn (backend / frontend)

```typescript
import {
  ADMIN_SOCKET_EVENTS,
  ADMIN_SOCKET_PATH,
  getSocketOriginFromApiBase,
  queryPrefixesForAdminResource,
  resolveRealtimeNotificationToast,
  shouldShowAdminRealtimeToast,
  type AdminCacheInvalidatePayload,
  type AdminStatusChangePayload,
  type SocketNotificationPayload,
} from "@workspace/api-client/realtime"
```

Backend đã mount global listener: `AdminRealtimeSync` → `useAdminRealtimeSync` trong `BackendAdminLayoutProvider`.

## Ba lớp realtime

| Lớp | Event | Khi nào | Client làm gì |
|-----|-------|---------|----------------|
| **Cache** | `admin:invalidate` | Mọi mutation `POST/PUT/PATCH/DELETE` `/admin/{resource}` 2xx | `invalidateQueries` theo `ADMIN_RESOURCE_QUERY_PREFIX` |
| **Duyệt trạng thái** | `admin:status-changed` | Tạo yêu cầu chờ duyệt / đổi status | Chỉ invalidate list (không toast) |
| **Thông báo** | `notification:admin`, `notification:new` | Kèm `admin:status-changed` hoặc activity log | Toast + invalidate `notifications`, `dashboard` (trừ `actorUserId`) |

Event đặc thù (giữ nguyên): `parent-student:reviewed`, `event:attendance`, `session:*`, `role:upsert`.

## API — thêm luồng duyệt mới

1. **Cache tự động** — `AdminRealtimeInterceptor` parse URL `/admin/{resource}`; không cần code thêm nếu route theo pattern CRUD.

2. **Toast + đồng bộ trạng thái** — inject `AdminRealtimeBroadcastService`:

```typescript
// Chờ duyệt (public hoặc user gửi)
this.adminRealtime.pendingApproval({
  resource: 'my-resource',
  id: row.id,
  status: 'pending',
  title: 'Tiêu đề thông báo',
  description: 'Mô tả ngắn',
  actionUrl: '/admin/my-resource',
});

// Đã duyệt / đổi status
this.adminRealtime.statusChanged({
  resource: 'my-resource',
  id: row.id,
  status: 'approved',
  previousStatus: 'pending',
  title: 'Đã duyệt …',
  description: '…',
  actionUrl: `/admin/my-resource/${row.id}`,
  actorUserId: adminUserId,
});
```

3. **Notification lưu DB** — `NotificationsService.create()` tự emit `notification:new` tới `user:{userId}`.

4. **Export service** — đăng ký `SocketModule` trong module domain (`forwardRef` nếu cần).

## Backend — map React Query

Thêm resource vào `packages/api-client/src/realtime/query-keys.ts`:

```typescript
"my-resource": ["my-resource"], // hoặc prefix lồng: ["admin", "my-resource"]
```

Nếu page dùng query key khác pattern, map đúng prefix để `invalidateQueries` khớp.

## Module đã có broadcast duyệt

| Resource | Trigger |
|----------|---------|
| `parent-students` | Phụ huynh gửi yêu cầu; admin duyệt/từ chối |
| `contact-requests` | Public gửi form; admin đổi status |

Các mutation CRUD admin khác: chỉ `admin:invalidate` (list/detail refetch, không toast mặc định).

## Toast — một lần khi API trả kết quả (không trùng socket)

| Tab đang thao tác | Tab / user khác |
|-------------------|-----------------|
| `useAdminMutation` → `MutationCache` hiện loading → success/error **sau response 2xx** | Socket `notification:admin` / `notification:new` (qua `useAdminRealtimeSync`) |

### Ba lớp chống trùng (`toast-coordinator` + `@workspace/ui`)

1. **API client** — `postData` / `putData` / `patchData` / `deleteData` gọi `registerLocalMutationFromApiPath` ngay khi unwrap response thành công.
2. **UI mutation** — `createAdminMutationCache()` + `useAdminMutation` đăng ký thêm `registerLocalMutationFromMeta` từ `mutationKey` / `suppressRealtime` sau toast success.
3. **Socket** — `shouldShowRealtimeSyncToast` bỏ qua tab vừa mutation, `kind: system` cho chính user, dedupe `id`/resource ~4s; API gắn `actorUserId` trên broadcast.

**Không** gọi `toast.success` / `toast.error` thủ công trong `onSuccess` / `onError` của mutation — chỉ dùng option `toast:` hoặc mặc định từ `mutationKey`.

```typescript
import { useAdminMutation, defaultBulkOperationToast } from "@/hooks/use-admin-mutation"

const saveMutation = useAdminMutation({
  mutationKey: ["contact-requests", "update"],
  toast: {
    loading: "Đang lưu…",
    success: "Đã lưu thành công",
    error: (err) => (err instanceof Error ? err.message : "Lỗi"),
  },
  mutationFn: (input) => api.contactRequests.update(id, input),
})

const bulkMutation = useAdminMutation({
  mutationKey: ["categories", "bulk"],
  toast: defaultBulkOperationToast,
  mutationFn: (input) => api.categories.bulk(input),
})
```

### Realtime hook (admin app)

Backend mount `AdminRealtimeSync` → `useAdminRealtimeSync` trong layout. App admin mới copy pattern từ `apps/backend/src/hooks/use-admin-realtime-sync.ts` (socket + `shouldShowRealtimeSyncToast`).

## Kiểm tra thủ công

1. Hai tab admin, hai tài khoản khác nhau.
2. Tab A thao tác (duyệt, sửa status, CRUD).
3. Tab B: list refetch trong vài giây; toast khi có `admin:status-changed` / `notification:admin`.

## Lệnh

```bash
pnpm check
```
