# script-system

Tooling generic tối thiểu cho feature-template upstream.

## Nhóm Giữ Lại

| Nhóm | Vai trò |
|------|---------|
| `admin/` | Generator admin route/config dùng chung |
| `git/` | Push template upstream |
| `lib/` | Helper chung (`monorepo-root`, product line registry) |
| `sync/` | `pull:template`, `init:downstream`, sync profile generic |
| `template/` | File bootstrap downstream tối thiểu |
| `verify/` | Verify shared boundary + template layout |

## Không Thuộc Template

Các nhóm sau thuộc **downstream product** — không sync từ upstream:

- `dev/`, `db/`, `env/`, `graphify/`, `api/` wrappers
- PM2 / deploy / docker-compose
- `data/`, seed runtime, `.env.docker*`
- App-specific verify (api-profile, data-layout, …)

## Kiểm Tra

```bash
pnpm verify:scripts
pnpm check
```
