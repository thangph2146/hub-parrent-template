# API Client Pattern (packages/api-client)

Tài liệu này mô tả cách `apps/frontend` và `apps/backend` gọi `apps/api` qua `@workspace/api-client`.

## Kiến trúc tổng quan

```
@workspace/api-client
  src/
    client.ts       -- ApiClient (core HTTP, fetch wrapper)
    sdk.ts          -- StoreSyncSdk (facade, 24 resource APIs)
    index.ts        -- Barrel exports
    types.ts        -- Shared DTO types (User, Category, ...)
    utils.ts        -- PagedResult<T>, slugify, formatDateTime
    permissions.ts  -- PERMISSION_CODES, canUserAccess
    resources/
      _shared.ts    -- unwrapApiEnvelope, normalizePagedResult, getData/postData/putData/deleteData
      posts.ts      -- Resource API class (Pattern A)
      categories.ts -- Resource API class (Pattern B)
      my-students.ts-- Resource API class (Pattern C)
      ...
```

## Cách sử dụng

```typescript
import { createStoreSyncSdk } from "@workspace/api-client"

const api = createStoreSyncSdk({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  getUserId: () => getCookie("userId"),
  getAuthToken: () => getCookie("token"),
  devLogTag: "HUB_ADMIN",
})

// Gọi API
const posts = await api.posts.list({ page: 1, limit: 50 })
const user  = await api.users.get("abc-123")
```

**Nguyên tắc**: Frontend/Backend KHÔNG gọi trực tiếp `apps/api`. Mọi request đều qua `@workspace/api-client`.

## ApiClient (`client.ts`)

### Options
| Option | Mô tả |
|--------|-------|
| `baseUrl` | Base URL (vd: `http://localhost:3002/api`) |
| `getAuthToken` | Lazy resolver → Bearer token |
| `getUserId` | Lazy resolver → `X-User-Id` header |
| `timeoutMs` | Timeout (mặc định 15s) |
| `devLogging` | Log dev mỗi request (mặc định `NODE_ENV === 'development'`) |

### Request flow
1. `buildUrl()` — join baseUrl + path + query params (percent-encode tự động)
2. Merge headers: defaults + Auth Bearer + X-User-Id + per-request
3. Body: JSON stringify (trừ FormData)
4. AbortController với timeout
5. `fetch()` → parse JSON response
6. Response không ok → throw `ApiError`
7. Dev logging qua `@workspace/logger`

### ApiError
```typescript
class ApiError extends Error {
  status: number      // HTTP status
  statusText: string
  body: unknown       // Parsed response body
  message: string     // Extracted from body.message
}
```

## Resource class patterns

### Pattern A — Simple generic (posts, tags, events, ...)
```typescript
class PostsApi {
  constructor(private readonly http: ApiClient) {}
  async list<T = unknown>(params?): Promise<{ items: T[]; total: number }>
  async get<T = unknown>(id: string): Promise<T>
  async create<T = unknown>(body: Record<string, unknown>): Promise<T>
  async update<T = unknown>(id: string, body: Record<string, unknown>): Promise<T>
  async remove(id: string): Promise<void>
  async restore<T = unknown>(id: string): Promise<T>
  async purge(id: string): Promise<void>
  async bulk(body: { action: string; ids: string[] }): Promise<void>
}
```

### Pattern B — Typed + mapping (categories, users, ...)
```typescript
class CategoriesApi {
  // Map API response → frontend type
  async list(params?): Promise<{ items: Category[]; total: number }>
  async get(id: string): Promise<Category>
  async create(input: CreateCategoryInput): Promise<Category>
  async update(id: string, input: UpdateCategoryInput): Promise<Category>
  async remove(id: string): Promise<void>
  async restore(id: string): Promise<Category>
  async purgeTrashed(id: string): Promise<void>
  async bulk(body): Promise<void>
}
```
Pattern B dùng `mapCategory()` để normalize API shape.

### Pattern C — Non-admin (my-students, system, ...)
```typescript
class MyStudentsApi {
  async list(): Promise<{ items: ParentStudent[] }>
  async add(input: AddStudentInput): Promise<ParentStudent>
  async remove(id: string): Promise<void>
}
```
Pattern C dùng path prefix khác (`/parent/`) và ít methods hơn.

## Response normalization (`_shared.ts`)

### unwrapApiEnvelope
```typescript
// API response: { success, message, data }
// → unwrap trả về `data`
// success === false → throw ApiError
```

### normalizePagedResult
```typescript
// Hỗ trợ 3 shapes:
// { data: T[], pagination: { total } }  ← API envelope
// { items: T[], total }                  ← Normalized
// T[] (bare array)                       ← Fallback
// → { items: T[], total: number }
```

### Helper wrappers
- `getData<T>(http, path, options?)` → call + unwrap
- `postData<T>(http, path, body?, options?)` → call + unwrap
- `putData<T>(http, path, body?, options?)` → call + unwrap
- `deleteData<T>(http, path, options?)` → call + unwrap

## Cách thêm resource API mới

1. Tạo file `packages/api-client/src/resources/<resource>.ts`
2. Tạo class `<Resource>Api` extends pattern A/B/C
3. Import và khai báo trong `packages/api-client/src/sdk.ts` (thêm property + constructor line)
4. Export class từ `packages/api-client/src/index.ts`

Xem resource hiện có trong `packages/api-client/src/resources/` để lấy mẫu.

## Permissions

```typescript
import { PERMISSION_CODES, canUserAccess } from "@workspace/api-client"

canUserAccess(user, PERMISSION_CODES.POSTS.VIEW)  // true/false
```

- `PERMISSION_CODES` — object resource:action
- `canUserAccess(user, code)` — super_admin bypass hoặc hasPermission
- `hasPermission(granted, code)` — check `*` wildcard
- Chỉ dùng ở frontend/backend app, KHÔNG dùng ở `apps/api` (API trust X-User-Id)

## PagedResult

```typescript
interface PagedResult<T> {
  items: T[]
  total: number
}
```
Đây là type chuẩn cho mọi response phân trang, sử dụng ở frontend/backend app.

## Realtime admin (Socket.IO)

Hợp đồng event, type, query-key map và toast helper nằm tại:

- **Package:** `@workspace/api-client/realtime`
- **Chi tiết:** [REALTIME.md](./REALTIME.md)

Backend mount một socket global (`AdminRealtimeSync`); API emit qua `SocketGateway` + `AdminRealtimeBroadcastService`. Không tạo socket riêng cho CRUD/duyệt trạng thái trừ event đặc thù (vd. `event:attendance`, phụ huynh `my-students`).
