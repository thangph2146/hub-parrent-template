# Pattern clusters — packages/admin-app (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.372Z` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, `AdminRouteLoading`, v.v.).

Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.

## Theo signature nội dung (count ≥ 2)

### Re-export → @workspace/admin-app/routing/admin-form-route-loading (37 file)

- `src/modules/academic-years/new/loading.tsx`
- `src/modules/academic-years/[id]/edit/loading.tsx`
- `src/modules/cameras/new/loading.tsx`
- `src/modules/cameras/[id]/edit/loading.tsx`
- `src/modules/categories/new/loading.tsx`
- `src/modules/categories/[id]/edit/loading.tsx`
- `src/modules/courses/new/loading.tsx`
- `src/modules/courses/[id]/edit/loading.tsx`
- … và 29 file tương tự

### Re-export → @workspace/admin-app/routing/admin-detail-route-loading (19 file)

- `src/modules/academic-years/[id]/loading.tsx`
- `src/modules/cameras/[id]/loading.tsx`
- `src/modules/categories/[id]/loading.tsx`
- `src/modules/contact-requests/[id]/loading.tsx`
- `src/modules/courses/[id]/loading.tsx`
- `src/modules/departments/[id]/loading.tsx`
- `src/modules/events/[id]/loading.tsx`
- `src/modules/guides/[id]/loading.tsx`
- … và 11 file tương tự

### Re-export → @ui/components/admin (16 file)

- `src/modules/academic-years/_component/_alert-dialog/index.ts`
- `src/modules/cameras/_component/_alert-dialog/index.ts`
- `src/modules/categories/_component/_alert-dialog/index.ts`
- `src/modules/courses/_component/_alert-dialog/index.ts`
- `src/modules/departments/_component/_alert-dialog/index.ts`
- `src/modules/events/_component/_alert-dialog/index.ts`
- `src/modules/locations/_component/_alert-dialog/index.ts`
- `src/modules/majors/_component/_alert-dialog/index.ts`
- … và 8 file tương tự

### Re-export → @workspace/admin-app/hooks/use-table-filters (10 file)

- `src/modules/academic-years/_component/_hooks/index.ts`
- `src/modules/courses/_component/_hooks/index.ts`
- `src/modules/departments/_component/_hooks/index.ts`
- `src/modules/locations/_component/_hooks/index.ts`
- `src/modules/majors/_component/_hooks/index.ts`
- `src/modules/posts/_component/_hooks/index.ts`
- `src/modules/speakers/_component/_hooks/index.ts`
- `src/modules/tags/_component/_hooks/index.ts`
- … và 2 file tương tự

## Theo tên file (basename)

| Basename | Số file | Gợi ý |
|----------|---------|--------|
| `index.ts` | 138 | — |
| `page.tsx` | 94 | CRUD page — logic trong `packages/admin-app` |
| `loading.tsx` | 58 | Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app` |
| `types.ts` | 28 | — |
| `columns.tsx` | 27 | — |
| `utils.ts` | 11 | — |

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/admin-app` → `pnpm graphify:ai-summary`.
