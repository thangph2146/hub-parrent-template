# Pattern clusters — apps/hub-checkin/hub-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.607Z` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, `AdminRouteLoading`, v.v.).

Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.

## Theo signature nội dung (count ≥ 2)

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/page (17 file)

- `src/app/admin/cameras/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/contact-requests/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/file-storage/page.tsx`
- `src/app/admin/guides/page.tsx`
- `src/app/admin/hanet/page.tsx`
- … và 9 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/loading (12 file)

- `src/app/admin/cameras/[id]/loading.tsx`
- `src/app/admin/categories/[id]/loading.tsx`
- `src/app/admin/contact-requests/[id]/loading.tsx`
- `src/app/admin/guides/[id]/loading.tsx`
- `src/app/admin/locations/[id]/loading.tsx`
- `src/app/admin/posts/[id]/loading.tsx`
- `src/app/admin/rbac/[id]/loading.tsx`
- `src/app/admin/screens/[id]/loading.tsx`
- … và 4 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/page (12 file)

- `src/app/admin/cameras/[id]/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/contact-requests/[id]/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- `src/app/admin/locations/[id]/page.tsx`
- `src/app/admin/posts/[id]/page.tsx`
- `src/app/admin/rbac/[id]/page.tsx`
- `src/app/admin/screens/[id]/page.tsx`
- … và 4 file tương tự

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

### Re-export → @workspace/admin-app/modules/*/page (2 file)

- `src/app/(portal)/student/events/page.tsx`
- `src/app/(portal)/student/profile/page.tsx`

## Theo tên file (basename)

| Basename | Số file | Gợi ý |
|----------|---------|--------|
| `page.tsx` | 80 | CRUD page — logic trong `packages/admin-app` |
| `loading.tsx` | 37 | Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app` |
| `index.ts` | 13 | — |
| `layout.tsx` | 7 | — |

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-checkin/hub-checkin-frontend` → `pnpm graphify:ai-summary`.
