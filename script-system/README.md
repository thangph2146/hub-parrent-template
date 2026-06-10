# script-system

Script vận hành monorepo (dev, PM2, graphify, verify) — **không** nhầm với `apps/*/scripts/` (script riêng từng app).

| File | Mục đích |
|------|----------|
| `kill-ports.mjs` | Giải phóng cổng dev (3000–3002) |
| `dev-stack.cjs` | Dev stack qua Turbo: `@api` trong tasks; app web đợi port API (`HUB_DEV_WAIT_API`) — `pnpm dev:checkin` |
| `wait-api-port.cjs` | Chờ TCP port API (CLI / dùng nội bộ) |
| `conditional-api-wait.cjs` | Hook `predev` app web — chỉ chờ khi chạy qua `dev-stack.cjs` |
| `pm2-stack.cjs` | Start/reload/stop stack PM2 (parent / checkin / store) |
| `graphify-update.cjs` | Cập nhật snapshot graph từng app |
| `graphify-ai-summary.mjs` | Sinh markdown AI summary (`pnpm graphify:ai-summary`) |
| `verify-service-boundaries.mjs` | `pnpm verify:bounds` |
| `verify-no-sdk-http.mjs` | `pnpm verify:sdk-http` |
| `verify-permission-parity.mjs` | `pnpm verify:permissions` |

Gọi qua shortcut root `package.json` (vd. `pnpm kill:parent`, `pnpm pm2:start`, `pnpm graphify:refresh`).
