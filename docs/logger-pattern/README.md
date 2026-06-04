# @workspace/logger (packages/logger)

Logger dev — gói gọn console output để không log secret/password. Chỉ log khi `NODE_ENV === "development"`.

## Vị trí
- `packages/logger/src/`
- Package namespace: `@workspace/logger`

## Consumer chính
`@workspace/api-client` dùng nội bộ để log API call trong dev. Không gọi trực tiếp từ app code trừ khi mở rộng api-client logging.

## Exports

### `logger` (`logger.ts`)
`{ info, warn, error, debug }` — console logger với prefix `[workspace]`. Mỗi method tự động gắn level.

```ts
import { logger } from "@workspace/logger"
logger.info("Khởi tạo SDK", { version: "1.0" })
// Dev console: [workspace][info] Khởi tạo SDK { version: "1.0" }
// Production: không log gì
```

### `summarizeAuthUser(o)` (`dev-log-format.ts`)
Rút gọn object AuthUser thành 1 dòng text: `AuthUser id=... email=... roles=[...] perms=n=...`.

### `printDevApiCall(options)` (`dev-log-format.ts`)
Gói 1 lần gọi API vào 1 `console.groupCollapsed` — method, path, status, timing, request body (đã redact), response summary, auth.

### `formatDevRequestBody(body)` (`dev-log-format.ts`)
Redact+stringify request body. Trả `undefined` nếu null/undefined. FormData → `{FormData}`.

### `formatDevResponsePayload(status, payload, ok)` (`dev-log-format.ts`)
Format response thành summary text. AuthUser được summarize riêng. Array → `Mảng N phần tử`. Error → trích message.

### `formatDevApiStateHint(path, method, payload, ok)` (`dev-log-format.ts`)
Gợi ý sau login: `sau login: lưu session → X-User-Id=...`.

### `redactForDevExpand(payload)` (`dev-log-format.ts`)
Bản sao đã redact (depth 6) để mở rộng trong DevTools console.

### `buildDevLogResponseJson(path, ok, payload)` (`dev-log-format.ts`)
Build JSON đã redact cho dev log — array lấy preview 2 phần tử, object redact depth 6.

### `printDevApiNetworkError(options)` (`dev-log-format.ts`)
Log lỗi mạng trong 1 groupCollapsed.

## Redact behaviour
- Key nhạy cảm được replace = `[redacted]`: password, currentpassword, newpassword, token, accesstoken, refreshtoken, secret, authorization
- Array bị cap ở 5 phần tử
- Object bị giới hạn depth

## Cách dùng khi cần log từ app
```ts
import { logger } from "@workspace/logger"
logger.info("App boot", { env: process.env.NODE_ENV })
```
