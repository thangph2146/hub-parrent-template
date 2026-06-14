# Pattern clusters — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T21:25:57.420Z` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, `AdminRouteLoading`, v.v.).

Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.

## Theo signature nội dung (count ≥ 2)

- (không có cluster count ≥ 2)

## Theo tên file (basename)

| Basename | Số file | Gợi ý |
|----------|---------|--------|
| `page.tsx` | 21 | CRUD page — logic trong `packages/admin-app` |
| `layout.tsx` | 18 | — |
| `loading.tsx` | 7 | Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app` |
| `index.ts` | 4 | — |

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` → `pnpm graphify:ai-summary`.
