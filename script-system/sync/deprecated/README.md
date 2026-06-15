# Script deprecated (sync)

Giữ stub/orchestrator legacy — **không** dùng trong flow chuẩn.

| File | Thay bằng |
|------|-----------|
| `copy-checkin-admin-modules.cjs` | `pnpm pull:checkin` + `pnpm admin:generate:checkin` |
| `sync-checkin-api-copy.cjs` | `pnpm pull:checkin:legacy` (chỉ khi cần copy API thô) |

```bash
pnpm pull:checkin:legacy   # chạy sync-checkin-api-copy.cjs — copy API main → hub-event
```
