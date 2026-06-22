# script-system

Tooling generic tối thiểu cho feature-template.

## Nhóm Giữ Lại

| Nhóm | Vai trò |
|------|---------|
| `admin/` | Generator admin route/config dùng chung |
| `git/` | Push template upstream |
| `lib/` | Helper chung cho script |
| `sync/` | `pull:template`, `post-pull:downstream`, sync profile generic |
| `template/` | File bootstrap downstream tối thiểu |
| `verify/` | Verify shared boundary/template |

## Không Giữ Trong Template

- `dev/`
- `db/`
- `env/`
- `graphify/`
- `api/` script wrappers
- `sync/products/`
- PM2/deploy scripts
- App-specific verify scripts

Các nhóm trên thuộc downstream product hoặc package chuyên trách.

## Kiểm Tra

```bash
pnpm verify:scripts
pnpm check
```
