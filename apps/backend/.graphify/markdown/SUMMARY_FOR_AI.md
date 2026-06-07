# Hub admin — @backend — tóm tắt cho AI (Graphify)

> Tự động sinh từ `../snapshot/context.json` — **đọc file này trước**; tránh mở toàn bộ JSON snapshot (nhúng source đầy đủ).

- **projectRoot:** `C:/HUB/source/hub-parent-template/apps/backend`
- **context.generatedAt:** 2026-06-07T08:18:38.034Z

## Mục lục artefact Graphify

- **Markdown (ưu tiên đọc):** file này — [`FOLDER_TREE.md`](FOLDER_TREE.md), [`GRAPH_STATS.md`](GRAPH_STATS.md)
- **Snapshot (JSON nặng):** [`../snapshot/context.json`](../snapshot/context.json), [`../snapshot/graph.json`](../snapshot/graph.json) — chỉ mở khi cần trích source hoặc đồ thị đầy đủ.
- **Quy ước thư mục `.graphify` (tay):** [`../README.md`](../README.md).

## Liên kết dịch vụ & tài liệu hub

App **không** import chéo source `apps/*`; giao tiếp qua **HTTP** + `@workspace/api-client` (và `fetch` public ở storefront khi cần).

### Graphify — markdown các phần còn lại của monorepo

- **@frontend:** [SUMMARY](../../../../apps/frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../apps/frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../apps/frontend/.graphify/markdown/GRAPH_STATS.md)
- **@api:** [SUMMARY](../../../../apps/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../apps/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../apps/api/.graphify/markdown/GRAPH_STATS.md)
- **packages:** [SUMMARY](../../../../packages/.graphify/markdown/SUMMARY_FOR_AI.md) · [WORKSPACE_DEPS](../../../../packages/.graphify/markdown/WORKSPACE_DEPS.md)
- **monorepo (chỉ mục + chủ đề):** [SUMMARY gốc](../../../../.graphify/markdown/SUMMARY_FOR_AI.md)

### Tài liệu hub (không sinh bởi Graphify)

- [MICROSERVICE_SYSTEM_MAP](../../../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) — boundaries, ORM, checklist.
- [AGENTS_GUIDE](../../../../docs/admin-pattern/AGENTS_GUIDE.md) — thứ tự đọc cho agent.
- [AGENTS.md](../../../../AGENTS.md) — `pnpm check`, `check:full`.

## Bản đồ từ snapshot/graph.json

- **Cây thư mục `src/`:** [`FOLDER_TREE.md`](FOLDER_TREE.md) (ASCII từ `../snapshot/graph.json`).
- **Thống kê graph:** [`GRAPH_STATS.md`](GRAPH_STATS.md) — quy mô node/link, top file in/out-degree (điểm nóng import).

## Thống kê
- **totalFiles:** 546
- **clientComponents:** 224

## Trang (pages) (88)
- `src/app/academic-years/new/page.tsx`
- `src/app/academic-years/page.tsx`
- `src/app/academic-years/[id]/edit/page.tsx`
- `src/app/academic-years/[id]/page.tsx`
- `src/app/cameras/new/page.tsx`
- `src/app/cameras/page.tsx`
- `src/app/cameras/[id]/edit/page.tsx`
- `src/app/cameras/[id]/page.tsx`
- `src/app/categories/new/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/categories/[id]/edit/page.tsx`
- `src/app/categories/[id]/page.tsx`
- `src/app/contact-requests/page.tsx`
- `src/app/contact-requests/[id]/page.tsx`
- `src/app/courses/new/page.tsx`
- `src/app/courses/page.tsx`
- `src/app/courses/[id]/edit/page.tsx`
- `src/app/courses/[id]/page.tsx`
- `src/app/data/page.tsx`
- `src/app/database-schema/page.tsx`
- `src/app/departments/new/page.tsx`
- `src/app/departments/page.tsx`
- `src/app/departments/[id]/edit/page.tsx`
- `src/app/departments/[id]/page.tsx`
- `src/app/events/new/page.tsx`
- `src/app/events/page.tsx`
- `src/app/events/[id]/edit/page.tsx`
- `src/app/events/[id]/page.tsx`
- `src/app/file-storage/page.tsx`
- `src/app/graph/page.tsx`
- `src/app/guides/new/page.tsx`
- `src/app/guides/page.tsx`
- `src/app/guides/[id]/edit/page.tsx`
- `src/app/guides/[id]/page.tsx`
- `src/app/locations/new/page.tsx`
- `src/app/locations/page.tsx`
- `src/app/locations/[id]/edit/page.tsx`
- `src/app/locations/[id]/page.tsx`
- `src/app/login/page.tsx`
- `src/app/majors/new/page.tsx`
- `src/app/majors/page.tsx`
- `src/app/majors/[id]/edit/page.tsx`
- `src/app/majors/[id]/page.tsx`
- `src/app/my-students/page.tsx`
- `src/app/page.tsx`
- `src/app/parent-students/page.tsx`
- `src/app/posts/new/page.tsx`
- `src/app/posts/page.tsx`
- `src/app/posts/[id]/edit/page.tsx`
- `src/app/posts/[id]/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/rbac/page.tsx`
- `src/app/rbac/[id]/edit/page.tsx`
- `src/app/rbac/[id]/page.tsx`
- `src/app/register/page.tsx`
- `src/app/screens/new/page.tsx`
- `src/app/screens/page.tsx`
- `src/app/screens/[id]/edit/page.tsx`
- `src/app/screens/[id]/page.tsx`
- `src/app/seo-metas/new/page.tsx`
- `src/app/seo-metas/page.tsx`
- `src/app/seo-metas/[id]/edit/page.tsx`
- `src/app/seo-metas/[id]/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/speakers/new/page.tsx`
- `src/app/speakers/page.tsx`
- `src/app/speakers/[id]/edit/page.tsx`
- `src/app/speakers/[id]/page.tsx`
- `src/app/staff/new/page.tsx`
- `src/app/staff/page.tsx`
- `src/app/staff/[id]/edit/page.tsx`
- `src/app/staff/[id]/page.tsx`
- `src/app/tags/new/page.tsx`
- `src/app/tags/page.tsx`
- `src/app/tags/[id]/edit/page.tsx`
- `src/app/tags/[id]/page.tsx`
- `src/app/templates/new/page.tsx`
- `src/app/templates/page.tsx`
- `src/app/templates/[id]/edit/page.tsx`
- `src/app/templates/[id]/page.tsx`
- `src/app/training-levels/new/page.tsx`
- `src/app/training-levels/page.tsx`
- `src/app/training-levels/[id]/edit/page.tsx`
- `src/app/training-levels/[id]/page.tsx`
- `src/app/training-systems/new/page.tsx`
- `src/app/training-systems/page.tsx`
- `src/app/training-systems/[id]/edit/page.tsx`
- `src/app/training-systems/[id]/page.tsx`

## Layout (1)
- `src/app/layout.tsx`

## API routes (1)
- `src/app/api/graphify/route.ts`

## Góc hệ thống (@backend) — đường dẫn gợi ý

- **Root layout:** `src/app/layout.tsx`
- **Route handlers dưới `src/app/api/`:** 1 file (danh sách `apiRoutes` ở trên nếu có).

## Module map (không có nội dung file)

| File | Loại | Client | Exports | Imports |
|------|------|--------|---------|---------|
| `components.json` | config | — | — | — |
| `next.config.ts` | config | — | — | — |
| `package.json` | config | — | — | — |
| `src/app/academic-years/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/academic-years/[id]/edit/page.tsx` | page | yes | EditAcademicYearPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/academic-years/_component, src/hooks/use-admin-mutation.ts |
| `src/app/academic-years/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/academic-years/[id]/page.tsx` | page | yes | AcademicYearDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/academic-years/_component |
| `src/app/academic-years/_component/_alert-dialog/index.ts` | ts | no | AcademicYearsConfirmDialog |  |
| `src/app/academic-years/_component/_form/academic-year-form-shell.tsx` | tsx | yes | AcademicYearFormShellProps, AcademicYearFormShell | src/app/academic-years/_component/types.ts |
| `src/app/academic-years/_component/_form/index.ts` | ts | no | AcademicYearFormShell | src/app/academic-years/_component/_form/academic-year-form-shell.tsx |
| `src/app/academic-years/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildAcademicYearPayload, useAcademicYearForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/academic-years/_component/_hooks/use-academic-years-actions.ts |
| `src/app/academic-years/_component/_hooks/use-academic-years-actions.ts` | ts | no | buildAcademicYearPayload, useAcademicYearForm, useHandleConfirmAction, useConfirmAction | src/app/academic-years/_component/types.ts |
| `src/app/academic-years/_component/_query/index.ts` | ts | no | academicYearDetailQueryKey, prefetchAcademicYearDetail, useAcademicYearDetailQuery, useAcademicYearsListQuery, UseTrashQueryProps, useAcademicYearsTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/academic-years/_component/types.ts |
| `src/app/academic-years/_component/_table/academic-years-table.tsx` | tsx | yes | AcademicYearsTableProps, AcademicYearsTable | src/app/academic-years/_component/types.ts |
| `src/app/academic-years/_component/_table/academic-years-trash-table.tsx` | tsx | yes | AcademicYearsTrashTableProps, AcademicYearsTrashTable | src/app/academic-years/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/academic-years/_component/_table/index.ts` | ts | no | AcademicYearsTable, AcademicYearsTrashTable | src/app/academic-years/_component/_table/academic-years-table.tsx, src/app/academic-years/_component/_table/academic-years-trash-table.tsx |
| `src/app/academic-years/_component/columns.tsx` | tsx | yes | getAcademicYearColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/academic-years/_component/types.ts |
| `src/app/academic-years/_component/index.ts` | ts | no | academicYearFormSchema, getAcademicYearColumns, useAcademicYearDetailQuery, useAcademicYearsListQuery, useAcademicYearsTrashQuery, academicYearDetailQueryKey, prefetchAcademicYearDetail, useColumnFilt | src/app/academic-years/_component/types.ts, src/app/academic-years/_component/columns.tsx, src/app/academic-years/_component/_query, src/app/academic-years/_component/_hooks, src/app/academic-years/_c |
| `src/app/academic-years/_component/types.ts` | ts | no | AcademicYearRow, AcademicYearConfirmAction, academicYearFormSchema, AcademicYearFormValues, AcademicYearDetail |  |
| `src/app/academic-years/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/academic-years/new/page.tsx` | page | yes | NewAcademicYearPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/academic-years/_component, src/hooks/use-admin-mutation.ts |
| `src/app/academic-years/page.tsx` | page | yes | AcademicYearsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/academic-years/_component, src/ho |
| `src/app/api/graphify/route.ts` | api-route | no |  |  |
| `src/app/cameras/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/cameras/[id]/edit/page.tsx` | page | yes | EditCameraPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/cameras/_component, src/hooks/use-admin-mutation.ts |
| `src/app/cameras/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/cameras/[id]/page.tsx` | page | yes | CameraDetailPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/cameras/_component, src/providers/auth-provider.tsx |
| `src/app/cameras/_component/_alert-dialog/index.ts` | ts | no | CamerasConfirmDialog |  |
| `src/app/cameras/_component/_form/camera-form-shell.tsx` | tsx | yes | CameraFormShellProps, CameraFormShell | src/lib/api.ts, src/app/events/_component/_query, src/app/cameras/_component/types.ts |
| `src/app/cameras/_component/_form/index.ts` | ts | no | CameraFormShell | src/app/cameras/_component/_form/camera-form-shell.tsx |
| `src/app/cameras/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildCameraPayload, useCameraForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/cameras/_component/_hooks/use-cameras-actions.ts |
| `src/app/cameras/_component/_hooks/use-cameras-actions.ts` | ts | no | buildCameraPayload, useCameraForm, useHandleConfirmAction, useConfirmAction | src/app/cameras/_component/types.ts |
| `src/app/cameras/_component/_query/index.ts` | ts | no | useCameraDetailQuery, useCamerasListQuery, useCamerasTrashQuery, cameraDetailQueryKey, prefetchCameraDetail | src/app/cameras/_component/_query/use-cameras-queries.ts |
| `src/app/cameras/_component/_query/use-cameras-queries.ts` | ts | no | cameraDetailQueryKey, prefetchCameraDetail, useCameraDetailQuery, useCamerasListQuery, useCamerasTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/cameras/_component/types.ts |
| `src/app/cameras/_component/_table/cameras-table.tsx` | tsx | yes | CamerasTable | src/app/cameras/_component/types.ts |
| `src/app/cameras/_component/_table/cameras-trash-table.tsx` | tsx | yes | CamerasTrashTable | src/app/cameras/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/cameras/_component/_table/index.ts` | ts | no | CamerasTable, CamerasTrashTable | src/app/cameras/_component/_table/cameras-table.tsx, src/app/cameras/_component/_table/cameras-trash-table.tsx |
| `src/app/cameras/_component/columns.tsx` | tsx | yes | getCameraColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/cameras/_component/types.ts |
| `src/app/cameras/_component/index.ts` | ts | no | cameraFormSchema, getCameraColumns, useCameraDetailQuery, useCamerasListQuery, useCamerasTrashQuery, cameraDetailQueryKey, prefetchCameraDetail, useColumnFiltersChange, useClearListFilters, useClearTr | src/app/cameras/_component/types.ts, src/app/cameras/_component/columns.tsx, src/app/cameras/_component/_query, src/hooks/use-table-filters.ts, src/app/cameras/_component/_hooks, src/app/cameras/_comp |
| `src/app/cameras/_component/types.ts` | ts | no | CameraRow, CameraConfirmAction, cameraFormSchema, CameraFormValues, CameraDetail |  |
| `src/app/cameras/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/cameras/new/page.tsx` | page | yes | NewCameraPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/cameras/_component, src/hooks/use-admin-mutation.ts |
| `src/app/cameras/page.tsx` | page | yes | CamerasPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/cameras/_component, src/hooks/use |
| `src/app/categories/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/categories/[id]/edit/page.tsx` | page | yes | EditCategoryPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/categories/_component, src/hooks/use-admin-mutation.ts |
| `src/app/categories/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/categories/[id]/page.tsx` | page | yes | CategoryDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/categories/_component |
| `src/app/categories/_component/_alert-dialog/index.ts` | ts | no | CategoriesConfirmDialog |  |
| `src/app/categories/_component/_form/category-form-shell.tsx` | tsx | yes | CategoryFormShellProps, CategoryFormShell | src/app/categories/_component/types.ts, src/app/categories/_component/_hooks |
| `src/app/categories/_component/_form/index.ts` | ts | no | CategoryFormShell | src/app/categories/_component/_form/category-form-shell.tsx |
| `src/app/categories/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, useHandleConfirmAction, useCategoryForm, useConfirmAction, buildCategoryPayload, categoryFormSchema, ROOT_PARENT_VALUE, getCategoryDe | src/hooks/use-table-filters.ts, src/app/categories/_component/_hooks/use-categories-actions.ts |
| `src/app/categories/_component/_hooks/use-categories-actions.ts` | ts | no | ROOT_PARENT_VALUE, buildCategoryPayload, categoryFormSchema, CategoryFormValues, getCategoryDefaultValues, useCategoryForm, useHandleConfirmAction, useConfirmAction | src/app/categories/_component/types.ts |
| `src/app/categories/_component/_hooks/use-categories-filters.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters |  |
| `src/app/categories/_component/_query/index.ts` | ts | no | categoryDetailQueryKey, prefetchCategoryDetail, useCategoryDetailQuery, UseCategoriesQueryProps, useCategoriesQuery, UseTrashQueryProps, useTrashQuery, useCategoriesOptionsQuery | src/lib/admin-detail-query.ts, src/app/categories/_component/types.ts |
| `src/app/categories/_component/_table/categories-table.tsx` | tsx | yes | CategoriesTableProps, CategoriesTable | src/app/categories/_component/types.ts |
| `src/app/categories/_component/_table/categories-trash-table.tsx` | tsx | yes | CategoriesTrashTableProps, CategoriesTrashTable | src/app/categories/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/categories/_component/_table/index.ts` | ts | no | CategoriesTable, CategoriesTrashTable | src/app/categories/_component/_table/categories-table.tsx, src/app/categories/_component/_table/categories-trash-table.tsx |
| `src/app/categories/_component/columns.tsx` | tsx | yes | getCategoryColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/categories/_component/types.ts |
| `src/app/categories/_component/index.ts` | ts | no | getCategoryColumns, slugify, buildCategoryOptionTree, unwrapEnvelope, normalizePaged, buildCategoriesFilterQuery, formatDateTime, useColumnFiltersChange, useClearListFilters, useClearTrashFilters, use | src/app/categories/_component/columns.tsx, src/app/categories/_component/utils.ts, src/app/categories/_component/_hooks, src/app/categories/_component/_table, src/app/categories/_component/_alert-dial |
| `src/app/categories/_component/types.ts` | ts | no | CategoryRow, CategoryTreeOption, CategoryConfirmAction, FormState, CategoryDetail |  |
| `src/app/categories/_component/utils.ts` | ts | no | buildCategoriesFilterQuery, slugify, formatDateTime, buildCategoryOptionTree, unwrapEnvelope, normalizePaged | src/lib |
| `src/app/categories/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/categories/new/page.tsx` | page | yes | NewCategoryPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/categories/_component, src/hooks/use-admin-mutation.ts |
| `src/app/categories/page.tsx` | page | yes | CategoriesPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib/admin-row-action-handlers.ts, src/app/categories/_component, src/app/categories/ |
| `src/app/contact-requests/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/contact-requests/[id]/page.tsx` | page | yes | ContactRequestDetailPage | src/lib/admin-navigation.ts, src/hooks/queries.ts, src/app/contact-requests/_component/_query, src/app/contact-requests/_component/types.ts, src/app/contact-requests/_component/utils.ts |
| `src/app/contact-requests/_component/_alert-dialog/contact-confirm-dialog.tsx` | tsx | no | ContactConfirmDialog, ContactBulkConfirmDialog | src/app/contact-requests/_component/types.ts |
| `src/app/contact-requests/_component/_alert-dialog/index.ts` | ts | no |  | src/app/contact-requests/_component/_alert-dialog/contact-confirm-dialog.tsx |
| `src/app/contact-requests/_component/_query/index.ts` | ts | no |  | src/app/contact-requests/_component/_query/use-contact-queries.ts |
| `src/app/contact-requests/_component/_query/use-contact-queries.ts` | ts | yes | useCreateContactRequest, useUpdateContactRequest, useDeleteContactRequest, useRestoreContactRequest, usePurgeContactRequest, useBulkDeleteContactRequest, useBulkRestoreContactRequest, useBulkPurgeCont | src/lib/api.ts, src/hooks/use-admin-mutation.ts |
| `src/app/contact-requests/_component/_table/contact-table.tsx` | tsx | no | ContactRequestTable | src/lib/api.ts, src/app/contact-requests/_component/columns.tsx, src/app/contact-requests/_component/types.ts |
| `src/app/contact-requests/_component/_table/contact-trash-table.tsx` | tsx | no | ContactRequestTrashTable | src/lib/api.ts, src/lib/admin-xlsx-export.ts, src/app/contact-requests/_component/columns.tsx, src/app/contact-requests/_component/contact-export.ts, src/app/contact-requests/_component/types.ts |
| `src/app/contact-requests/_component/_table/index.ts` | ts | no |  | src/app/contact-requests/_component/_table/contact-table.tsx, src/app/contact-requests/_component/_table/contact-trash-table.tsx |
| `src/app/contact-requests/_component/columns.tsx` | tsx | yes | ContactRequestColumnsProps, getContactRequestColumns | src/lib/admin-table-columns.tsx, src/app/contact-requests/_component/types.ts, src/app/contact-requests/_component/utils.ts, src/app/contact-requests/_component/contact-row-actions.tsx |
| `src/app/contact-requests/_component/contact-export.ts` | ts | no | parseContactStructuredContent, getContactRequestExportFields | src/app/contact-requests/_component/types.ts |
| `src/app/contact-requests/_component/contact-row-actions.tsx` | tsx | yes | ContactRequestRowActionsProps, ContactRequestRowActions, contactRequestActionsColumnMeta, contactRequestActionsColumnId | src/app/contact-requests/_component/types.ts |
| `src/app/contact-requests/_component/index.ts` | ts | no |  | src/app/contact-requests/_component/types.ts, src/app/contact-requests/_component/utils.ts, src/app/contact-requests/_component/columns.tsx, src/app/contact-requests/_component/_query, src/app/contact |
| `src/app/contact-requests/_component/types.ts` | ts | no | CONTACT_REQUEST_STATUSES, CONTACT_REQUEST_STATUS_LABELS, CONTACT_REQUEST_PRIORITIES, ContactRequestPriority, CONTACT_REQUEST_PRIORITY_LABELS |  |
| `src/app/contact-requests/_component/utils.ts` | ts | no | formatPhoneNumber, buildFilterQuery |  |
| `src/app/contact-requests/page.tsx` | page | yes | ContactRequestsPage | src/lib/admin-navigation.ts, src/hooks/queries.ts, src/providers/auth-provider.tsx, src/lib/build-admin-filter-query.ts, src/hooks/use-debounced-value.ts, src/app/contact-requests/_component, src/app/ |
| `src/app/courses/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/courses/[id]/edit/page.tsx` | page | yes | EditCoursePage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/courses/_component, src/hooks/use-admin-mutation.ts |
| `src/app/courses/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/courses/[id]/page.tsx` | page | yes | CourseDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/courses/_component |
| `src/app/courses/_component/_alert-dialog/index.ts` | ts | no | CoursesConfirmDialog |  |
| `src/app/courses/_component/_form/courses-form-shell.tsx` | tsx | yes | CourseFormShellProps, CourseFormShell | src/app/courses/_component/types.ts |
| `src/app/courses/_component/_form/index.ts` | ts | no | CourseFormShell | src/app/courses/_component/_form/courses-form-shell.tsx |
| `src/app/courses/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildCoursePayload, useCourseForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/courses/_component/_hooks/use-courses-actions.ts |
| `src/app/courses/_component/_hooks/use-courses-actions.ts` | ts | no | buildCoursePayload, useCourseForm, useHandleConfirmAction, useConfirmAction | src/app/courses/_component/types.ts |
| `src/app/courses/_component/_query/index.ts` | ts | no | courseDetailQueryKey, prefetchCourseDetail, useCourseDetailQuery, useCoursesListQuery, useCoursesTrashQuery | src/app/courses/_component/_query/use-courses-queries.ts |
| `src/app/courses/_component/_query/use-courses-queries.ts` | ts | no | courseDetailQueryKey, prefetchCourseDetail, useCourseDetailQuery, useCoursesListQuery, UseTrashQueryProps, useCoursesTrashQuery | src/lib/fetch-all-admin-list.ts, src/lib/admin-detail-query.ts, src/app/courses/_component/types.ts |
| `src/app/courses/_component/_table/courses-table.tsx` | tsx | yes | CoursesTableProps, CoursesTable | src/app/courses/_component/types.ts |
| `src/app/courses/_component/_table/courses-trash-table.tsx` | tsx | yes | CoursesTrashTableProps, CoursesTrashTable | src/app/courses/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/courses/_component/_table/index.ts` | ts | no | CoursesTable, CoursesTrashTable | src/app/courses/_component/_table/courses-table.tsx, src/app/courses/_component/_table/courses-trash-table.tsx |
| `src/app/courses/_component/columns.tsx` | tsx | yes | getCourseColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/courses/_component/types.ts |
| `src/app/courses/_component/index.ts` | ts | no | courseFormSchema, getCourseColumns, courseDetailQueryKey, prefetchCourseDetail, useCourseDetailQuery, useCoursesListQuery, useCoursesTrashQuery, useColumnFiltersChange, useClearListFilters, useClearTr | src/app/courses/_component/types.ts, src/app/courses/_component/columns.tsx, src/app/courses/_component/_query, src/app/courses/_component/_hooks, src/app/courses/_component/_form, src/app/courses/_co |
| `src/app/courses/_component/types.ts` | ts | no | CourseRow, CourseConfirmAction, courseFormSchema, CourseFormValues, CourseDetail |  |
| `src/app/courses/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/courses/new/page.tsx` | page | yes | NewCoursePage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/courses/_component, src/hooks/use-admin-mutation.ts |
| `src/app/courses/page.tsx` | page | yes | CoursesPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/courses/_component, src/hooks/use |
| `src/app/data/_component/_hooks/index.ts` | ts | no | useDatabaseSchema | src/app/data/_component/_hooks/use-database-schema.ts |
| `src/app/data/_component/_hooks/use-database-schema.ts` | ts | yes | useDatabaseSchema | src/lib/api.ts, src/app/data/_component/types.ts |
| `src/app/data/_component/columns.tsx` | tsx | yes | getEntitySchemaColumns, getEntityRelationColumns | src/app/data/_component/types.ts, src/app/data/_component/utils.ts |
| `src/app/data/_component/entity-schema-panel.tsx` | tsx | yes | EntitySchemaPanel | src/app/data/_component/columns.tsx, src/app/data/_component/_hooks, src/app/data/_component/utils.ts |
| `src/app/data/_component/excel-to-import-data.ts` | ts | no | parseExcelToImportData |  |
| `src/app/data/_component/import-chunked.ts` | ts | no | ImportConfig, ImportChunkJob, orderModelsForImport, buildChunkedImportJobs, buildInitialImportProgress, RunChunkedImportOptions | src/app/data/import-progress-panel.tsx, src/app/data/_component/import-error-message.ts, src/app/data/_component/import-timing.ts |
| `src/app/data/_component/import-error-message.ts` | ts | no | ImportRowError, isGenericImportSummaryMessage, formatImportErrorMessage, classifyImportErrorDetail, formatRowErrorLine, getModelRowErrorDetails, buildModelImportErrorSummary, ImportProgressReportInput | src/app/data/_component/import-timing.ts |
| `src/app/data/_component/import-timing.ts` | ts | no | ImportModelTimingStats, ImportJobTimingEntry, createEmptyModelTiming, formatImportDuration, formatImportThroughput, formatModelTimingSummary |  |
| `src/app/data/_component/index.ts` | ts | no | EntitySchemaPanel, getEntityRelationColumns, getEntitySchemaColumns, useDatabaseSchema, buildEntityRelationRows, buildEntitySchemaRows, DOMAIN_BADGE_CLASS, formatEntityRowCount | src/app/data/_component/entity-schema-panel.tsx, src/app/data/_component/columns.tsx, src/app/data/_component/_hooks, src/app/data/_component/types.ts, src/app/data/_component/utils.ts |
| `src/app/data/_component/types.ts` | ts | no | EntitySchemaRow, EntityRelationRow |  |
| `src/app/data/_component/utils.ts` | ts | no | buildEntitySchemaRows, formatEntityRowCount, buildEntityRelationRows, DOMAIN_BADGE_CLASS | src/app/data/_component/types.ts |
| `src/app/data/import-progress-panel.tsx` | tsx | yes | ImportModelStatus, ImportModelProgress, ImportProgressState, withSkippedRemaining, ImportProgressPanel | src/app/data/_component/import-error-message.ts, src/app/data/_component/import-timing.ts |
| `src/app/data/page.tsx` | page | yes | DataBackupPage | src/lib/auth-session.ts, src/providers/auth-provider.tsx, src/app/data/import-progress-panel.tsx, src/app/data/_component, src/app/data/_component/import-chunked.ts, src/app/data/_component/excel-to-i |
| `src/app/database-schema/page.tsx` | page | yes | DatabaseSchemaPage | src/lib/api.ts |
| `src/app/departments/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/departments/[id]/edit/page.tsx` | page | yes | EditDepartmentPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/departments/_component, src/hooks/use-admin-mutation.ts |
| `src/app/departments/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/departments/[id]/page.tsx` | page | yes | DepartmentDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/departments/_component |
| `src/app/departments/_component/_alert-dialog/index.ts` | ts | no | DepartmentsConfirmDialog |  |
| `src/app/departments/_component/_form/department-form-shell.tsx` | tsx | yes | DepartmentFormShellProps, DepartmentFormShell | src/app/departments/_component/types.ts |
| `src/app/departments/_component/_form/index.ts` | ts | no | DepartmentFormShell | src/app/departments/_component/_form/department-form-shell.tsx |
| `src/app/departments/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildDepartmentPayload, useDepartmentForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/departments/_component/_hooks/use-departments-actions.ts |
| `src/app/departments/_component/_hooks/use-departments-actions.ts` | ts | no | buildDepartmentPayload, useDepartmentForm, useHandleConfirmAction, useConfirmAction | src/app/departments/_component/types.ts |
| `src/app/departments/_component/_query/index.ts` | ts | no | useDepartmentDetailQuery, useDepartmentsListQuery, useDepartmentsTrashQuery, departmentDetailQueryKey, prefetchDepartmentDetail | src/app/departments/_component/_query/use-departments-queries.ts |
| `src/app/departments/_component/_query/use-departments-queries.ts` | ts | no | departmentDetailQueryKey, prefetchDepartmentDetail, useDepartmentDetailQuery, useDepartmentsListQuery, useDepartmentsTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/departments/_component/types.ts |
| `src/app/departments/_component/_table/departments-table.tsx` | tsx | yes | DepartmentsTableProps, DepartmentsTable | src/app/departments/_component/types.ts |
| `src/app/departments/_component/_table/departments-trash-table.tsx` | tsx | yes | DepartmentsTrashTableProps, DepartmentsTrashTable | src/app/departments/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/departments/_component/_table/index.ts` | ts | no | DepartmentsTable, DepartmentsTrashTable | src/app/departments/_component/_table/departments-table.tsx, src/app/departments/_component/_table/departments-trash-table.tsx |
| `src/app/departments/_component/columns.tsx` | tsx | yes | getDepartmentColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/departments/_component/types.ts |
| `src/app/departments/_component/index.ts` | ts | no | departmentFormSchema, getDepartmentColumns, useDepartmentDetailQuery, useDepartmentsListQuery, useDepartmentsTrashQuery, departmentDetailQueryKey, prefetchDepartmentDetail, useColumnFiltersChange, use | src/app/departments/_component/types.ts, src/app/departments/_component/columns.tsx, src/app/departments/_component/_query, src/app/departments/_component/_hooks, src/app/departments/_component/_form, |
| `src/app/departments/_component/types.ts` | ts | no | DepartmentRow, DepartmentConfirmAction, departmentFormSchema, DepartmentFormValues, DepartmentDetail |  |
| `src/app/departments/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/departments/new/page.tsx` | page | yes | NewDepartmentPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/departments/_component, src/hooks/use-admin-mutation.ts |
| `src/app/departments/page.tsx` | page | yes | DepartmentsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/departments/_component, src/hooks |
| `src/app/error.tsx` | error | yes | AdminError |  |
| `src/app/events/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/events/[id]/edit/page.tsx` | page | yes | EditEventPage | src/lib/fetch-all-admin-list.ts, src/lib/admin-navigation.ts, src/lib/api.ts, src/app/events/_component, src/app/events/_component/utils.ts, src/hooks/use-admin-mutation.ts |
| `src/app/events/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/events/[id]/page.tsx` | page | yes | EventDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/events/_component, src/app/events/_component/event-registrations-live-table.tsx, src/app/events/_component/_live/e |
| `src/app/events/_component/_alert-dialog/index.ts` | ts | no | EventsConfirmDialog |  |
| `src/app/events/_component/_form/event-form-shell.tsx` | tsx | yes | EventFormShellProps, EventFormShell | src/app/cameras/_component, src/app/events/_component/types.ts, src/app/events/_component/_form/event-poster-field.tsx, src/lib/api.ts |
| `src/app/events/_component/_form/event-poster-field.tsx` | tsx | yes | EventPosterField | src/app/events/_component/utils.ts |
| `src/app/events/_component/_form/index.ts` | ts | no | EventFormShell | src/app/events/_component/_form/event-form-shell.tsx |
| `src/app/events/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildEventPayload, useEventForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/events/_component/_hooks/use-events-actions.ts |
| `src/app/events/_component/_hooks/use-events-actions.ts` | ts | no | buildEventPayload, useEventForm, useHandleConfirmAction, useConfirmAction | src/app/events/_component/types.ts, src/app/events/_component/utils.ts |
| `src/app/events/_component/_live/event-attendance-provider.tsx` | tsx | yes | EventAttendanceProvider, useEventAttendanceContext | src/lib/api.ts, src/app/events/_component/_query, src/app/events/_component/_live/event-attendance-sync.ts, src/app/events/_component/_live/use-event-attendance-socket.ts |
| `src/app/events/_component/_live/event-attendance-sync.ts` | ts | no | asAttendanceBool, mergeRegistrationRowsForDisplay, buildManualAttendancePayload, buildPayloadFromRegistrationRow, syncEventAttendanceUi, applyOptimisticRegistrationAttendance | src/app/events/_component/types.ts, src/app/events/_component/_live/patch-registration-attendance-cache.ts, src/app/events/_component/_live/use-event-attendance-socket.ts |
| `src/app/events/_component/_live/event-hanet-config-card.tsx` | tsx | yes | EventHanetCameraInfo, EventHanetConfigCard | src/lib/hanet-webhook-url.ts |
| `src/app/events/_component/_live/event-live-monitor-tab.tsx` | tsx | yes | EventLiveMonitorTab | src/lib/api.ts, src/app/events/_component/types.ts, src/app/events/_component/_query, src/app/events/_component/_live/event-attendance-sync.ts, src/app/events/_component/_live/event-attendance-provide |
| `src/app/events/_component/_live/patch-registration-attendance-cache.ts` | ts | no | patchRegistrationAttendanceCache | src/app/events/_component/_live/event-attendance-sync.ts, src/app/events/_component/_live/use-event-attendance-socket.ts |
| `src/app/events/_component/_live/use-event-attendance-socket.ts` | ts | yes | EVENT_ATTENDANCE_SOCKET_PATH, EventAttendanceSocketPayload, useEventAttendanceSocket, eventRegistrationsPollInterval | src/lib/auth-session.ts |
| `src/app/events/_component/_query/index.ts` | ts | no | useEventDetailQuery, useEventsListQuery, useEventsTrashQuery, eventDetailQueryKey, prefetchEventDetail, useEventRegistrationsQuery, useEventCheckinsQuery, useEventCheckoutsQuery, useEventSpeakersQuery | src/app/events/_component/_query/use-events-queries.ts, src/app/events/_component/_query/use-event-sub-queries.ts |
| `src/app/events/_component/_query/use-event-sub-queries.ts` | ts | no | useEventRegistrationsQuery, useEventCheckinsQuery, useEventCheckoutsQuery, useEventSpeakersQuery | src/lib/fetch-all-admin-list.ts, src/app/events/_component/_query/use-events-queries.ts |
| `src/app/events/_component/_query/use-events-queries.ts` | ts | no | EventLiveQueryOptions, eventDetailQueryKey, prefetchEventDetail, useEventDetailQuery, useEventsListQuery, UseTrashQueryProps, useEventsTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/events/_component/types.ts |
| `src/app/events/_component/_table/events-table.tsx` | tsx | yes | EventsTableProps, EventsTable | src/app/events/_component/types.ts |
| `src/app/events/_component/_table/events-trash-table.tsx` | tsx | yes | EventsTrashTableProps, EventsTrashTable | src/app/events/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/events/_component/_table/index.ts` | ts | no | EventsTable, EventsTrashTable | src/app/events/_component/_table/events-table.tsx, src/app/events/_component/_table/events-trash-table.tsx |
| `src/app/events/_component/attendance-status.tsx` | tsx | no | AttendanceRow, getAttendanceStatusLabel, AttendanceStatusBadge |  |
| `src/app/events/_component/columns.tsx` | tsx | yes | getEventColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/events/_component/types.ts |
| `src/app/events/_component/event-registrations-live-table.tsx` | tsx | yes | EventRegistrationsLiveTable | src/lib/api.ts, src/app/events/_component/_query, src/app/events/_component/_live/event-attendance-sync.ts, src/app/events/_component/_live/event-attendance-provider.tsx, src/app/events/_component/reg |
| `src/app/events/_component/index.ts` | ts | no | eventFormSchema, getEventColumns, useEventDetailQuery, useEventsListQuery, useEventsTrashQuery, useEventRegistrationsQuery, useEventCheckinsQuery, useEventCheckoutsQuery, useEventSpeakersQuery, eventD | src/app/events/_component/types.ts, src/app/events/_component/columns.tsx, src/app/events/_component/_query, src/app/events/_component/_live/event-live-monitor-tab.tsx, src/app/events/_component/_hook |
| `src/app/events/_component/live-activity-columns.tsx` | tsx | yes | EventLiveActivityKind, EventLiveActivityRow, checkinTypeLabel, buildLiveActivitiesFromRegistrations, getEventLiveActivityGlobalFilterText, getEventLiveActivityColumns | src/app/events/_component/_live/event-attendance-sync.ts, src/app/events/_component/registration-avatar-cell.tsx |
| `src/app/events/_component/registration-attendance-actions.tsx` | tsx | yes | RegistrationAttendanceActions | src/lib/api.ts, src/app/events/_component/_live/event-attendance-sync.ts, src/app/events/_component/_live/event-attendance-provider.tsx, src/app/events/_component/attendance-status.tsx, src/hooks/use- |
| `src/app/events/_component/registration-avatar-cell.tsx` | tsx | yes | resolveRegistrationAvatarUrl, resolveRowDisplayName, RegistrationAvatarCell | src/app/events/_component/utils.ts |
| `src/app/events/_component/registration-columns.tsx` | tsx | yes | EventRegistrationRow, getEventRegistrationGlobalFilterText, getEventRegistrationColumns | src/app/events/_component/attendance-status.tsx, src/app/events/_component/_live/event-attendance-sync.ts, src/app/events/_component/registration-attendance-actions.tsx, src/app/events/_component/regi |
| `src/app/events/_component/types.ts` | ts | no | EventRow, EventConfirmAction, eventFormSchema, EventFormValues, EventDetail, EventFormSpeaker |  |
| `src/app/events/_component/utils.ts` | ts | no | getPosterUrlFromValue, buildPosterPayload, uploadEventPoster | src/lib/admin-upload.ts |
| `src/app/events/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/events/new/page.tsx` | page | yes | NewEventPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/events/_component, src/hooks/use-admin-mutation.ts |
| `src/app/events/page.tsx` | page | yes | EventsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/events/_component, src/hooks/use- |
| `src/app/file-storage/_component/_hooks/index.ts` | ts | no | useFileStorageList, useFileStorageActions | src/app/file-storage/_component/_hooks/use-file-storage-list.ts, src/app/file-storage/_component/_hooks/use-file-storage-actions.ts |
| `src/app/file-storage/_component/_hooks/use-file-storage-actions.ts` | ts | yes | useFileStorageActions | src/lib/admin-upload.ts, src/lib/admin-uploads.ts, src/app/file-storage/_component/types.ts |
| `src/app/file-storage/_component/_hooks/use-file-storage-list.ts` | ts | yes | useFileStorageList | src/lib/admin-uploads.ts, src/app/file-storage/_component/types.ts |
| `src/app/file-storage/_component/_table/file-storage-table.tsx` | tsx | yes | FileStorageTableProps, FileStorageTable | src/app/file-storage/_component/types.ts |
| `src/app/file-storage/_component/_table/index.ts` | ts | no | FileStorageTable | src/app/file-storage/_component/_table/file-storage-table.tsx |
| `src/app/file-storage/_component/columns.tsx` | tsx | yes | FileStorageColumnsProps, getFileStorageColumns | src/lib/format-admin-datetime.ts, src/app/file-storage/_component/file-row-actions.tsx, src/app/file-storage/_component/types.ts, src/app/file-storage/_component/utils.ts |
| `src/app/file-storage/_component/file-row-actions.tsx` | tsx | yes | FileStorageRowActionsProps, FileStorageRowActions | src/app/file-storage/_component/types.ts, src/app/file-storage/_component/utils.ts |
| `src/app/file-storage/_component/index.ts` | ts | no | getFileStorageColumns, FileStorageRowActions, FileStorageTable, useFileStorageActions, useFileStorageList, formatFileSize, getShortMimeType, isImageMime | src/app/file-storage/_component/columns.tsx, src/app/file-storage/_component/file-row-actions.tsx, src/app/file-storage/_component/_table, src/app/file-storage/_component/_hooks, src/app/file-storage/ |
| `src/app/file-storage/_component/types.ts` | ts | no | FileStorageRow, FileStorageTab | src/lib/admin-uploads.ts |
| `src/app/file-storage/_component/utils.ts` | ts | no | formatFileSize, isImageMime, getShortMimeType |  |
| `src/app/file-storage/page.tsx` | page | yes | FileStoragePage | src/providers/auth-provider.tsx, src/app/file-storage/_component, src/app/file-storage/_component/utils.ts |
| `src/app/graph/page.tsx` | page | yes | GraphPage |  |
| `src/app/guides/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/guides/[id]/edit/page.tsx` | page | yes | EditGuidePage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/guides/_component, src/hooks/use-admin-mutation.ts |
| `src/app/guides/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/guides/[id]/page.tsx` | page | yes | GuideDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/guides/_component |
| `src/app/guides/_component/_alert-dialog/guides-confirm-dialog.tsx` | tsx | yes | GuidesConfirmDialogProps, GuidesConfirmDialog | src/app/guides/_component/types.ts |
| `src/app/guides/_component/_alert-dialog/index.ts` | ts | no | GuidesConfirmDialog | src/app/guides/_component/_alert-dialog/guides-confirm-dialog.tsx |
| `src/app/guides/_component/_form/guide-form-shell.tsx` | tsx | yes | GuideFormShellProps, GuideFormShell | src/app/guides/_component/_form/step-editor.tsx, src/app/guides/_component/types.ts |
| `src/app/guides/_component/_form/image-upload-field.tsx` | tsx | yes | ImageUploadField | src/lib/admin-upload.ts |
| `src/app/guides/_component/_form/index.ts` | ts | no | GuideFormShell, StepEditor, ImageUploadField | src/app/guides/_component/_form/guide-form-shell.tsx, src/app/guides/_component/_form/step-editor.tsx, src/app/guides/_component/_form/image-upload-field.tsx |
| `src/app/guides/_component/_form/step-editor.tsx` | tsx | yes | StepEditor | src/app/guides/_component/_form/image-upload-field.tsx, src/app/guides/_component/types.ts |
| `src/app/guides/_component/_hooks/index.ts` | ts | no | useGuidesActions, useGuideForm, buildGuidePayload, guideFormSchema | src/app/guides/_component/_hooks/use-guides-actions.ts, src/app/guides/_component/_hooks/use-guide-form.ts |
| `src/app/guides/_component/_hooks/use-guide-form.ts` | ts | no | guideFormSchema, GuideFormValues, useGuideForm, buildGuidePayload | src/app/guides/_component/types.ts |
| `src/app/guides/_component/_hooks/use-guides-actions.ts` | ts | yes | useGuidesActions | src/app/guides/_component/types.ts, src/app/guides/_component/_query |
| `src/app/guides/_component/_query/index.ts` | ts | no | useGuidesQuery, useGuideDetailQuery, guideDetailQueryKey, prefetchGuideDetail, useCreateGuideMutation, useUpdateGuideMutation, useDeleteGuideMutation, useReorderGuidesMutation | src/app/guides/_component/_query/use-guides-queries.ts, src/app/guides/_component/_query/use-guides-mutations.ts |
| `src/app/guides/_component/_query/use-guides-mutations.ts` | ts | yes | useCreateGuideMutation, useUpdateGuideMutation, useDeleteGuideMutation, useReorderGuidesMutation | src/app/guides/_component/types.ts, src/app/guides/_component/utils.ts, src/hooks/use-admin-mutation.ts |
| `src/app/guides/_component/_query/use-guides-queries.ts` | ts | yes | UseGuidesQueryProps, useGuidesQuery, guideDetailQueryKey, prefetchGuideDetail, useGuideDetailQuery | src/lib/admin-detail-query.ts, src/app/guides/_component/types.ts, src/app/guides/_component/utils.ts |
| `src/app/guides/_component/_table/guides-table.tsx` | tsx | yes | GuidesTableProps, GuidesTable | src/app/guides/_component/types.ts, src/app/guides/_component/utils.ts |
| `src/app/guides/_component/_table/index.ts` | ts | no | GuidesTable | src/app/guides/_component/_table/guides-table.tsx |
| `src/app/guides/_component/columns.tsx` | tsx | yes | GuideColumnsProps, getGuidesColumns | src/lib/admin-row-action-handlers.ts, src/app/guides/_component/types.ts, src/app/guides/_component/utils.ts |
| `src/app/guides/_component/index.ts` | ts | no | PAGE_KEY, parseContent, sortGroupsByOrder, applyOrderToGroups, reorderSteps, useGuidesActions, useGuideForm, buildGuidePayload, guideFormSchema, useGuidesQuery, useGuideDetailQuery, useCreateGuideMuta | src/app/guides/_component/types.ts, src/app/guides/_component/utils.ts, src/app/guides/_component/_hooks, src/app/guides/_component/_query, src/app/guides/_component/_form, src/app/guides/_component/_ |
| `src/app/guides/_component/types.ts` | ts | no | GuideStep, GuideGroup, CreateGuideInput, UpdateGuideInput, ListResult, GuideFormData, UpdateGuideData, GuideConfirmAction |  |
| `src/app/guides/_component/utils.ts` | ts | no | PAGE_KEY, parseContent, sortGroupsByOrder, applyOrderToGroups, reorderSteps | src/app/guides/_component/types.ts |
| `src/app/guides/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/guides/new/page.tsx` | page | yes | NewGuidePage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/guides/_component, src/hooks/use-admin-mutation.ts |
| `src/app/guides/page.tsx` | page | yes | GuidesPage | src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/providers/auth-provider.tsx, src/lib/admin-navigation.ts, src/app/guides/_component, src/hooks/use-admin-mutation.ts |
| `src/app/layout.tsx` | layout | no | metadata, RootLayout | src/app/page.tsx, src/providers/query-provider.tsx, src/providers/auth-provider.tsx, src/providers/backend-admin-layout.tsx |
| `src/app/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/locations/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/locations/[id]/edit/page.tsx` | page | yes | EditLocationPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/locations/_component, src/hooks/use-admin-mutation.ts |
| `src/app/locations/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/locations/[id]/page.tsx` | page | yes | LocationDetailPage | src/lib/admin-navigation.ts, src/components/location-map.tsx, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/locations/_component |
| `src/app/locations/_component/_alert-dialog/index.ts` | ts | no | LocationsConfirmDialog |  |
| `src/app/locations/_component/_form/index.ts` | ts | no | LocationFormShell | src/app/locations/_component/_form/location-form-shell.tsx |
| `src/app/locations/_component/_form/location-form-shell.tsx` | tsx | yes | LocationFormShellProps, LocationFormShell | src/app/locations/_component/types.ts |
| `src/app/locations/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildLocationPayload, useLocationForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/locations/_component/_hooks/use-locations-actions.ts |
| `src/app/locations/_component/_hooks/use-locations-actions.ts` | ts | no | buildLocationPayload, useLocationForm, useHandleConfirmAction, useConfirmAction | src/app/locations/_component/types.ts |
| `src/app/locations/_component/_query/index.ts` | ts | no | useLocationDetailQuery, useLocationsListQuery, useLocationsTrashQuery, locationDetailQueryKey, prefetchLocationDetail | src/app/locations/_component/_query/use-locations-queries.ts |
| `src/app/locations/_component/_query/use-locations-queries.ts` | ts | no | locationDetailQueryKey, prefetchLocationDetail, useLocationDetailQuery, useLocationsListQuery, UseTrashQueryProps, useLocationsTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/locations/_component/types.ts |
| `src/app/locations/_component/_table/index.ts` | ts | no | LocationsTable, LocationsTrashTable | src/app/locations/_component/_table/locations-table.tsx, src/app/locations/_component/_table/locations-trash-table.tsx |
| `src/app/locations/_component/_table/locations-table.tsx` | tsx | yes | LocationsTableProps, LocationsTable | src/app/locations/_component/types.ts |
| `src/app/locations/_component/_table/locations-trash-table.tsx` | tsx | yes | LocationsTrashTableProps, LocationsTrashTable | src/app/locations/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/locations/_component/columns.tsx` | tsx | yes | getLocationColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/locations/_component/types.ts |
| `src/app/locations/_component/index.ts` | ts | no | locationFormSchema, getLocationColumns, useLocationDetailQuery, useLocationsListQuery, useLocationsTrashQuery, locationDetailQueryKey, prefetchLocationDetail, useColumnFiltersChange, useClearListFilte | src/app/locations/_component/types.ts, src/app/locations/_component/columns.tsx, src/app/locations/_component/_query, src/app/locations/_component/_hooks, src/app/locations/_component/_form, src/app/l |
| `src/app/locations/_component/types.ts` | ts | no | LocationRow, LocationConfirmAction, locationFormSchema, LocationFormValues, LocationDetail |  |
| `src/app/locations/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/locations/new/page.tsx` | page | yes | NewLocationPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/locations/_component, src/hooks/use-admin-mutation.ts |
| `src/app/locations/page.tsx` | page | yes | LocationsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/locations/_component, src/hooks/u |
| `src/app/login/page.tsx` | page | no | AdminLoginPage | src/features/auth/sign-in-form.tsx |
| `src/app/majors/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/majors/[id]/edit/page.tsx` | page | yes | EditMajorPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/majors/_component, src/hooks/use-admin-mutation.ts |
| `src/app/majors/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/majors/[id]/page.tsx` | page | yes | MajorDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/majors/_component |
| `src/app/majors/_component/_alert-dialog/index.ts` | ts | no | MajorsConfirmDialog |  |
| `src/app/majors/_component/_form/index.ts` | ts | no | MajorsFormShell | src/app/majors/_component/_form/majors-form-shell.tsx |
| `src/app/majors/_component/_form/majors-form-shell.tsx` | tsx | yes | MajorsFormShellProps, MajorsFormShell | src/app/majors/_component/types.ts |
| `src/app/majors/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildMajorPayload, useMajorForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/majors/_component/_hooks/use-majors-actions.ts |
| `src/app/majors/_component/_hooks/use-majors-actions.ts` | ts | no | buildMajorPayload, useMajorForm, useHandleConfirmAction, useConfirmAction | src/app/majors/_component/types.ts |
| `src/app/majors/_component/_query/index.ts` | ts | no | majorDetailQueryKey, prefetchMajorDetail, useMajorDetailQuery, useMajorsListQuery, UseTrashQueryProps, useMajorsTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/majors/_component/types.ts |
| `src/app/majors/_component/_table/index.ts` | ts | no | MajorsTable, MajorsTrashTable | src/app/majors/_component/_table/majors-table.tsx, src/app/majors/_component/_table/majors-trash-table.tsx |
| `src/app/majors/_component/_table/majors-table.tsx` | tsx | yes | MajorsTableProps, MajorsTable | src/app/majors/_component/types.ts |
| `src/app/majors/_component/_table/majors-trash-table.tsx` | tsx | yes | MajorsTrashTableProps, MajorsTrashTable | src/app/majors/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/majors/_component/columns.tsx` | tsx | yes | getMajorColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/majors/_component/types.ts |
| `src/app/majors/_component/index.ts` | ts | no | majorFormSchema, getMajorColumns, useMajorDetailQuery, useMajorsListQuery, useMajorsTrashQuery, majorDetailQueryKey, prefetchMajorDetail, useColumnFiltersChange, useClearListFilters, useClearTrashFilt | src/app/majors/_component/types.ts, src/app/majors/_component/columns.tsx, src/app/majors/_component/_query, src/app/majors/_component/_hooks, src/app/majors/_component/_form, src/app/majors/_componen |
| `src/app/majors/_component/types.ts` | ts | no | MajorRow, MajorConfirmAction, majorFormSchema, MajorFormValues, MajorDetail |  |
| `src/app/majors/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/majors/new/page.tsx` | page | yes | NewMajorPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/majors/_component, src/hooks/use-admin-mutation.ts |
| `src/app/majors/page.tsx` | page | yes | MajorsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/majors/_component, src/hooks/use- |
| `src/app/my-students/_component/_table/index.ts` | ts | no | MyStudentsTable, MyStudentsScoreTable, MyStudentsDataTable | src/app/my-students/_component/_table/my-students-table.tsx, src/app/my-students/_component/_table/my-students-score-table.tsx, src/app/my-students/_component/_table/my-students-data-table.tsx |
| `src/app/my-students/_component/_table/my-students-data-table.tsx` | tsx | no | MyStudentsDataTable | src/app/my-students/_component/_table/my-students-score-table.tsx |
| `src/app/my-students/_component/_table/my-students-score-table.tsx` | tsx | yes | MyStudentsScoreTable |  |
| `src/app/my-students/_component/_table/my-students-table.tsx` | tsx | yes | MyStudentsTableProps, MyStudentsTable | src/app/my-students/_component/types.ts, src/app/my-students/_component/columns.tsx |
| `src/app/my-students/_component/add-student-dialog.tsx` | tsx | yes | AddStudentDialog | src/hooks/use-admin-mutation.ts, src/lib/api.ts |
| `src/app/my-students/_component/columns.tsx` | tsx | yes | MyStudentsColumnsProps, getMyStudentsColumns, getMyStudentGlobalFilterText | src/app/my-students/_component/types.ts, src/lib/admin-table-columns.tsx, src/lib/format-admin-datetime.ts |
| `src/app/my-students/_component/detailed-scores-list.tsx` | tsx | yes | DetailedScoresList | src/app/my-students/_component/_table/my-students-score-table.tsx, src/types/student-scores.ts, src/app/my-students/_component/score-utils.ts |
| `src/app/my-students/_component/grade-dialog.tsx` | tsx | yes | GradeDialogTarget, StudentGradeDialog, DEMO_GRADE_STUDENT | src/lib/api.ts, src/app/my-students/_component/student-scores-section.tsx, src/types/student-scores.ts |
| `src/app/my-students/_component/index.ts` | ts | no | StudentScoresSection, DetailedScoresList, YearAveragesList, TermAveragesList, formatScore, formatGrade, AddStudentDialog, StudentGradeDialog, DEMO_GRADE_STUDENT, getMyStudentsColumns, getMyStudentGlob | src/app/my-students/_component/student-scores-section.tsx, src/app/my-students/_component/detailed-scores-list.tsx, src/app/my-students/_component/year-averages-list.tsx, src/app/my-students/_componen |
| `src/app/my-students/_component/score-utils.ts` | ts | no | formatScore, formatGrade |  |
| `src/app/my-students/_component/student-scores-section.tsx` | tsx | yes | StudentScoresSection | src/app/my-students/_component/year-averages-list.tsx, src/app/my-students/_component/term-averages-list.tsx, src/app/my-students/_component/detailed-scores-list.tsx, src/types/student-scores.ts |
| `src/app/my-students/_component/term-averages-list.tsx` | tsx | yes | TermAveragesList | src/app/my-students/_component/_table/my-students-score-table.tsx, src/types/student-scores.ts, src/app/my-students/_component/score-utils.ts |
| `src/app/my-students/_component/types.ts` | ts | no | MyStudentRow |  |
| `src/app/my-students/_component/use-my-students-socket.ts` | ts | yes | MY_STUDENTS_SOCKET_PATH, ParentStudentReviewSocketPayload, useMyStudentsSocket, myStudentsPollInterval | src/lib/auth-session.ts |
| `src/app/my-students/_component/year-averages-list.tsx` | tsx | yes | YearAveragesList | src/types/student-scores.ts, src/app/my-students/_component/score-utils.ts, src/app/my-students/_component/_table/my-students-score-table.tsx |
| `src/app/my-students/page.tsx` | page | yes | MyStudentsPage | src/providers/auth-provider.tsx, src/lib/api.ts, src/hooks/queries.ts, src/app/my-students/_component, src/app/my-students/_component/use-my-students-socket.ts, src/hooks/use-admin-mutation.ts |
| `src/app/page.tsx` | page | yes | AdminDashboardPage | src/providers/auth-provider.tsx, src/lib/api.ts, src/types/dashboard.ts, src/components/dashboard-charts.tsx |
| `src/app/parent-students/_component/_query/index.ts` | ts | no |  | src/app/parent-students/_component/_query/use-parent-students-queries.ts |
| `src/app/parent-students/_component/_query/use-parent-students-queries.ts` | ts | yes | useReviewParentStudentMutation | src/lib/api.ts, src/hooks/queries.ts, src/hooks/use-admin-mutation.ts |
| `src/app/parent-students/_component/_table/index.ts` | ts | no |  | src/app/parent-students/_component/_table/parent-student-table.tsx |
| `src/app/parent-students/_component/_table/parent-student-table.tsx` | tsx | yes | ParentStudentTableProps, ParentStudentTable | src/lib/api.ts, src/app/parent-students/_component/types.ts |
| `src/app/parent-students/_component/columns.tsx` | tsx | yes | ParentStudentsColumnsProps, getParentStudentsColumns | src/lib/admin-table-columns.tsx, src/lib/format-admin-datetime.ts, src/app/parent-students/_component/types.ts |
| `src/app/parent-students/_component/index.ts` | ts | no |  | src/app/parent-students/_component/types.ts, src/app/parent-students/_component/columns.tsx, src/app/parent-students/_component/_query, src/app/parent-students/_component/_table |
| `src/app/parent-students/_component/types.ts` | ts | no | ParentStudent, PARENT_STUDENT_STATUSES, PARENT_STUDENT_STATUS_LABELS, PARENT_STUDENT_STATUS_COLORS |  |
| `src/app/parent-students/page.tsx` | page | yes | AdminParentStudentsPage | src/providers/auth-provider.tsx, src/lib, src/lib/api.ts, src/hooks/use-debounced-value.ts, src/app/parent-students/_component/_table, src/app/parent-students/_component/_query, src/app/parent-student |
| `src/app/posts/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/posts/[id]/edit/page.tsx` | page | yes | EditPostPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/posts/_component, src/app/posts/_component/_query, src/hooks/use-admin-mutation.ts |
| `src/app/posts/[id]/loading.tsx` | loading | no | PostDetailLoading |  |
| `src/app/posts/[id]/page.tsx` | page | yes | PostDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/posts/_component, src/app/posts/_component/_query |
| `src/app/posts/_component/_alert-dialog/index.ts` | ts | no | PostsConfirmDialog |  |
| `src/app/posts/_component/_form/index.ts` | ts | no | PostFormShell, PostImageField | src/app/posts/_component/_form/post-form-shell.tsx, src/app/posts/_component/_form/post-image-field.tsx |
| `src/app/posts/_component/_form/post-form-shell.tsx` | tsx | yes | PostFormShellProps, PostFormShell | src/app/posts/_component/utils.ts, src/app/posts/_component/_form/post-image-field.tsx, src/app/posts/_component/_hooks, src/app/posts/_component/types.ts |
| `src/app/posts/_component/_form/post-image-field.tsx` | tsx | yes | PostImageField | src/app/posts/_component/utils.ts |
| `src/app/posts/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, useHandleConfirmActionWithAction, usePostForm, postFormSchema | src/hooks/use-table-filters.ts, src/app/posts/_component/_hooks/use-posts-actions.ts, src/app/posts/_component/_hooks/use-post-form.ts |
| `src/app/posts/_component/_hooks/use-post-form.ts` | ts | yes | postFormSchema, PostFormValues, usePostForm | src/app/posts/_component/utils.ts |
| `src/app/posts/_component/_hooks/use-posts-actions.ts` | ts | no | UsePostsActionsProps, useHandleConfirmActionWithAction | src/app/posts/_component/types.ts |
| `src/app/posts/_component/_hooks/use-posts-filters.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters |  |
| `src/app/posts/_component/_query/index.ts` | ts | no | usePostsQuery, useTrashQuery, usePostDetailQuery, postDetailQueryKey, prefetchPostDetail, useCategoriesQuery, useTagsQuery, useDeleteMutation, useRestoreMutation, usePurgeMutation, useBulkMutation | src/app/posts/_component/_query/use-posts-queries.ts, src/app/posts/_component/_query/use-taxonomy-queries.ts, src/app/posts/_component/_query/use-posts-mutations.ts |
| `src/app/posts/_component/_query/use-posts-mutations.ts` | ts | no | UsePostsMutationsProps, useDeleteMutation, useRestoreMutation, usePurgeMutation, useBulkMutation | src/app/posts/_component/types.ts, src/hooks/use-admin-mutation.ts |
| `src/app/posts/_component/_query/use-posts-queries.ts` | ts | no | postDetailQueryKey, prefetchPostDetail, usePostDetailQuery, UsePostsQueriesProps, usePostsQuery, UseTrashQueryProps, useTrashQuery, UsePostsByAuthorProps, usePostsByAuthor | src/lib/admin-detail-query.ts, src/app/posts/_component/types.ts |
| `src/app/posts/_component/_query/use-taxonomy-queries.ts` | ts | no | useCategoriesQuery, useTagsQuery | src/app/posts/_component/types.ts |
| `src/app/posts/_component/_table/index.ts` | ts | no | PostsTable, PostsTrashTable | src/app/posts/_component/_table/posts-table.tsx, src/app/posts/_component/_table/posts-trash-table.tsx |
| `src/app/posts/_component/_table/posts-table.tsx` | tsx | yes | PostsTableProps, PostsTable | src/app/posts/_component/types.ts, src/lib/api.ts |
| `src/app/posts/_component/_table/posts-trash-table.tsx` | tsx | yes | PostsTrashTableProps, PostsTrashTable | src/app/posts/_component/types.ts, src/lib/api.ts |
| `src/app/posts/_component/columns.tsx` | tsx | yes | getPostColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/posts/_component/types.ts, src/app/posts/_component/summary-badges.tsx |
| `src/app/posts/_component/index.ts` | ts | no | createParagraphNode, createSerializedEditorState, slugify, getSeoStatus, buildCategoryOptionTree, unwrapEnvelope, normalizePaged, buildPostsFilterQuery, isSerializedEditorState, fromLocalInputValue, t | src/app/posts/_component/types.ts, src/app/posts/_component/utils.ts, src/app/posts/_component/summary-badges.tsx, src/app/posts/_component/columns.tsx, src/app/posts/_component/_hooks, src/app/posts/ |
| `src/app/posts/_component/summary-badges.tsx` | tsx | no | SummaryBadges | src/app/posts/_component/types.ts |
| `src/app/posts/_component/types.ts` | ts | no | TaxonomyOption, CategoryTreeOption, PostListRow, PostConfirmAction, PostDetail, FormState, EditorTextNodeShape, EditorParagraphNodeShape, EditorStateShape |  |
| `src/app/posts/_component/utils.ts` | ts | no | uploadPostImage, createParagraphNode, createSerializedEditorState, getSeoStatus, buildPostsFilterQuery, isSerializedEditorState, fromLocalInputValue, toLocalInputValue, normalizeContentForEditor, slug | src/lib, src/lib/admin-upload.ts, src/app/posts/_component/types.ts |
| `src/app/posts/loading.tsx` | loading | no | PostsLoading |  |
| `src/app/posts/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/posts/new/page.tsx` | page | yes | NewPostPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/posts/_component, src/app/posts/_component/_query, src/hooks/use-admin-mutation.ts |
| `src/app/posts/page.tsx` | page | yes | PostsPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/posts/_component/_table, src/app/posts/_component/_hooks, src/lib/admin-row-action-handlers.ts, src/app/posts/_com |
| `src/app/profile/_components/profile-detail-section.tsx` | tsx | yes | ProfileDetailSection | src/lib/api.ts, src/app/profile/_components/profile-utils.ts |
| `src/app/profile/_components/profile-edit-section.tsx` | tsx | yes | ProfileEditFormState, ProfileEditSection | src/app/profile/_components/profile-utils.ts |
| `src/app/profile/_components/profile-sidebar.tsx` | tsx | yes | ProfileSidebar | src/lib/api.ts, src/app/profile/_components/profile-utils.ts |
| `src/app/profile/_components/profile-utils.ts` | ts | no | formatProfileDateTime, profileInitials, telHref, PROFILE_FIELD_CLASS, PROFILE_TEXTAREA_CLASS, PROFILE_ACTION_BAR_CLASS |  |
| `src/app/profile/page.tsx` | page | yes | AdminProfilePage | src/providers/auth-provider.tsx, src/hooks/queries.ts, src/lib/auth-session.ts, src/lib/admin-upload.ts |
| `src/app/rbac/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/rbac/[id]/edit/page.tsx` | page | yes | EditRolePage | src/lib/admin-navigation.ts, src/app/rbac/_component/_hooks, src/app/rbac/_component/_form, src/app/rbac/_component/_query, src/providers/auth-provider.tsx, src/config/protected-admin.ts |
| `src/app/rbac/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/rbac/[id]/page.tsx` | page | yes | RoleDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/config/protected-admin.ts, src/app/rbac/_component/_query/use-rbac-queries.ts, src/lib/permission-labels.ts |
| `src/app/rbac/_component/_alert-dialog/role-dialog.tsx` | tsx | yes | RoleDialogProps, RoleDialog | src/app/rbac/_component/types.ts |
| `src/app/rbac/_component/_form/index.ts` | ts | no | RoleFormShell | src/app/rbac/_component/_form/role-form-shell.tsx |
| `src/app/rbac/_component/_form/role-form-shell.tsx` | tsx | yes | RoleFormShellProps, RoleFormShell | src/app/rbac/_component/_hooks/use-role-form.ts, src/lib/permission-labels.ts |
| `src/app/rbac/_component/_hooks/index.ts` | ts | no | useRoleForm | src/app/rbac/_component/_hooks/use-role-form.ts |
| `src/app/rbac/_component/_hooks/use-role-form.ts` | ts | yes | roleFormSchema, RoleFormValues, useRoleForm |  |
| `src/app/rbac/_component/_query/index.ts` | ts | no |  | src/app/rbac/_component/_query/use-rbac-queries.ts |
| `src/app/rbac/_component/_query/use-rbac-queries.ts` | ts | yes | RoleRow, rbacQueryKeys, useRbacCatalog, useRoleDetail, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation | src/lib/api.ts, src/app/rbac/_component/types.ts, src/hooks/use-admin-mutation.ts |
| `src/app/rbac/_component/columns.tsx` | tsx | yes | RbacColumnsProps, getRbacColumns | src/lib/permission-labels.ts, src/lib/admin-table-columns.tsx, src/app/rbac/_component/utils.ts |
| `src/app/rbac/_component/index.ts` | ts | no |  | src/app/rbac/_component/types.ts, src/app/rbac/_component/columns.tsx, src/app/rbac/_component/_alert-dialog/role-dialog.tsx, src/app/rbac/_component/_hooks, src/app/rbac/_component/_form |
| `src/app/rbac/_component/types.ts` | ts | no | CreateRoleInput, UpdateRoleInput |  |
| `src/app/rbac/_component/utils.ts` | ts | no | RoleRow, normalizePermissionCodes, mapRoleRow, buildRolesFilterQuery, formatRoleDateTime | src/lib, src/lib/format-admin-datetime.ts |
| `src/app/register/page.tsx` | page | no | RegisterPage | src/features/auth/register-form.tsx |
| `src/app/robots.ts` | ts | no | robots |  |
| `src/app/screens/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/screens/[id]/edit/page.tsx` | page | yes | EditScreenPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/screens/_component, src/hooks/use-admin-mutation.ts |
| `src/app/screens/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/screens/[id]/page.tsx` | page | yes | ScreenDetailPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/screens/_component, src/providers/auth-provider.tsx |
| `src/app/screens/_component/_alert-dialog/index.ts` | ts | no | ScreensConfirmDialog |  |
| `src/app/screens/_component/_form/index.ts` | ts | no | ScreenFormShell | src/app/screens/_component/_form/screen-form-shell.tsx |
| `src/app/screens/_component/_form/screen-form-shell.tsx` | tsx | yes | ScreenFormShellProps, ScreenFormShell | src/app/screens/_component/types.ts |
| `src/app/screens/_component/_hooks/index.ts` | ts | no | buildScreenPayload, useScreenForm, useHandleConfirmAction, useConfirmAction | src/app/screens/_component/_hooks/use-screens-actions.ts |
| `src/app/screens/_component/_hooks/use-screens-actions.ts` | ts | no | buildScreenPayload, useScreenForm, useHandleConfirmAction, useConfirmAction | src/app/screens/_component/types.ts |
| `src/app/screens/_component/_query/index.ts` | ts | no | useScreenDetailQuery, useScreensListQuery, useScreensTrashQuery, screenDetailQueryKey, prefetchScreenDetail | src/app/screens/_component/_query/use-screens-queries.ts |
| `src/app/screens/_component/_query/use-screens-queries.ts` | ts | no | screenDetailQueryKey, prefetchScreenDetail, useScreenDetailQuery, useScreensListQuery, useScreensTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/screens/_component/types.ts |
| `src/app/screens/_component/_table/index.ts` | ts | no | ScreensTable, ScreensTrashTable | src/app/screens/_component/_table/screens-table.tsx, src/app/screens/_component/_table/screens-trash-table.tsx |
| `src/app/screens/_component/_table/screens-table.tsx` | tsx | yes | ScreensTable | src/app/screens/_component/types.ts |
| `src/app/screens/_component/_table/screens-trash-table.tsx` | tsx | yes | ScreensTrashTable | src/app/screens/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/screens/_component/columns.tsx` | tsx | yes | getScreenColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/screens/_component/types.ts |
| `src/app/screens/_component/index.ts` | ts | no | screenFormSchema, getScreenColumns, useScreenDetailQuery, useScreensListQuery, useScreensTrashQuery, screenDetailQueryKey, prefetchScreenDetail, useColumnFiltersChange, useClearListFilters, useClearTr | src/app/screens/_component/types.ts, src/app/screens/_component/columns.tsx, src/app/screens/_component/_query, src/hooks/use-table-filters.ts, src/app/screens/_component/_hooks, src/app/screens/_comp |
| `src/app/screens/_component/types.ts` | ts | no | ScreenRow, ScreenConfirmAction, screenFormSchema, ScreenFormValues, ScreenDetail |  |
| `src/app/screens/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/screens/new/page.tsx` | page | yes | NewScreenPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/screens/_component, src/hooks/use-admin-mutation.ts |
| `src/app/screens/page.tsx` | page | yes | ScreensPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/screens/_component, src/hooks/use |
| `src/app/seo-metas/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/seo-metas/[id]/edit/page.tsx` | page | yes | EditSeoMetaPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/seo-metas/_component, src/hooks/use-admin-mutation.ts |
| `src/app/seo-metas/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/seo-metas/[id]/page.tsx` | page | yes | SeoMetaDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/seo-metas/_component |
| `src/app/seo-metas/_component/_alert-dialog/index.ts` | ts | no | SeoMetasConfirmDialog | src/app/seo-metas/_component/_alert-dialog/seo-metas-confirm-dialog.tsx |
| `src/app/seo-metas/_component/_alert-dialog/seo-metas-confirm-dialog.tsx` | tsx | no | SeoMetasConfirmDialog |  |
| `src/app/seo-metas/_component/_query/index.ts` | ts | no | seoMetaDetailQueryKey, prefetchSeoMetaDetail, useSeoMetaDetailQuery, useSeoMetasListQuery, UseTrashQueryProps, useSeoMetasTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/seo-metas/_component/types.ts |
| `src/app/seo-metas/_component/_table/seo-metas-table.tsx` | tsx | yes | SeoMetasTableProps, SeoMetasTable | src/app/seo-metas/_component/types.ts |
| `src/app/seo-metas/_component/columns.tsx` | tsx | yes | getSeoMetaColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/seo-metas/_component/types.ts |
| `src/app/seo-metas/_component/index.ts` | ts | no | seoMetaFormSchema, getSeoMetaColumns, useSeoMetaDetailQuery, useSeoMetasListQuery, useSeoMetasTrashQuery, seoMetaDetailQueryKey, prefetchSeoMetaDetail, SeoMetasTable, SeoMetasConfirmDialog | src/app/seo-metas/_component/types.ts, src/app/seo-metas/_component/columns.tsx, src/app/seo-metas/_component/_query, src/app/seo-metas/_component/_table/seo-metas-table.tsx, src/app/seo-metas/_compon |
| `src/app/seo-metas/_component/types.ts` | ts | no | SeoMetaRow, SeoMetaConfirmAction, seoMetaFormSchema, SeoMetaFormValues, SeoMetaDetail |  |
| `src/app/seo-metas/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/seo-metas/new/page.tsx` | page | yes | NewSeoMetaPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/seo-metas/_component, src/hooks/use-admin-mutation.ts |
| `src/app/seo-metas/page.tsx` | page | yes | SeoMetasPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/seo-metas/_component, src/hooks/u |
| `src/app/settings/_component/constants.ts` | ts | no | SITE_SEO_PAGE_KEY, SettingsTabId, SETTINGS_TAB_LABELS |  |
| `src/app/settings/_component/index.ts` | ts | no | SITE_SEO_PAGE_KEY, SETTINGS_TAB_LABELS, extractSettingValue, SettingsSeoPagesSection, SETTINGS_DISPLAY_PRESETS, SETTINGS_SEO_GLOBAL_PRESETS, getSettingsDisplayPreset, getSettingsSeoGlobalPreset, Setti | src/app/settings/_component/constants.ts, src/app/settings/_component/utils.ts, src/app/settings/_component/settings-seo-pages-section.tsx, src/app/settings/_component/settings-presets.ts, src/app/set |
| `src/app/settings/_component/settings-presets.ts` | ts | no | DEFAULT_STOREFRONT_OG_IMAGE, SettingsDisplayPreset, SettingsSeoGlobalPreset, SETTINGS_DISPLAY_PRESETS, SETTINGS_SEO_GLOBAL_PRESETS, getSettingsDisplayPreset, getSettingsSeoGlobalPreset |  |
| `src/app/settings/_component/settings-quick-presets.tsx` | tsx | yes | SettingsQuickPresetItem, SettingsQuickPresets |  |
| `src/app/settings/_component/settings-seo-pages-presets.ts` | ts | no | SettingsSeoPagePreset, SettingsSeoPagesPresetGroup, SETTINGS_SEO_PAGES_PRESET_GROUPS, getSettingsSeoPagesPresetGroup, resolveSettingsSeoPagesSelection, listAllPresetPagePaths | src/app/settings/_component/settings-presets.ts |
| `src/app/settings/_component/settings-seo-pages-quick-presets.tsx` | tsx | yes | SettingsSeoPagesQuickPresets | src/lib/api.ts, src/hooks/use-admin-mutation.ts, src/app/settings/_component/settings-seo-pages-presets.ts |
| `src/app/settings/_component/settings-seo-pages-section.tsx` | tsx | yes | SettingsSeoPagesSection | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/seo-metas/_component, src/hooks/use-admin-mutation.ts, src/app/set |
| `src/app/settings/_component/utils.ts` | ts | no | extractSettingValue |  |
| `src/app/settings/page.tsx` | page | yes | SettingsPage | src/lib/api.ts, src/providers/auth-provider.tsx, src/hooks/use-admin-mutation.ts, src/app/settings/_component |
| `src/app/speakers/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/speakers/[id]/edit/page.tsx` | page | yes | EditSpeakerPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/speakers/_component, src/hooks/use-admin-mutation.ts |
| `src/app/speakers/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/speakers/[id]/page.tsx` | page | yes | SpeakerDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/speakers/_component |
| `src/app/speakers/_component/_alert-dialog/index.ts` | ts | no | SpeakersConfirmDialog | src/app/speakers/_component/_alert-dialog/speakers-confirm-dialog.tsx |
| `src/app/speakers/_component/_alert-dialog/speakers-confirm-dialog.tsx` | tsx | no | SpeakersConfirmDialog |  |
| `src/app/speakers/_component/_form/index.ts` | ts | no | SpeakerFormShell | src/app/speakers/_component/_form/speaker-form-shell.tsx |
| `src/app/speakers/_component/_form/speaker-form-shell.tsx` | tsx | yes | SpeakerFormShellProps, SpeakerFormShell | src/app/speakers/_component/types.ts, src/lib/admin-upload.ts |
| `src/app/speakers/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildSpeakerPayload, useSpeakerForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/speakers/_component/_hooks/use-speakers-actions.ts |
| `src/app/speakers/_component/_hooks/use-speakers-actions.ts` | ts | no | buildSpeakerPayload, useSpeakerForm, useHandleConfirmAction, useConfirmAction | src/app/speakers/_component/types.ts |
| `src/app/speakers/_component/_query/index.ts` | ts | no | useSpeakerDetailQuery, useSpeakersListQuery, useSpeakersTrashQuery, speakerDetailQueryKey, prefetchSpeakerDetail | src/app/speakers/_component/_query/use-speakers-queries.ts |
| `src/app/speakers/_component/_query/use-speakers-queries.ts` | ts | no | speakerDetailQueryKey, prefetchSpeakerDetail, useSpeakerDetailQuery, useSpeakersListQuery, UseTrashQueryProps, useSpeakersTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/speakers/_component/types.ts |
| `src/app/speakers/_component/_table/index.ts` | ts | no | SpeakersTable, SpeakersTrashTable | src/app/speakers/_component/_table/speakers-table.tsx, src/app/speakers/_component/_table/speakers-trash-table.tsx |
| `src/app/speakers/_component/_table/speakers-table.tsx` | tsx | yes | SpeakersTableProps, SpeakersTable | src/app/speakers/_component/types.ts |
| `src/app/speakers/_component/_table/speakers-trash-table.tsx` | tsx | yes | SpeakersTrashTableProps, SpeakersTrashTable | src/app/speakers/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/speakers/_component/columns.tsx` | tsx | yes | getSpeakerColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/speakers/_component/types.ts |
| `src/app/speakers/_component/index.ts` | ts | no | speakerFormSchema, getSpeakerColumns, useSpeakerDetailQuery, useSpeakersListQuery, useSpeakersTrashQuery, speakerDetailQueryKey, prefetchSpeakerDetail, useColumnFiltersChange, useClearListFilters, use | src/app/speakers/_component/types.ts, src/app/speakers/_component/columns.tsx, src/app/speakers/_component/_query, src/app/speakers/_component/_hooks, src/app/speakers/_component/_form, src/app/speake |
| `src/app/speakers/_component/types.ts` | ts | no | SpeakerRow, SpeakerConfirmAction, speakerFormSchema, SpeakerFormValues, SpeakerDetail |  |
| `src/app/speakers/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/speakers/new/page.tsx` | page | yes | NewSpeakerPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/speakers/_component, src/hooks/use-admin-mutation.ts |
| `src/app/speakers/page.tsx` | page | yes | SpeakersPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/speakers/_component, src/hooks/us |
| `src/app/staff/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/staff/[id]/edit/page.tsx` | page | yes | EditStaffPage | src/lib/admin-navigation.ts, src/app/staff/_component, src/app/staff/_component/_form, src/hooks/queries.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/config/protected-admin.ts |
| `src/app/staff/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/staff/[id]/page.tsx` | page | yes | StaffDetailPage | src/lib/admin-navigation.ts, src/hooks/queries.ts, src/providers/auth-provider.tsx, src/config/protected-admin.ts, src/app/posts/_component/_query/use-posts-queries.ts, src/lib/api.ts, src/app/posts/_ |
| `src/app/staff/_component/_alert-dialog/index.ts` | ts | no | StaffConfirmDialog, StaffBulkConfirmDialog | src/app/staff/_component/_alert-dialog/staff-confirm-dialog.tsx |
| `src/app/staff/_component/_alert-dialog/staff-confirm-dialog.tsx` | tsx | no | StaffConfirmDialog, StaffBulkConfirmDialog | src/app/staff/_component/types.ts |
| `src/app/staff/_component/_form/index.ts` | ts | no | StaffFormShell | src/app/staff/_component/_form/staff-form-shell.tsx |
| `src/app/staff/_component/_form/staff-form-shell.tsx` | tsx | yes | StaffFormShellProps, StaffFormShell | src/app/staff/_component/_hooks/use-staff-form.ts, src/lib/admin-upload.ts |
| `src/app/staff/_component/_hooks/index.ts` | ts | no | useStaffForm, staffFormSchema | src/app/staff/_component/_hooks/use-staff-form.ts |
| `src/app/staff/_component/_hooks/use-staff-form.ts` | ts | no | staffFormSchema, StaffFormValues, useStaffForm |  |
| `src/app/staff/_component/_query/index.ts` | ts | no | useStaffMutations | src/app/staff/_component/_query/use-staff-queries.ts |
| `src/app/staff/_component/_query/use-staff-queries.ts` | ts | no | UseStaffMutationsProps, useStaffMutations | src/lib/api.ts, src/hooks/queries.ts, src/lib/auth-session.ts, src/hooks/use-admin-mutation.ts |
| `src/app/staff/_component/_table/index.ts` | ts | no | StaffTable, StaffTrashTable | src/app/staff/_component/_table/staff-table.tsx, src/app/staff/_component/_table/staff-trash-table.tsx |
| `src/app/staff/_component/_table/staff-table.tsx` | tsx | no | StaffTable | src/app/staff/_component/columns.tsx, src/app/staff/_component/types.ts, src/lib/api.ts |
| `src/app/staff/_component/_table/staff-trash-table.tsx` | tsx | no | StaffTrashTable | src/app/staff/_component/columns.tsx, src/app/staff/_component/types.ts, src/lib/api.ts |
| `src/app/staff/_component/columns.tsx` | tsx | no | StaffColumnsProps, getStaffColumns | src/config/protected-admin.ts, src/app/staff/_component/types.ts, src/lib/admin-table-columns.tsx |
| `src/app/staff/_component/index.ts` | ts | no | buildUsersFilterQuery, getStaffColumns, useStaffForm, staffFormSchema, useStaffMutations, StaffTable, StaffTrashTable, StaffFormShell, StaffConfirmDialog, StaffBulkConfirmDialog | src/app/staff/_component/types.ts, src/app/staff/_component/utils.ts, src/app/staff/_component/columns.tsx, src/app/staff/_component/_hooks, src/app/staff/_component/_query, src/app/staff/_component/_ |
| `src/app/staff/_component/staff-personnel-info-section.tsx` | tsx | yes | StaffPersonnelInfoSection | src/lib/api.ts |
| `src/app/staff/_component/types.ts` | ts | no | StaffRow, StaffBulkActionKind, StaffConfirmAction |  |
| `src/app/staff/_component/utils.ts` | ts | no | buildUsersFilterQuery | src/lib |
| `src/app/staff/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/staff/new/page.tsx` | page | yes | NewStaffPage | src/lib/admin-navigation.ts, src/app/staff/_component, src/app/staff/_component/_form, src/hooks/queries.ts, src/providers/auth-provider.tsx, src/lib/api.ts |
| `src/app/staff/page.tsx` | page | yes | StaffPage | src/lib/admin-navigation.ts, src/hooks/queries.ts, src/hooks/use-debounced-value.ts, src/lib/api.ts, src/providers/auth-provider.tsx, src/config/protected-admin.ts, src/app/staff/_component, src/hooks |
| `src/app/tags/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/tags/[id]/edit/page.tsx` | page | yes | EditTagPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/tags/_component, src/hooks/use-admin-mutation.ts |
| `src/app/tags/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/tags/[id]/page.tsx` | page | yes | TagDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/tags/_component |
| `src/app/tags/_component/_alert-dialog/index.ts` | ts | no | TagsConfirmDialog | src/app/tags/_component/_alert-dialog/tags-confirm-dialog.tsx |
| `src/app/tags/_component/_alert-dialog/tags-confirm-dialog.tsx` | tsx | no | TagsConfirmDialog |  |
| `src/app/tags/_component/_form/index.ts` | ts | no | TagFormShell | src/app/tags/_component/_form/tag-form-shell.tsx |
| `src/app/tags/_component/_form/tag-form-shell.tsx` | tsx | yes | TagFormShellProps, TagFormShell | src/app/tags/_component/types.ts |
| `src/app/tags/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildTagPayload, useTagForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/tags/_component/_hooks/use-tags-actions.ts |
| `src/app/tags/_component/_hooks/use-tags-actions.ts` | ts | no | buildTagPayload, useTagForm, useHandleConfirmAction, useConfirmAction | src/app/tags/_component/types.ts |
| `src/app/tags/_component/_query/index.ts` | ts | no | tagDetailQueryKey, prefetchTagDetail, useTagDetailQuery, useTagsListQuery, UseTrashQueryProps, useTrashQuery | src/lib/admin-detail-query.ts, src/app/tags/_component/types.ts, src/lib/api.ts, src/app/tags/_component/utils.ts |
| `src/app/tags/_component/_table/index.ts` | ts | no | TagsTable, TagsTrashTable | src/app/tags/_component/_table/tags-table.tsx, src/app/tags/_component/_table/tags-trash-table.tsx |
| `src/app/tags/_component/_table/tags-table.tsx` | tsx | yes | TagsTableProps, TagsTable | src/app/tags/_component/types.ts |
| `src/app/tags/_component/_table/tags-trash-table.tsx` | tsx | yes | TagsTrashTableProps, TagsTrashTable | src/app/tags/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/tags/_component/columns.tsx` | tsx | yes | getTagColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/tags/_component/types.ts, src/app/tags/_component/utils.ts |
| `src/app/tags/_component/index.ts` | ts | no | tagFormSchema, slugify, unwrapEnvelope, normalizePaged, formatDateTime, humanizeSlug, sortTagsByName, buildTagTree, buildTagsFilterQuery, toFilterQuery, getTagColumns, useTagDetailQuery, useTagsListQu | src/app/tags/_component/types.ts, src/app/tags/_component/utils.ts, src/app/tags/_component/columns.tsx, src/app/tags/_component/_query, src/app/tags/_component/_hooks, src/app/tags/_component/_form,  |
| `src/app/tags/_component/types.ts` | ts | no | TagRow, TagTreeRow, TagConfirmAction, tagFormSchema, TagFormValues, TagDetail |  |
| `src/app/tags/_component/utils.ts` | ts | no | humanizeSlug, sortTagsByName, buildTagTree, buildTagsFilterQuery, toFilterQuery, slugify, unwrapEnvelope, normalizePaged, formatDateTime | src/lib, src/lib/fetch-all-admin-list.ts, src/app/tags/_component/types.ts, src/lib/format-admin-datetime.ts, src/lib/api.ts |
| `src/app/tags/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/tags/new/page.tsx` | page | yes | NewTagPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/tags/_component, src/hooks/use-admin-mutation.ts |
| `src/app/tags/page.tsx` | page | yes | TagsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib/admin-row-action-handlers.ts, src/app/tags/_component, src/hooks/use-admin-mutat |
| `src/app/template.tsx` | template | no | Template |  |
| `src/app/templates/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/templates/[id]/edit/page.tsx` | page | yes | EditTemplatePage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/templates/_component, src/hooks/use-admin-mutation.ts |
| `src/app/templates/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/templates/[id]/page.tsx` | page | yes | TemplateDetailPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/templates/_component, src/providers/auth-provider.tsx |
| `src/app/templates/_component/_alert-dialog/index.ts` | ts | no | TemplatesConfirmDialog |  |
| `src/app/templates/_component/_form/index.ts` | ts | no | TemplateFormShell | src/app/templates/_component/_form/template-form-shell.tsx |
| `src/app/templates/_component/_form/template-form-shell.tsx` | tsx | yes | TemplateFormShellProps, TemplateFormShell | src/app/templates/_component/types.ts |
| `src/app/templates/_component/_hooks/index.ts` | ts | no | buildTemplatePayload, useTemplateForm, useHandleConfirmAction, useConfirmAction | src/app/templates/_component/_hooks/use-templates-actions.ts |
| `src/app/templates/_component/_hooks/use-templates-actions.ts` | ts | no | buildTemplatePayload, useTemplateForm, useHandleConfirmAction, useConfirmAction | src/app/templates/_component/types.ts |
| `src/app/templates/_component/_query/index.ts` | ts | no | useTemplateDetailQuery, useTemplatesListQuery, useTemplatesTrashQuery, templateDetailQueryKey, prefetchTemplateDetail | src/app/templates/_component/_query/use-templates-queries.ts |
| `src/app/templates/_component/_query/use-templates-queries.ts` | ts | no | templateDetailQueryKey, prefetchTemplateDetail, useTemplateDetailQuery, useTemplatesListQuery, useTemplatesTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/templates/_component/types.ts |
| `src/app/templates/_component/_table/index.ts` | ts | no | TemplatesTable, TemplatesTrashTable | src/app/templates/_component/_table/templates-table.tsx, src/app/templates/_component/_table/templates-trash-table.tsx |
| `src/app/templates/_component/_table/templates-table.tsx` | tsx | yes | TemplatesTable | src/app/templates/_component/types.ts |
| `src/app/templates/_component/_table/templates-trash-table.tsx` | tsx | yes | TemplatesTrashTable | src/app/templates/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/templates/_component/columns.tsx` | tsx | yes | getTemplateColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/templates/_component/types.ts |
| `src/app/templates/_component/index.ts` | ts | no | templateFormSchema, getTemplateColumns, useTemplateDetailQuery, useTemplatesListQuery, useTemplatesTrashQuery, templateDetailQueryKey, prefetchTemplateDetail, useColumnFiltersChange, useClearListFilte | src/app/templates/_component/types.ts, src/app/templates/_component/columns.tsx, src/app/templates/_component/_query, src/hooks/use-table-filters.ts, src/app/templates/_component/_hooks, src/app/templ |
| `src/app/templates/_component/types.ts` | ts | no | TemplateRow, TemplateConfirmAction, templateFormSchema, TemplateFormValues, TemplateDetail |  |
| `src/app/templates/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/templates/new/page.tsx` | page | yes | NewTemplatePage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/templates/_component, src/hooks/use-admin-mutation.ts |
| `src/app/templates/page.tsx` | page | yes | TemplatesPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/templates/_component, src/hooks/u |
| `src/app/training-levels/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/training-levels/[id]/edit/page.tsx` | page | yes | EditTrainingLevelPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/training-levels/_component, src/hooks/use-admin-mutation.ts |
| `src/app/training-levels/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/training-levels/[id]/page.tsx` | page | yes | TrainingLevelDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/training-levels/_component |
| `src/app/training-levels/_component/_alert-dialog/index.ts` | ts | no | TrainingLevelsConfirmDialog |  |
| `src/app/training-levels/_component/_form/index.ts` | ts | no | TrainingLevelFormShell | src/app/training-levels/_component/_form/training-level-form-shell.tsx |
| `src/app/training-levels/_component/_form/training-level-form-shell.tsx` | tsx | yes | TrainingLevelFormShellProps, TrainingLevelFormShell | src/app/training-levels/_component/types.ts |
| `src/app/training-levels/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildTrainingLevelPayload, useTrainingLevelForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/training-levels/_component/_hooks/use-training-levels-actions.ts |
| `src/app/training-levels/_component/_hooks/use-training-levels-actions.ts` | ts | no | buildTrainingLevelPayload, useTrainingLevelForm, useHandleConfirmAction, useConfirmAction | src/app/training-levels/_component/types.ts |
| `src/app/training-levels/_component/_query/index.ts` | ts | no | trainingLevelDetailQueryKey, prefetchTrainingLevelDetail, useTrainingLevelDetailQuery, useTrainingLevelsListQuery, UseTrashQueryProps, useTrainingLevelsTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/training-levels/_component/types.ts |
| `src/app/training-levels/_component/_table/index.ts` | ts | no | TrainingLevelsTable, TrainingLevelsTrashTable | src/app/training-levels/_component/_table/training-levels-table.tsx, src/app/training-levels/_component/_table/training-levels-trash-table.tsx |
| `src/app/training-levels/_component/_table/training-levels-table.tsx` | tsx | yes | TrainingLevelsTableProps, TrainingLevelsTable | src/app/training-levels/_component/types.ts |
| `src/app/training-levels/_component/_table/training-levels-trash-table.tsx` | tsx | yes | TrainingLevelsTrashTableProps, TrainingLevelsTrashTable | src/app/training-levels/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/training-levels/_component/columns.tsx` | tsx | yes | getTrainingLevelColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/training-levels/_component/types.ts |
| `src/app/training-levels/_component/index.ts` | ts | no | entityFormSchema, getTrainingLevelColumns, useTrainingLevelDetailQuery, useTrainingLevelsListQuery, useTrainingLevelsTrashQuery, trainingLevelDetailQueryKey, prefetchTrainingLevelDetail, useColumnFilt | src/app/training-levels/_component/types.ts, src/app/training-levels/_component/columns.tsx, src/app/training-levels/_component/_query, src/app/training-levels/_component/_hooks, src/app/training-leve |
| `src/app/training-levels/_component/types.ts` | ts | no | TrainingLevelRow, TrainingLevelConfirmAction, entityFormSchema, TrainingLevelFormValues, TrainingLevelDetail |  |
| `src/app/training-levels/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/training-levels/new/page.tsx` | page | yes | NewTrainingLevelPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/training-levels/_component, src/hooks/use-admin-mutation.ts |
| `src/app/training-levels/page.tsx` | page | yes | TrainingLevelsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/training-levels/_component, src/h |
| `src/app/training-systems/[id]/edit/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/training-systems/[id]/edit/page.tsx` | page | yes | EditTrainingSystemPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/training-systems/_component, src/hooks/use-admin-mutation.ts |
| `src/app/training-systems/[id]/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/training-systems/[id]/page.tsx` | page | yes | TrainingSystemDetailPage | src/lib/admin-navigation.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/app/training-systems/_component |
| `src/app/training-systems/_component/_alert-dialog/index.ts` | ts | no | TrainingSystemsConfirmDialog |  |
| `src/app/training-systems/_component/_form/index.ts` | ts | no | TrainingSystemFormShell | src/app/training-systems/_component/_form/training-system-form-shell.tsx |
| `src/app/training-systems/_component/_form/training-system-form-shell.tsx` | tsx | yes | TrainingSystemFormShellProps, TrainingSystemFormShell | src/app/training-systems/_component/types.ts |
| `src/app/training-systems/_component/_hooks/index.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters, buildTrainingSystemPayload, useTrainingSystemForm, useHandleConfirmAction, useConfirmAction | src/hooks/use-table-filters.ts, src/app/training-systems/_component/_hooks/use-training-systems-actions.ts |
| `src/app/training-systems/_component/_hooks/use-training-systems-actions.ts` | ts | no | buildTrainingSystemPayload, useTrainingSystemForm, useHandleConfirmAction, useConfirmAction | src/app/training-systems/_component/types.ts |
| `src/app/training-systems/_component/_query/index.ts` | ts | no | trainingSystemDetailQueryKey, prefetchTrainingSystemDetail, useTrainingSystemDetailQuery, useTrainingSystemsListQuery, UseTrashQueryProps, useTrainingSystemsTrashQuery | src/lib/admin-detail-query.ts, src/lib/fetch-all-admin-list.ts, src/app/training-systems/_component/types.ts |
| `src/app/training-systems/_component/_table/index.ts` | ts | no | TrainingSystemsTable, TrainingSystemsTrashTable | src/app/training-systems/_component/_table/training-systems-table.tsx, src/app/training-systems/_component/_table/training-systems-trash-table.tsx |
| `src/app/training-systems/_component/_table/training-systems-table.tsx` | tsx | yes | TrainingSystemsTableProps, TrainingSystemsTable | src/app/training-systems/_component/types.ts |
| `src/app/training-systems/_component/_table/training-systems-trash-table.tsx` | tsx | yes | TrainingSystemsTrashTableProps, TrainingSystemsTrashTable | src/app/training-systems/_component/types.ts, src/lib/api.ts, src/lib/admin-trash-export.ts |
| `src/app/training-systems/_component/columns.tsx` | tsx | yes | getTrainingSystemColumns | src/lib/admin-row-action-handlers.ts, src/lib/admin-table-columns.tsx, src/app/training-systems/_component/types.ts |
| `src/app/training-systems/_component/index.ts` | ts | no | entityFormSchema, getTrainingSystemColumns, useTrainingSystemDetailQuery, useTrainingSystemsListQuery, useTrainingSystemsTrashQuery, trainingSystemDetailQueryKey, prefetchTrainingSystemDetail, useColu | src/app/training-systems/_component/types.ts, src/app/training-systems/_component/columns.tsx, src/app/training-systems/_component/_query, src/app/training-systems/_component/_hooks, src/app/training- |
| `src/app/training-systems/_component/types.ts` | ts | no | TrainingSystemRow, TrainingSystemConfirmAction, entityFormSchema, TrainingSystemFormValues, TrainingSystemDetail |  |
| `src/app/training-systems/new/loading.tsx` | loading | no | Loading | src/components/admin-route-loading.tsx |
| `src/app/training-systems/new/page.tsx` | page | yes | NewTrainingSystemPage | src/lib/admin-navigation.ts, src/lib/api.ts, src/app/training-systems/_component, src/hooks/use-admin-mutation.ts |
| `src/app/training-systems/page.tsx` | page | yes | TrainingSystemsPage | src/lib/admin-navigation.ts, src/hooks/use-debounced-value.ts, src/providers/auth-provider.tsx, src/lib/api.ts, src/lib, src/lib/admin-row-action-handlers.ts, src/app/training-systems/_component, src/ |
| `src/components/admin-realtime-sync.tsx` | tsx | yes | AdminRealtimeSync | src/providers/auth-provider.tsx, src/hooks/use-admin-realtime-sync.ts |
| `src/components/admin-route-loading.tsx` | tsx | no | AdminRouteLoading, default |  |
| `src/components/api-scope-notice.tsx` | tsx | yes | ApiScopeNotice |  |
| `src/components/dashboard-charts.tsx` | tsx | yes | MonthlyLineChart, MonthlyBarChart, CategoryDoughnutChart, TopPostsChart | src/types/dashboard.ts |
| `src/components/location-map.tsx` | tsx | yes | LocationMap | src/lib/map-utils.ts |
| `src/config/admin-layout-static.ts` | ts | no | BACKEND_ADMIN_LAYOUT_STATIC | src/config/admin-menu-tree.tsx, src/lib/auth-session.ts, src/lib/auth-routes.ts |
| `src/config/admin-menu-tree.tsx` | tsx | yes | BACKEND_ADMIN_MENU_TREE |  |
| `src/config/protected-admin.ts` | ts | no | isProtectedAdminEmail, canEditSuperAdminRole, canEditProtectedAdminUser |  |
| `src/features/auth/admin-bridge.ts` | ts | no | getAdminBaseUrl, buildAdminBridgeLoginUrl, getAdminLoginUrl |  |
| `src/features/auth/auth-api.ts` | ts | no | AuthLoginPayload, RegisterRequestPayload, RegisterLeadPayload, DevLoginOption, fetchGoogleOAuthConfig, toAdminSessionUser, registerAccount, submitRegisterRequest |  |
| `src/features/auth/index.ts` | ts | no | SignInForm, RegisterForm | src/features/auth/sign-in-form.tsx, src/features/auth/register-form.tsx |
| `src/features/auth/register-form.tsx` | tsx | yes | RegisterForm | src/lib/auth-routes.ts, src/features/auth/auth-api.ts |
| `src/features/auth/session.ts` | ts | no | StoreSessionPayload, toStoreSession, persistSession | src/features/auth/auth-api.ts |
| `src/features/auth/sign-in-form.tsx` | tsx | yes | SignInForm | src/providers/auth-provider.tsx, src/features/auth/auth-api.ts, src/lib/auth-routes.ts, src/lib/auth-session.ts |
| `src/hooks/index.ts` | ts | no | useDebouncedValue, useAdminTableState | src/hooks/use-debounced-value.ts, src/hooks/use-admin-table-state.ts |
| `src/hooks/queries.ts` | ts | yes | queryKeys, UsersListData, RbacCatalog, ContactRequestsData, MyStudentsData, ParentStudentsData, useAccountProfile, useUpdateAccountProfile, useChangeAccountPassword, prefetchStaffProfile, useStaffProf | src/lib/admin-detail-query.ts, src/lib/api.ts, src/hooks/use-admin-mutation.ts |
| `src/hooks/use-admin-mutation.ts` | ts | no | useAdminMutation, adminToastMeta, createAdminMutationCache, defaultAdminOperationToast, defaultBulkOperationToast, resolveAdminOperationError, adminToastSuppressMeta, suppressRealtimeToastAfterMutatio |  |
| `src/hooks/use-admin-realtime-sync.ts` | ts | yes | useAdminRealtimeSync | src/lib/admin-socket.ts, src/lib/admin-realtime-query-map.ts, src/app/rbac/_component/_query/use-rbac-queries.ts, src/hooks/queries.ts |
| `src/hooks/use-admin-table-state.ts` | ts | yes | AdminTableTab, UseAdminTableStateOptions, UseAdminTableStateReturn, useAdminTableState | src/hooks/use-debounced-value.ts |
| `src/hooks/use-debounced-value.ts` | ts | yes | useDebouncedValue |  |
| `src/hooks/use-table-filters.ts` | ts | no | useColumnFiltersChange, useClearListFilters, useClearTrashFilters |  |
| `src/lib/admin-detail-query.ts` | ts | no | ADMIN_DETAIL_QUERY_STALE_MS, ADMIN_DETAIL_QUERY_GC_MS, adminDetailQueryOptions, prefetchAdminDetailQuery, adminDetailPlaceholderFromList |  |
| `src/lib/admin-navigation.ts` | ts | yes | AdminCrudNavigationOptions, useAdminCrudNavigation |  |
| `src/lib/admin-realtime-query-map.ts` | ts | no | ADMIN_RESOURCE_QUERY_PREFIX, queryPrefixesForAdminResource |  |
| `src/lib/admin-row-action-handlers.ts` | ts | no | AdminCrudRowHandlers, useAdminCrudRowHandlers |  |
| `src/lib/admin-socket.ts` | ts | yes | getAdminSocketOrigin, resolveAdminSocketAuth, ADMIN_SOCKET_PATH | src/lib/auth-session.ts |
| `src/lib/admin-table-columns.tsx` | tsx | yes | AdminTableView, adminDateRangeFilterFn, adminDeletedAtDateRangeFilterFn, defineAdminCreatedAtColumn, defineAdminUpdatedAtColumn, defineAdminDeletedAtColumn, buildAdminTableColumns, dedupeAdminTableCol | src/lib/format-admin-datetime.ts |
| `src/lib/admin-table-config.ts` | ts | no | adminTableStorageKeys, createAdminShowAllHandler, buildAdminTableExportConfig | src/lib/fetch-all-admin-list.ts |
| `src/lib/admin-trash-export.ts` | ts | no | AdminTrashExportParams, createAdminTrashExportFetchPage |  |
| `src/lib/admin-upload.ts` | ts | no | adminUploadAuthHeaders, uploadAdminImage | src/lib/auth-session.ts |
| `src/lib/admin-uploads.ts` | ts | no |  | src/lib/api.ts |
| `src/lib/admin-xlsx-export.ts` | ts | no | downloadAdminTableXlsx, buildExportFromFields, buildCsvFromColumns, downloadXlsxFile, downloadXlsxWorkbook, appendExportDateToXlsxFileName, buildAdminTableXlsxExport, buildEventDetailXlsxExport |  |
| `src/lib/api.ts` | ts | no | api, ApiError | src/lib/auth-session.ts |
| `src/lib/auth-routes.ts` | ts | no | AUTH_LOGIN_PATH, AUTH_REGISTER_PATH, AUTH_PATHS, AuthPath, isAuthPath, getAdminAppHomeExternalPath, getAdminLoginExternalPath |  |
| `src/lib/auth-session.ts` | ts | no | ADMIN_SESSION_KEY, ADMIN_SESSION_EVENT, readAdminSession, writeAdminSession, patchAdminSessionProfile, clearAdminSession, getAdminUserId, getAdminDevAuthLogContext | src/features/auth/auth-api.ts |
| `src/lib/build-admin-filter-query.ts` | ts | no | FilterMapping, normalizeAdminFilterValue, normalizeAdminFilterValues, identityFilterMapping, buildAdminFilterQuery, COMMON_FILTER_MAPPINGS |  |
| `src/lib/category-icons.ts` | ts | no | CATEGORY_ICON_OPTIONS, resolveCategoryIcon |  |
| `src/lib/dev-demo-accounts.ts` | ts | no | DevDemoAccount, DEV_DEMO_ACCOUNTS, isDevDemoLoginEnabled |  |
| `src/lib/export-file-save.ts` | ts | no | supportsExportDirectoryPicker |  |
| `src/lib/fetch-all-admin-list.ts` | ts | no | ADMIN_LIST_EXPORT_FETCH_LIMIT, AdminListPageResult |  |
| `src/lib/format-admin-datetime.ts` | ts | no | formatAdminDateTime, isParsableDateTime |  |
| `src/lib/format.ts` | ts | no | formatVND, formatDate |  |
| `src/lib/hanet-webhook-url.ts` | ts | no | getApiOrigin, buildHanetWebhookAutoUrl, buildHanetWebhookUrl |  |
| `src/lib/index.ts` | ts | no | buildAdminFilterQuery, identityFilterMapping, COMMON_FILTER_MAPPINGS, normalizeAdminFilterValue, normalizeAdminFilterValues, formatVND, formatDate, formatAdminDateTime, isParsableDateTime, adminDateRa | src/lib/build-admin-filter-query.ts, src/lib/format.ts, src/lib/format-admin-datetime.ts, src/lib/admin-table-columns.tsx, src/lib/admin-row-action-handlers.ts |
| `src/lib/map-utils.ts` | ts | no | parseCoordsFromMapUrl |  |
| `src/lib/permission-labels.ts` | ts | no | PERMISSION_LABEL_VI, permissionLabelVi, permissionGroupKey, permissionGroupLabelVi |  |
| `src/lib/product-price.ts` | ts | no | unitSellingAndListPrice |  |
| `src/providers/auth-provider.tsx` | tsx | yes | StaffLoginResult, AuthProvider, useAuth, useClientReady | src/features/auth/auth-api.ts, src/lib/auth-session.ts, src/lib/auth-routes.ts |
| `src/providers/backend-admin-layout.tsx` | tsx | yes | BackendAdminLayoutProvider | src/lib/api.ts, src/config/admin-layout-static.ts, src/components/admin-realtime-sync.tsx, src/providers/auth-provider.tsx |
| `src/providers/query-provider.tsx` | tsx | yes | QueryProvider | src/hooks/use-admin-mutation.ts |
| `src/proxy.ts` | ts | no | proxy, config |  |
| `src/types/dashboard.ts` | ts | no | DashboardOverviewDto, DashboardMonthlyItemDto, DashboardCategoryItemDto, DashboardTopPostDto, DashboardStatsDto |  |
| `src/types/google-identity.d.ts` | ts | no |  |  |
| `src/types/student-scores.ts` | ts | no | YearAverage, TermAverage, OverallAverage, DetailedScore, StudentYearAveragesResponse, StudentTermAveragesResponse, StudentOverallAverageResponse, StudentScoresResponse |  |
| `tsconfig.json` | config | — | — | — |
## File Markdown trong scope app

Toàn bộ `.md` sinh tự động nằm trong **`apps/backend/.graphify/markdown/`**; JSON trong **`../snapshot/`** — xem mục **Mục lục artefact Graphify** ở đầu file.

- **Chỉ mục monorepo + chủ đề:** [`../../../../.graphify/markdown/SUMMARY_FOR_AI.md`](../../../../.graphify/markdown/SUMMARY_FOR_AI.md).

## Làm mới

- Cập nhật `snapshot/context.json` **và** `snapshot/graph.json`: `node scripts/graphify-update.cjs apps/backend`.
- Sau đó chạy: `pnpm graphify:ai-summary` (sinh thêm `FOLDER_TREE.md`, `GRAPH_STATS.md` khi có graph).
