# Pattern clusters — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.516Z` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, `AdminRouteLoading`, v.v.).

Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.

## Theo signature nội dung (count ≥ 2)

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/page (30 file)

- `src/app/admin/academic-years/page.tsx`
- `src/app/admin/cameras/page.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/contact-requests/page.tsx`
- `src/app/admin/courses/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/data/page.tsx`
- `src/app/admin/departments/page.tsx`
- … và 22 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/page (23 file)

- `src/app/admin/academic-years/[id]/page.tsx`
- `src/app/admin/cameras/[id]/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/contact-requests/[id]/page.tsx`
- `src/app/admin/courses/[id]/page.tsx`
- `src/app/admin/departments/[id]/page.tsx`
- `src/app/admin/events/[id]/page.tsx`
- `src/app/admin/guides/[id]/page.tsx`
- … và 15 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/page (22 file)

- `src/app/admin/academic-years/[id]/edit/page.tsx`
- `src/app/admin/cameras/[id]/edit/page.tsx`
- `src/app/admin/categories/[id]/edit/page.tsx`
- `src/app/admin/courses/[id]/edit/page.tsx`
- `src/app/admin/departments/[id]/edit/page.tsx`
- `src/app/admin/events/[id]/edit/page.tsx`
- `src/app/admin/guides/[id]/edit/page.tsx`
- `src/app/admin/locations/[id]/edit/page.tsx`
- … và 14 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/loading (20 file)

- `src/app/admin/academic-years/[id]/loading.tsx`
- `src/app/admin/cameras/[id]/loading.tsx`
- `src/app/admin/categories/[id]/loading.tsx`
- `src/app/admin/contact-requests/[id]/loading.tsx`
- `src/app/admin/courses/[id]/loading.tsx`
- `src/app/admin/departments/[id]/loading.tsx`
- `src/app/admin/events/[id]/loading.tsx`
- `src/app/admin/guides/[id]/loading.tsx`
- … và 12 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/page (20 file)

- `src/app/admin/academic-years/new/page.tsx`
- `src/app/admin/cameras/new/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/courses/new/page.tsx`
- `src/app/admin/departments/new/page.tsx`
- `src/app/admin/events/new/page.tsx`
- `src/app/admin/guides/new/page.tsx`
- `src/app/admin/locations/new/page.tsx`
- … và 12 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/loading (19 file)

- `src/app/admin/academic-years/[id]/edit/loading.tsx`
- `src/app/admin/cameras/[id]/edit/loading.tsx`
- `src/app/admin/categories/[id]/edit/loading.tsx`
- `src/app/admin/courses/[id]/edit/loading.tsx`
- `src/app/admin/departments/[id]/edit/loading.tsx`
- `src/app/admin/events/[id]/edit/loading.tsx`
- `src/app/admin/guides/[id]/edit/loading.tsx`
- `src/app/admin/locations/[id]/edit/loading.tsx`
- … và 11 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/loading (18 file)

- `src/app/admin/academic-years/new/loading.tsx`
- `src/app/admin/cameras/new/loading.tsx`
- `src/app/admin/categories/new/loading.tsx`
- `src/app/admin/courses/new/loading.tsx`
- `src/app/admin/departments/new/loading.tsx`
- `src/app/admin/events/new/loading.tsx`
- `src/app/admin/guides/new/loading.tsx`
- `src/app/admin/locations/new/loading.tsx`
- … và 10 file tương tự

## Theo tên file (basename)

| Basename | Số file | Gợi ý |
|----------|---------|--------|
| `page.tsx` | 126 | CRUD page — logic trong `packages/admin-app` |
| `loading.tsx` | 65 | Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app` |
| `layout.tsx` | 19 | — |
| `index.ts` | 6 | — |

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` → `pnpm graphify:ai-summary`.
