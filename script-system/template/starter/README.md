# Product starter packs

Thư mục `starter/<productLine>/` được copy vào repo downstream khi chạy `init-downstream.cjs`.

| Product line | Nội dung |
|--------------|----------|
| `hub-parent/` | `apps/hub-parent/`, `scripts/dev`, `scripts/pm2` |

Upstream **không chạy** starter — chỉ dùng khi bootstrap product repo mới.

Sau bootstrap:

```bash
# đổi "name" trong package.json
pnpm install
pnpm dev
```
