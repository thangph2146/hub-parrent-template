# API Pattern (NestJS)

Tài liệu này mô tả kiến trúc và pattern chuẩn cho API Nest — MikroORM.

**Đường dẫn thực tế:** dev tại `apps/main/api` (`@api`); deploy line `apps/hub-parent/api`, `apps/hub-event/api`, `apps/store-sync/api`. Logic dùng chung + generate check-in: [`packages/api-server/README.md`](../../packages/api-server/README.md). Bản đồ: [`docs/MONOREPO_STRUCTURE.md`](../MONOREPO_STRUCTURE.md).

Các ví dụ dưới đây dùng cấu trúc `apps/main/api/src/` (tương đương `src/` trong từng app API).

**Tích hợp HANET (camera AI / check-in):** [`HANET.md`](HANET.md) — Postman partner, proxy `/admin/hanet/*`, person, check-in, `face_data`.

## Kiến trúc tổng quan

```
apps/api/src/
  <resource>/
    <resource>.controller.ts   -- Route handlers, filter parsing, error handling, Swagger
    <resource>.service.ts      -- Business logic, MikroORM queries, buildWhere, mapRow DTO
    <resource>.module.ts       -- @Module decorator, imports NotificationsModule
  entities/
    base.entity.ts             -- UUID PrimaryKey (randomUUID)
    <entity>.entity.ts         -- MikroORM entity, extends BaseEntity
  common/
    api-response.ts            -- createSuccessResponse / createErrorResponse
    pagination.ts              -- normalizePageLimit / paginationMeta
    resolve-relation-filters.ts-- batchFindByEntity cho filter name→UUID
    get-options.ts             -- getOptionsFromModel cho dropdown
    date-utils.ts              -- safeIsoString / safeIsoStringNow
    request-id.middleware.ts   -- X-Request-Id
    api-access.middleware.ts   -- Log request/response
    logging.interceptor.ts     -- Structured HTTP logging
    database-http-exception.filter.ts -- Global exception filter
  config/
    constants.ts               -- APP_HEADERS, ADMIN_ROUTES, PUBLIC_ROUTES
    permissions.ts             -- RESOURCES, ACTIONS, PERMISSION_CODES
    app.config.ts              -- Runtime config (port, cors, bodyLimit)
```

## Controller pattern

### Route prefix

```typescript
@Controller(ADMIN_ROUTES.POSTS)  // = 'admin/posts'
```

### Endpoints chuẩn cho mọi resource CRUD

| Method | Route              | Handler        | Mục đích                      |
| ------ | ------------------ | -------------- | ----------------------------- |
| GET    | `/`                | `list()`       | Danh sách phân trang + filter |
| GET    | `/options`         | `options()`    | Dropdown options              |
| GET    | `/:id`             | `getById()`    | Chi tiết                      |
| POST   | `/`                | `create()`     | Tạo mới                       |
| PUT    | `/:id`             | `update()`     | Cập nhật                      |
| POST   | `/bulk`            | `bulk()`       | Hành động bulk                |
| DELETE | `/:id/hard-delete` | `purge()`      | Xoá vĩnh viễn                 |
| DELETE | `/:id`             | `softDelete()` | Xoá mềm                       |
| POST   | `/:id/restore`     | `restore()`    | Khôi phục                     |

### X-User-Id header

Mọi endpoint đều gọi `this.getUserId(headers)` ở đầu handler. Nếu thiếu → 401.

### Filter convention

Query params dạng `filter[key]=value` được parse bằng regex `/^filter\[(.+)\]$/`:

```typescript
const m = key.match(/^filter\[(.+)\]$/)
if (m && value) filters[m[1]] = value
```

### Error handling

```typescript
try {
  const result = await this.service.list({...});
  const { statusCode, body } = createSuccessResponse({ data: result.data, pagination });
  return res.status(statusCode).json(body);
} catch (error: unknown) {
  this.logger.error(`GET /admin/posts ERROR: ${...}`);
  this.logApiError('GET /admin/posts', 'Lỗi khi lấy danh sách posts', error, { page, limit, ... });
  const { statusCode, body } = createErrorResponse('Lỗi server', { status: 500 });
  return res.status(statusCode).json(body);
}
```

### Swagger

Mỗi handler đều có decorators `@ApiOperation`, `@ApiHeader`, `@ApiQuery`/`@ApiParam`, `@ApiResponse`.

## Service pattern

### Constructor

```typescript
constructor(private readonly em: EntityManager) {}
```

### BuildWhere

Hàm `buildWhere()` xây dựng MikroORM filter object:

- `status === 'active'` → `deletedAt = null`
- `status === 'deleted'` → `deletedAt != null`
- Các filter key: `authorId` → `baseWhere.author = v`, `published` → boolean, `categories`/`tags` → relation filter
- `search` → `$or` trên title/slug/excerpt

### Two-step query (tránh "Out of sort memory" MySQL)

```typescript
// Bước 1: Chỉ lấy IDs + phân trang
const [idsOnly, total] = await Promise.all([
  this.em.find(Entity, where, { fields: ['id'], orderBy, offset, limit }),
  this.em.count(Entity, where),
]);
// Bước 2: Lấy full rows với populate
const rows = await this.em.find(Entity, { id: { $in: ids } }, { populate: [...], fields: [...] });
// Bước 3: Giữ thứ tự từ bước 1
```

**Lưu ý**: `fields` chỉ chứa scalar properties, KHÔNG chứa relation names. Relations đi trong `populate`.

### mapRow — DTO mapping

Hàm `mapRow` chuyển entity → RowDto. Relations (author, categories, tags) được extract và transform.

### Pagination

```typescript
const { page, limit, skip } = normalizePageLimit(
  params.page,
  params.limit,
  maxLimit
)
// ... query ...
return { data, pagination: paginationMeta(page, limit, total) }
```

### CRUD operations

- **Create**: `new Entity()`, set fields, `em.persist(entity)`, `em.flush()`, refetch via `getById`
- **Update**: `em.findOne`, set fields conditionally, `em.flush()`
- **Soft delete**: `row.deletedAt = new Date()`, `em.flush()`
- **Restore**: `row.deletedAt = null`, `em.flush()`
- **Hard delete**: `em.remove(row)`, `em.flush()`
- **Bulk**: `em.nativeUpdate(Entity, { id: { $in: ids } }, { deletedAt: new Date() })`

## Common utilities

### api-response.ts

```typescript
createSuccessResponse(data, { message?, status? })  // → { success:true, message, error:null, data }
createErrorResponse(message, { status?, error?, data? })  // → { success:false, message, error, data }
```

### pagination.ts

```typescript
normalizePageLimit(page, limit, maxLimit?)  // → { page, limit, skip }
paginationMeta(page, limit, total)           // → { page, limit, total, totalPages }
```

### resolve-relation-filters.ts

Chuyển filter name → UUID bằng batch lookup trên entity. Config:

```typescript
const RELATION_FILTERS: RelationFiltersConfig = {
  categories: { model: "category", nameField: "name", softDelete: true },
}
```

### get-options.ts

`getOptionsFromModel(repo, baseWhere, column, config, search?, limit?)` → `Array<{label, value}>`

## Entity pattern

- **BaseEntity**: `@PrimaryKey({ autoincrement: true }) id!: number` — `int unsigned` auto_increment trên MySQL
- **Entity id trên HTTP**: route/header vẫn là chuỗi; parse bằng `parseEntityId` / `toEntityId` trong `common/entity-id.ts`
- **Table name**: `@Entity({ tableName: 'snake_case' })`
- **Timestamps**: `@Property({ onCreate: () => new Date() })`, `@Property({ onCreate, onUpdate })`
- **Soft delete**: `@Property({ nullable: true }) deletedAt?: Date | null`
- **Relations**: `@ManyToOne(() => Entity, { fieldName: 'fk_column' })`, `@OneToMany(() => Entity, (e) => e.parent)`
- **JSON column**: `@Property({ type: 'json' })`

## Module pattern

```typescript
@Module({
  imports: [NotificationsModule],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
```

## Constants

- `APP_HEADERS.USER_ID = 'x-user-id'`
- `ADMIN_ROUTES.POSTS = 'admin/posts'` (không hardcode string trong controller)
- `RESOURCES.POSTS`, `ACTIONS.CREATE` — dùng trong activity logging metadata
