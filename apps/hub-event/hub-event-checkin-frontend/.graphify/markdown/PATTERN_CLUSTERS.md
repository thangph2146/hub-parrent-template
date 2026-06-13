# Pattern clusters — apps/hub-event/hub-event-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T10:59:09.089Z` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, `AdminRouteLoading`, v.v.).

Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.

## Theo signature nội dung (count ≥ 2)

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/page (15 file)

- `src/app/admin/cameras/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/locations/page.tsx`
- `src/app/admin/posts/page.tsx`
- `src/app/admin/rbac/page.tsx`
- … và 7 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/loading (11 file)

- `src/app/admin/cameras/[id]/edit/loading.tsx`
- `src/app/admin/categories/[id]/edit/loading.tsx`
- `src/app/admin/guides/[id]/edit/loading.tsx`
- `src/app/admin/locations/[id]/edit/loading.tsx`
- `src/app/admin/posts/[id]/edit/loading.tsx`
- `src/app/admin/rbac/[id]/edit/loading.tsx`
- `src/app/admin/screens/[id]/edit/loading.tsx`
- `src/app/admin/speakers/[id]/edit/loading.tsx`
- … và 3 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/page (11 file)

- `src/app/admin/cameras/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/locations/[id]/edit/page.tsx`
- `src/app/admin/posts/[id]/edit/page.tsx`
- `src/app/admin/rbac/[id]/edit/page.tsx`
- `src/app/admin/screens/[id]/edit/page.tsx`
- `src/app/admin/speakers/[id]/edit/page.tsx`
- … và 3 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/loading (11 file)

- `src/app/admin/cameras/[id]/loading.tsx`
- `src/app/admin/categories/[id]/loading.tsx`
- `src/app/admin/guides/[id]/loading.tsx`
- `src/app/admin/locations/[id]/loading.tsx`
- `src/app/admin/posts/[id]/loading.tsx`
- `src/app/admin/rbac/[id]/loading.tsx`
- `src/app/admin/screens/[id]/loading.tsx`
- `src/app/admin/speakers/[id]/loading.tsx`
- … và 3 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/page (11 file)

- `src/app/admin/cameras/[id]/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/locations/[id]/page.tsx`
- `src/app/admin/posts/[id]/page.tsx`
- `src/app/admin/rbac/[id]/page.tsx`
- `src/app/admin/screens/[id]/page.tsx`
- `src/app/admin/speakers/[id]/page.tsx`
- … và 3 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/loading (10 file)

- `src/app/admin/cameras/new/loading.tsx`
- `src/app/admin/categories/new/loading.tsx`
- `src/app/admin/guides/new/loading.tsx`
- `src/app/admin/locations/new/loading.tsx`
- `src/app/admin/posts/new/loading.tsx`
- `src/app/admin/screens/new/loading.tsx`
- `src/app/admin/speakers/new/loading.tsx`
- `src/app/admin/staff/new/loading.tsx`
- … và 2 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/page (10 file)

- `src/app/admin/cameras/new/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/locations/new/page.tsx`
- `src/app/admin/posts/new/page.tsx`
- `src/app/admin/screens/new/page.tsx`
- `src/app/admin/speakers/new/page.tsx`
- `src/app/admin/staff/new/page.tsx`
- … và 2 file tương tự

### AdminRouteLoading variant="form" (@ui) (2 file)

- `src/app/admin/new/loading.tsx`
- `src/app/admin/[id]/edit/loading.tsx`

## Theo tên file (basename)

| Basename | Số file | Gợi ý |
|----------|---------|--------|
| `page.tsx` | 70 | CRUD page — logic trong `packages/admin-app` |
| `loading.tsx` | 36 | Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app` |
| `index.ts` | 13 | — |
| `layout.tsx` | 6 | — |

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-event/hub-event-checkin-frontend` → `pnpm graphify:ai-summary`.
