# Pattern clusters — apps/store-sync/store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.677Z` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, `AdminRouteLoading`, v.v.).

Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.

## Theo signature nội dung (count ≥ 2)

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/page (12 file)

- `src/app/admin/categories/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/promo-codes/page.tsx`
- … và 4 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/page (8 file)

- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/orders/[id]/edit/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`
- `src/app/admin/promo-codes/[id]/edit/page.tsx`
- `src/app/admin/rbac/[id]/edit/page.tsx`
- `src/app/admin/seo-metas/[id]/edit/page.tsx`
- `src/app/admin/staff/[id]/edit/page.tsx`

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/page (8 file)

- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/admin/products/[id]/page.tsx`
- `src/app/admin/promo-codes/[id]/page.tsx`
- `src/app/admin/rbac/[id]/page.tsx`
- `src/app/admin/seo-metas/[id]/page.tsx`
- `src/app/admin/staff/[id]/page.tsx`

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/page (6 file)

- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/promo-codes/new/page.tsx`
- `src/app/admin/seo-metas/new/page.tsx`
- `src/app/admin/staff/new/page.tsx`

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/loading (5 file)

- `src/app/admin/categories/[id]/edit/loading.tsx`
- `src/app/admin/guides/[id]/edit/loading.tsx`
- `src/app/admin/rbac/[id]/edit/loading.tsx`
- `src/app/admin/seo-metas/[id]/edit/loading.tsx`
- `src/app/admin/staff/[id]/edit/loading.tsx`

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/loading (5 file)

- `src/app/admin/categories/[id]/loading.tsx`
- `src/app/admin/guides/[id]/loading.tsx`
- `src/app/admin/rbac/[id]/loading.tsx`
- `src/app/admin/seo-metas/[id]/loading.tsx`
- `src/app/admin/staff/[id]/loading.tsx`

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/loading (4 file)

- `src/app/admin/categories/new/loading.tsx`
- `src/app/admin/guides/new/loading.tsx`
- `src/app/admin/seo-metas/new/loading.tsx`
- `src/app/admin/staff/new/loading.tsx`

## Theo tên file (basename)

| Basename | Số file | Gợi ý |
|----------|---------|--------|
| `page.tsx` | 58 | CRUD page — logic trong `packages/admin-app` |
| `loading.tsx` | 21 | Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app` |
| `layout.tsx` | 19 | — |
| `index.ts` | 3 | — |

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend` → `pnpm graphify:ai-summary`.
