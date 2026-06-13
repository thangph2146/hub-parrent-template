# Admin CRUD dùng chung — tóm tắt cho AI (Graphify)

> Package `@workspace/admin-app` · `packages/admin-app/`

- **context.generatedAt:** 2026-06-12T14:19:36.274Z
- **summary sinh:** `2026-06-13T10:59:09.355Z`

## Mục lục artefact

- [`FOLDER_TREE.md`](FOLDER_TREE.md) · [`GRAPH_STATS.md`](GRAPH_STATS.md)
- [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) · [`ENTRY_POINTS.md`](ENTRY_POINTS.md) · [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md)

## Doc & verify

- **Doc:** [`docs/admin-pattern/ADMIN_APP_PACKAGE.md`](../../../docs/admin-pattern/ADMIN_APP_PACKAGE.md)
- **Verify:** `pnpm check`, `pnpm verify:main-admin`

## Focus paths (agent)

- `packages/admin-app/src/modules/`
- `packages/admin-app/src/lib/`
- `packages/admin-app/src/runtime/`

## Thống kê snapshot

- **totalFiles:** 608
- **clientComponents:** 262
- **pages (module):** 94 file

## Admin modules (`29`)

- `src/modules/academic-years/`
- `src/modules/cameras/`
- `src/modules/categories/`
- `src/modules/contact-requests/`
- `src/modules/courses/`
- `src/modules/dashboard/`
- `src/modules/data/`
- `src/modules/departments/`
- `src/modules/events/`
- `src/modules/file-storage/`
- `src/modules/guides/`
- `src/modules/locations/`
- `src/modules/majors/`
- `src/modules/my-students/`
- `src/modules/orders/`
- `src/modules/parent-students/`
- `src/modules/posts/`
- `src/modules/products/`
- `src/modules/promo-codes/`
- `src/modules/rbac/`
- `src/modules/screens/`
- `src/modules/seo-metas/`
- `src/modules/settings/`
- `src/modules/speakers/`
- `src/modules/staff/`
- `src/modules/tags/`
- `src/modules/templates/`
- `src/modules/training-levels/`
- `src/modules/training-systems/`

## Làm mới

```bash
node script-system/graphify/graphify-update.cjs packages/admin-app
pnpm graphify:ai-summary
```
