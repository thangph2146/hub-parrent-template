# Pipeline artifacts (API)

Output tự sinh từ `pnpm api:sync-template` / `pnpm api:registry:sync` — **không** đặt lẫn ở root `apps/*/api/`.

| File | Mô tả |
|------|--------|
| `PACKAGE_MODULE_TEMPLATES.meta.json` | Registry module Base* (42 module) |

Commit git: chỉ **`apps/main/api/.pipeline/`** và **`packages/api-server/deploy/nest/.pipeline/`**.  
Deploy line (`hub-event`, `hub-parent`, `store-sync`): `.pipeline/` gitignore — tái tạo khi sync/render.
