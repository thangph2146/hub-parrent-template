# Cấu hình @workspace/api-server

| File | Vai trò |
|------|---------|
| `product-lines.cjs` | Đường dẫn API app trong monorepo |
| `template.config.cjs` | Template OOP: skip sync, banner, list module; `SYNC_SKIP_SRC_DIRS` (vd. `testing/`) |
| `render.config.cjs` | `resolveApiModules`, infra hub-event, admin map |
| `package-module-templates.cjs` | Registry Base*Service/Controller/Module từ `src/modules` + chiến lược materialize |
| `package-module-bindings.cjs` | Generator binding mỏng (`materialize: thin`) |
| `template-common.cjs` | Danh sách + path infra Nest (`deploy/template-common/`) |
| `module-bindings.cjs` | CRUD admin chuẩn (`materialize: crud`) |
| `manual-package-module-overrides.cjs` | Override binding phức tạp (đọc stub từ `overrides/`) |
| `auto-package-module-bindings.cjs` | Generator config binding (nội bộ) |
| `overrides/*.ts` | Stub TypeScript cho system, notifications, event-registrations, … |

Script render/sync: `packages/api-server/deploy/cli/`.
