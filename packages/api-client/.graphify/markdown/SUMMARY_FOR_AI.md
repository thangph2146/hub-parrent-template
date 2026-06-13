# HTTP SDK / types — tóm tắt cho AI (Graphify)

> Package `@workspace/api-client` · `packages/api-client/`

- **context.generatedAt:** 2026-06-12T14:19:36.367Z
- **summary sinh:** `2026-06-13T10:59:09.378Z`

## Mục lục artefact

- [`FOLDER_TREE.md`](FOLDER_TREE.md) · [`GRAPH_STATS.md`](GRAPH_STATS.md)
- [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) · [`ENTRY_POINTS.md`](ENTRY_POINTS.md) · [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md)

## Doc & verify

- **Doc:** [`docs/api-client-pattern/README.md`](../../../docs/api-client-pattern/README.md)
- **Verify:** `pnpm check`, `pnpm verify:api-contract`

## Focus paths (agent)

- `packages/api-client/src/resources/`
- `packages/api-client/src/realtime/`

## Thống kê snapshot

- **totalFiles:** 68
- **clientComponents:** 0

## API resources (`40` file)

- `src/resources/academic-years.ts`
- `src/resources/accounts.ts`
- `src/resources/auth-admin.ts`
- `src/resources/cameras.ts`
- `src/resources/carts.ts`
- `src/resources/categories.ts`
- `src/resources/contact-requests.ts`
- `src/resources/courses.ts`
- `src/resources/dashboard.ts`
- `src/resources/departments.ts`
- `src/resources/dev-login.ts`
- `src/resources/event-checkins.ts`
- `src/resources/event-checkouts.ts`
- `src/resources/event-registrations.ts`
- `src/resources/event-speakers.ts`
- `src/resources/events.ts`
- `src/resources/face-data.ts`
- `src/resources/guides.ts`
- `src/resources/locations.ts`
- `src/resources/majors.ts`
- `src/resources/my-students.ts`
- `src/resources/orders.ts`
- `src/resources/parent-students.ts`
- `src/resources/posts.ts`
- `src/resources/products.ts`
- `src/resources/promo-codes.ts`
- `src/resources/public.ts`
- `src/resources/rbac.ts`
- `src/resources/roles.ts`
- `src/resources/screens.ts`
- `src/resources/seo-metas.ts`
- `src/resources/settings.ts`
- `src/resources/speakers.ts`
- `src/resources/system.ts`
- `src/resources/tags.ts`
- `src/resources/templates.ts`
- `src/resources/training-levels.ts`
- `src/resources/training-systems.ts`
- `src/resources/uploads.ts`
- `src/resources/users.ts`

## Làm mới

```bash
node script-system/graphify/graphify-update.cjs packages/api-client
pnpm graphify:ai-summary
```
