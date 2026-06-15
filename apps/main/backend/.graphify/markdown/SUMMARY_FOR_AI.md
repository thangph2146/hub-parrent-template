# Admin Next (main) — @backend — tóm tắt cho AI (Graphify)

> Tự động sinh từ `../snapshot/context.json` — **đọc file này trước**; tránh mở toàn bộ JSON snapshot (nhúng source đầy đủ).

- **projectRoot:** `D:/HUB/working/2026/hub-parrent-template/apps/main/backend`
- **context.generatedAt:** 2026-06-15T03:40:50.754Z

## Mục lục artefact Graphify

- **Markdown (ưu tiên đọc):** file này — [`FOLDER_TREE.md`](FOLDER_TREE.md), [`GRAPH_STATS.md`](GRAPH_STATS.md), [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md), [`ENTRY_POINTS.md`](ENTRY_POINTS.md), [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md)
- **Snapshot (JSON nặng):** [`../snapshot/context.json`](../snapshot/context.json), [`../snapshot/graph.json`](../snapshot/graph.json) — chỉ mở khi cần trích source hoặc đồ thị đầy đủ.
- **Quy ước thư mục `.graphify` (tay):** [`../README.md`](../README.md).

## Liên kết dịch vụ & tài liệu hub

App **không** import chéo source `apps/*`; giao tiếp qua **HTTP** + `@workspace/api-client` (và `fetch` public ở storefront khi cần).

### Graphify — markdown các phần còn lại của monorepo

- **@api:** [SUMMARY](../../../../../apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/main/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/main/api/.graphify/markdown/GRAPH_STATS.md)
- **@hub-parent/api:** [SUMMARY](../../../../../apps/hub-parent/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-parent/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-parent/api/.graphify/markdown/GRAPH_STATS.md)
- **@frontend:** [SUMMARY](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-parent/hub-parent-frontend/.graphify/markdown/GRAPH_STATS.md)
- **@hub-event/api:** [SUMMARY](../../../../../apps/hub-event/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-event/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-event/api/.graphify/markdown/GRAPH_STATS.md)
- **@hub-event-checkin-frontend:** [SUMMARY](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/GRAPH_STATS.md)
- **@store-sync/api:** [SUMMARY](../../../../../apps/store-sync/api/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/store-sync/api/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/store-sync/api/.graphify/markdown/GRAPH_STATS.md)
- **@store-sync-frontend:** [SUMMARY](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](../../../../../apps/store-sync/store-sync-frontend/.graphify/markdown/GRAPH_STATS.md)
- **packages:** [SUMMARY](../../../../../packages/.graphify/markdown/SUMMARY_FOR_AI.md) · [WORKSPACE_DEPS](../../../../../packages/.graphify/markdown/WORKSPACE_DEPS.md)
- **monorepo (chỉ mục + chủ đề):** [SUMMARY gốc](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md)

### Tài liệu hub (không sinh bởi Graphify)

- [MICROSERVICE_SYSTEM_MAP](../../../../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) — boundaries, ORM, checklist.
- [AGENTS_GUIDE](../../../../../docs/admin-pattern/AGENTS_GUIDE.md) — thứ tự đọc cho agent.
- [AGENTS.md](../../../../../AGENTS.md) — `pnpm check`, `check:full`.

## Bản đồ từ snapshot/graph.json

- **Cây thư mục `src/`:** [`FOLDER_TREE.md`](FOLDER_TREE.md) (ASCII từ `../snapshot/graph.json`).
- **Thống kê graph:** [`GRAPH_STATS.md`](GRAPH_STATS.md) — quy mô node/link, top file in/out-degree (điểm nóng import).
- **Bán kính ảnh hưởng:** [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) — file in-degree cao + mẫu importer (sửa shared code).
- **Điểm vào:** [`ENTRY_POINTS.md`](ENTRY_POINTS.md) — bootstrap, module, route Next, AUTO-GENERATED.
- **Pattern lặp:** [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md) — boilerplate (loading, re-export generate).

## Thống kê
- **totalFiles:** 202
- **clientComponents:** 8

## Trang (pages) (99)
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
- `src/app/orders/page.tsx`
- `src/app/orders/[id]/edit/page.tsx`
- `src/app/orders/[id]/page.tsx`
- `src/app/page.tsx`
- `src/app/parent-students/page.tsx`
- `src/app/posts/new/page.tsx`
- `src/app/posts/page.tsx`
- `src/app/posts/[id]/edit/page.tsx`
- `src/app/posts/[id]/page.tsx`
- `src/app/products/new/page.tsx`
- `src/app/products/page.tsx`
- `src/app/products/[id]/edit/page.tsx`
- `src/app/products/[id]/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/promo-codes/new/page.tsx`
- `src/app/promo-codes/page.tsx`
- `src/app/promo-codes/[id]/edit/page.tsx`
- `src/app/promo-codes/[id]/page.tsx`
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
| `src/app/academic-years/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/academic-years/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/academic-years/[id]/loading.tsx` | loading | no | default |  |
| `src/app/academic-years/[id]/page.tsx` | page | no | default |  |
| `src/app/academic-years/new/loading.tsx` | loading | no | default |  |
| `src/app/academic-years/new/page.tsx` | page | no | default |  |
| `src/app/academic-years/page.tsx` | page | no | default |  |
| `src/app/api/graphify/route.ts` | api-route | no |  |  |
| `src/app/cameras/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/cameras/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/cameras/[id]/loading.tsx` | loading | no | default |  |
| `src/app/cameras/[id]/page.tsx` | page | no | default |  |
| `src/app/cameras/new/loading.tsx` | loading | no | default |  |
| `src/app/cameras/new/page.tsx` | page | no | default |  |
| `src/app/cameras/page.tsx` | page | no | default |  |
| `src/app/categories/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/categories/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/categories/[id]/loading.tsx` | loading | no | default |  |
| `src/app/categories/[id]/page.tsx` | page | no | default |  |
| `src/app/categories/new/loading.tsx` | loading | no | default |  |
| `src/app/categories/new/page.tsx` | page | no | default |  |
| `src/app/categories/page.tsx` | page | no | default |  |
| `src/app/contact-requests/[id]/loading.tsx` | loading | no | default |  |
| `src/app/contact-requests/[id]/page.tsx` | page | no | default |  |
| `src/app/contact-requests/page.tsx` | page | no | default |  |
| `src/app/courses/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/courses/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/courses/[id]/loading.tsx` | loading | no | default |  |
| `src/app/courses/[id]/page.tsx` | page | no | default |  |
| `src/app/courses/new/loading.tsx` | loading | no | default |  |
| `src/app/courses/new/page.tsx` | page | no | default |  |
| `src/app/courses/page.tsx` | page | no | default |  |
| `src/app/data/page.tsx` | page | no | default |  |
| `src/app/database-schema/page.tsx` | page | no | default |  |
| `src/app/departments/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/departments/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/departments/[id]/loading.tsx` | loading | no | default |  |
| `src/app/departments/[id]/page.tsx` | page | no | default |  |
| `src/app/departments/new/loading.tsx` | loading | no | default |  |
| `src/app/departments/new/page.tsx` | page | no | default |  |
| `src/app/departments/page.tsx` | page | no | default |  |
| `src/app/error.tsx` | error | yes | AdminError |  |
| `src/app/events/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/events/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/events/[id]/loading.tsx` | loading | no | default |  |
| `src/app/events/[id]/page.tsx` | page | no | default |  |
| `src/app/events/new/loading.tsx` | loading | no | default |  |
| `src/app/events/new/page.tsx` | page | no | default |  |
| `src/app/events/page.tsx` | page | no | default |  |
| `src/app/file-storage/page.tsx` | page | no | default |  |
| `src/app/graph/page.tsx` | page | no | default |  |
| `src/app/guides/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/guides/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/guides/[id]/loading.tsx` | loading | no | default |  |
| `src/app/guides/[id]/page.tsx` | page | no | default |  |
| `src/app/guides/new/loading.tsx` | loading | no | default |  |
| `src/app/guides/new/page.tsx` | page | no | default |  |
| `src/app/guides/page.tsx` | page | no | default |  |
| `src/app/layout.tsx` | layout | no | metadata, RootLayout | src/app/page.tsx, src/providers/query-provider.tsx, src/providers/auth-provider.tsx, src/providers/admin-runtime-bridge.tsx, src/providers/backend-admin-layout.tsx |
| `src/app/loading.tsx` | loading | no | Loading |  |
| `src/app/locations/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/locations/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/locations/[id]/loading.tsx` | loading | no | default |  |
| `src/app/locations/[id]/page.tsx` | page | no | default |  |
| `src/app/locations/new/loading.tsx` | loading | no | default |  |
| `src/app/locations/new/page.tsx` | page | no | default |  |
| `src/app/locations/page.tsx` | page | no | default |  |
| `src/app/login/page.tsx` | page | no | default |  |
| `src/app/majors/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/majors/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/majors/[id]/loading.tsx` | loading | no | default |  |
| `src/app/majors/[id]/page.tsx` | page | no | default |  |
| `src/app/majors/new/loading.tsx` | loading | no | default |  |
| `src/app/majors/new/page.tsx` | page | no | default |  |
| `src/app/majors/page.tsx` | page | no | default |  |
| `src/app/my-students/page.tsx` | page | no | default |  |
| `src/app/orders/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/orders/[id]/page.tsx` | page | no | default |  |
| `src/app/orders/page.tsx` | page | no | default |  |
| `src/app/page.tsx` | page | no | default |  |
| `src/app/parent-students/page.tsx` | page | no | default |  |
| `src/app/posts/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/posts/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/posts/[id]/loading.tsx` | loading | no | default |  |
| `src/app/posts/[id]/page.tsx` | page | no | default |  |
| `src/app/posts/loading.tsx` | loading | no | default |  |
| `src/app/posts/new/loading.tsx` | loading | no | default |  |
| `src/app/posts/new/page.tsx` | page | no | default |  |
| `src/app/posts/page.tsx` | page | no | default |  |
| `src/app/products/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/products/[id]/page.tsx` | page | no | default |  |
| `src/app/products/new/page.tsx` | page | no | default |  |
| `src/app/products/page.tsx` | page | no | default |  |
| `src/app/profile/page.tsx` | page | no | default |  |
| `src/app/promo-codes/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/promo-codes/[id]/page.tsx` | page | no | default |  |
| `src/app/promo-codes/new/page.tsx` | page | no | default |  |
| `src/app/promo-codes/page.tsx` | page | no | default |  |
| `src/app/rbac/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/rbac/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/rbac/[id]/loading.tsx` | loading | no | default |  |
| `src/app/rbac/[id]/page.tsx` | page | no | default |  |
| `src/app/rbac/page.tsx` | page | no | default |  |
| `src/app/register/page.tsx` | page | no | default |  |
| `src/app/robots.ts` | ts | no | robots |  |
| `src/app/screens/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/screens/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/screens/[id]/loading.tsx` | loading | no | default |  |
| `src/app/screens/[id]/page.tsx` | page | no | default |  |
| `src/app/screens/new/loading.tsx` | loading | no | default |  |
| `src/app/screens/new/page.tsx` | page | no | default |  |
| `src/app/screens/page.tsx` | page | no | default |  |
| `src/app/seo-metas/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/seo-metas/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/seo-metas/[id]/loading.tsx` | loading | no | default |  |
| `src/app/seo-metas/[id]/page.tsx` | page | no | default |  |
| `src/app/seo-metas/new/loading.tsx` | loading | no | default |  |
| `src/app/seo-metas/new/page.tsx` | page | no | default |  |
| `src/app/seo-metas/page.tsx` | page | no | default |  |
| `src/app/settings/page.tsx` | page | no | default |  |
| `src/app/speakers/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/speakers/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/speakers/[id]/loading.tsx` | loading | no | default |  |
| `src/app/speakers/[id]/page.tsx` | page | no | default |  |
| `src/app/speakers/new/loading.tsx` | loading | no | default |  |
| `src/app/speakers/new/page.tsx` | page | no | default |  |
| `src/app/speakers/page.tsx` | page | no | default |  |
| `src/app/staff/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/staff/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/staff/[id]/loading.tsx` | loading | no | default |  |
| `src/app/staff/[id]/page.tsx` | page | no | default |  |
| `src/app/staff/new/loading.tsx` | loading | no | default |  |
| `src/app/staff/new/page.tsx` | page | no | default |  |
| `src/app/staff/page.tsx` | page | no | default |  |
| `src/app/tags/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/tags/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/tags/[id]/loading.tsx` | loading | no | default |  |
| `src/app/tags/[id]/page.tsx` | page | no | default |  |
| `src/app/tags/new/loading.tsx` | loading | no | default |  |
| `src/app/tags/new/page.tsx` | page | no | default |  |
| `src/app/tags/page.tsx` | page | no | default |  |
| `src/app/template.tsx` | template | no | Template |  |
| `src/app/templates/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/templates/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/templates/[id]/loading.tsx` | loading | no | default |  |
| `src/app/templates/[id]/page.tsx` | page | no | default |  |
| `src/app/templates/new/loading.tsx` | loading | no | default |  |
| `src/app/templates/new/page.tsx` | page | no | default |  |
| `src/app/templates/page.tsx` | page | no | default |  |
| `src/app/training-levels/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/training-levels/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/training-levels/[id]/loading.tsx` | loading | no | default |  |
| `src/app/training-levels/[id]/page.tsx` | page | no | default |  |
| `src/app/training-levels/new/loading.tsx` | loading | no | default |  |
| `src/app/training-levels/new/page.tsx` | page | no | default |  |
| `src/app/training-levels/page.tsx` | page | no | default |  |
| `src/app/training-systems/[id]/edit/loading.tsx` | loading | no | default |  |
| `src/app/training-systems/[id]/edit/page.tsx` | page | no | default |  |
| `src/app/training-systems/[id]/loading.tsx` | loading | no | default |  |
| `src/app/training-systems/[id]/page.tsx` | page | no | default |  |
| `src/app/training-systems/new/loading.tsx` | loading | no | default |  |
| `src/app/training-systems/new/page.tsx` | page | no | default |  |
| `src/app/training-systems/page.tsx` | page | no | default |  |
| `src/config/admin-layout-static.ts` | ts | no | BACKEND_ADMIN_LAYOUT_STATIC | src/config/admin-menu-tree.tsx, src/lib/auth-session.ts, src/lib/auth-routes.ts |
| `src/config/admin-menu-icons.ts` | ts | no | resolveAdminMenuIcons | src/config/admin-menu-tree.items.ts |
| `src/config/admin-menu-tree.items.ts` | ts | no | AdminMenuLeafData, AdminMenuTreeItemData, BACKEND_ADMIN_MENU_ITEMS |  |
| `src/config/admin-menu-tree.tsx` | tsx | yes | BACKEND_ADMIN_MENU_TREE | src/config/admin-menu-icons.ts, src/config/admin-menu-tree.items.ts |
| `src/config/protected-admin.ts` | ts | no | isProtectedAdminEmail, canEditSuperAdminRole, canEditProtectedAdminUser |  |
| `src/features/auth/admin-bridge.ts` | ts | no | getAdminBaseUrl, buildAdminBridgeLoginUrl, getAdminLoginUrl |  |
| `src/features/auth/auth-api.ts` | ts | no |  |  |
| `src/features/auth/index.ts` | ts | no | SignInForm, RegisterForm | src/features/auth/sign-in-form.tsx, src/features/auth/register-form.tsx |
| `src/features/auth/register-form.tsx` | tsx | no | RegisterForm |  |
| `src/features/auth/session.ts` | ts | no | StoreSessionPayload, toStoreSession, persistSession | src/features/auth/auth-api.ts |
| `src/features/auth/sign-in-form.tsx` | tsx | no | SignInForm |  |
| `src/hooks/index.ts` | ts | no | useDebouncedValue, useAdminEditFormHydration, useAdminFormDraftPersistence, useAdminTableState | src/hooks/use-debounced-value.ts, src/hooks/use-admin-edit-form-hydration.ts, src/hooks/use-admin-table-state.ts |
| `src/hooks/queries.ts` | ts | no |  |  |
| `src/hooks/use-admin-edit-form-hydration.ts` | ts | no |  |  |
| `src/hooks/use-admin-mutation.ts` | ts | yes | useAdminMutation, adminToastMeta, createAdminMutationCache, defaultAdminOperationToast, defaultBulkOperationToast, resolveAdminOperationError, adminToastSuppressMeta, suppressRealtimeToastAfterMutatio |  |
| `src/hooks/use-admin-realtime-sync.ts` | ts | no | useAdminRealtimeSync |  |
| `src/hooks/use-admin-table-state.ts` | ts | no |  |  |
| `src/hooks/use-debounced-value.ts` | ts | no |  |  |
| `src/hooks/use-table-filters.ts` | ts | no |  |  |
| `src/lib/admin-realtime-query-map.ts` | ts | no |  |  |
| `src/lib/admin-socket.ts` | ts | no |  |  |
| `src/lib/admin-upload.ts` | ts | no |  |  |
| `src/lib/api-base-url.ts` | ts | no |  |  |
| `src/lib/api.ts` | ts | no | api, ApiError | src/lib/api-base-url.ts, src/lib/auth-session.ts |
| `src/lib/auth-routes.ts` | ts | no |  |  |
| `src/lib/auth-session.ts` | ts | no |  |  |
| `src/providers/admin-realtime-sync.tsx` | tsx | yes | AdminRealtimeSync | src/providers/auth-provider.tsx, src/hooks/use-admin-realtime-sync.ts |
| `src/providers/admin-runtime-bridge.tsx` | tsx | yes | AdminRuntimeBridge | src/providers/auth-provider.tsx, src/lib/api.ts |
| `src/providers/auth-provider.tsx` | tsx | yes | StaffLoginResult, AuthProvider, useAuth, useClientReady | src/features/auth/auth-api.ts, src/lib/auth-session.ts, src/lib/auth-routes.ts |
| `src/providers/backend-admin-layout.tsx` | tsx | yes | BackendAdminLayoutProvider | src/lib/api.ts, src/config/admin-layout-static.ts, src/providers/admin-realtime-sync.tsx, src/providers/auth-provider.tsx |
| `src/providers/query-provider.tsx` | tsx | yes | QueryProvider | src/hooks/use-admin-mutation.ts |
| `src/proxy.ts` | ts | no | proxy, config |  |
| `src/types/dashboard.ts` | ts | no |  |  |
| `src/types/google-identity.d.ts` | ts | no |  |  |
| `src/types/student-scores.ts` | ts | no | YearAverage, TermAverage, OverallAverage, DetailedScore, StudentYearAveragesResponse, StudentTermAveragesResponse, StudentOverallAverageResponse, StudentScoresResponse |  |
| `tsconfig.json` | config | — | — | — |
## File Markdown trong scope app

Toàn bộ `.md` sinh tự động nằm trong **`apps/main/backend/.graphify/markdown/`**; JSON trong **`../snapshot/`** — xem mục **Mục lục artefact Graphify** ở đầu file.

- **Chỉ mục monorepo + chủ đề:** [`../../../../../.graphify/markdown/SUMMARY_FOR_AI.md`](../../../../../.graphify/markdown/SUMMARY_FOR_AI.md).

## Làm mới

- Cập nhật `snapshot/context.json` **và** `snapshot/graph.json`: `node script-system/graphify/graphify-update.cjs apps/main/backend`.
- Sau đó chạy: `pnpm graphify:ai-summary` (sinh thêm `FOLDER_TREE.md`, `GRAPH_STATS.md` khi có graph).
