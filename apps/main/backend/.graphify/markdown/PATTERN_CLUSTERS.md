# Pattern clusters — apps/main/backend (Graphify)

> **Sinh tự động:** `2026-06-12T14:20:21.096Z` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, `AdminRouteLoading`, v.v.).

Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.

## Theo signature nội dung (count ≥ 2)

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/page (29 file)

- `src/app/academic-years/page.tsx`
- `src/app/cameras/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/contact-requests/page.tsx`
- `src/app/courses/page.tsx`
- `src/app/data/page.tsx`
- `src/app/departments/page.tsx`
- `src/app/events/page.tsx`
- … và 21 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/page (23 file)

- `src/app/academic-years/[id]/page.tsx`
- `src/app/cameras/[id]/page.tsx`
- `src/app/categories/[id]/page.tsx`
- `src/app/contact-requests/[id]/page.tsx`
- `src/app/courses/[id]/page.tsx`
- `src/app/departments/[id]/page.tsx`
- `src/app/events/[id]/page.tsx`
- `src/app/guides/[id]/page.tsx`
- … và 15 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/page (22 file)

- `src/app/academic-years/[id]/edit/page.tsx`
- `src/app/cameras/[id]/edit/page.tsx`
- `src/app/categories/[id]/edit/page.tsx`
- `src/app/courses/[id]/edit/page.tsx`
- `src/app/departments/[id]/edit/page.tsx`
- `src/app/events/[id]/edit/page.tsx`
- `src/app/guides/[id]/edit/page.tsx`
- `src/app/locations/[id]/edit/page.tsx`
- … và 14 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/loading (20 file)

- `src/app/academic-years/[id]/loading.tsx`
- `src/app/cameras/[id]/loading.tsx`
- `src/app/categories/[id]/loading.tsx`
- `src/app/contact-requests/[id]/loading.tsx`
- `src/app/courses/[id]/loading.tsx`
- `src/app/departments/[id]/loading.tsx`
- `src/app/events/[id]/loading.tsx`
- `src/app/guides/[id]/loading.tsx`
- … và 12 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/page (20 file)

- `src/app/academic-years/new/page.tsx`
- `src/app/cameras/new/page.tsx`
- `src/app/categories/new/page.tsx`
- `src/app/courses/new/page.tsx`
- `src/app/departments/new/page.tsx`
- `src/app/events/new/page.tsx`
- `src/app/guides/new/page.tsx`
- `src/app/locations/new/page.tsx`
- … và 12 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/[id]/edit/loading (19 file)

- `src/app/academic-years/[id]/edit/loading.tsx`
- `src/app/cameras/[id]/edit/loading.tsx`
- `src/app/categories/[id]/edit/loading.tsx`
- `src/app/courses/[id]/edit/loading.tsx`
- `src/app/departments/[id]/edit/loading.tsx`
- `src/app/events/[id]/edit/loading.tsx`
- `src/app/guides/[id]/edit/loading.tsx`
- `src/app/locations/[id]/edit/loading.tsx`
- … và 11 file tương tự

### AUTO-GENERATED re-export → @workspace/admin-app/modules/*/new/loading (18 file)

- `src/app/academic-years/new/loading.tsx`
- `src/app/cameras/new/loading.tsx`
- `src/app/categories/new/loading.tsx`
- `src/app/courses/new/loading.tsx`
- `src/app/departments/new/loading.tsx`
- `src/app/events/new/loading.tsx`
- `src/app/guides/new/loading.tsx`
- `src/app/locations/new/loading.tsx`
- … và 10 file tương tự

## Theo tên file (basename)

| Basename | Số file | Gợi ý |
|----------|---------|--------|
| `page.tsx` | 99 | CRUD page — logic trong `packages/admin-app` |
| `loading.tsx` | 59 | Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app` |

## Làm mới

`node script-system/graphify/graphify-update.cjs apps/main/backend` → `pnpm graphify:ai-summary`.
