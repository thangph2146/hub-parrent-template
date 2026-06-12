# `@workspace/api-server`

Shared NestJS service package cung cấp chức năng dùng chung (CRUD, types,
helpers) cho mọi NestJS API service trong monorepo (`apps/*/api`,
`apps/*/hub-event/api`, ...). Pattern bám sát cấu trúc thư mục của
`apps/main/api/` - mỗi entity có folder riêng với `service`/`controller`/
`module` chuẩn NestJS, nhưng được abstract hóa để tái sử dụng triệt để.

## Cấu trúc thư mục

```
packages/api-server/
├── package.json                        # @workspace/api-server
├── tsconfig.json                       # extends @workspace/typescript-config
├── jest.config.js                      # Jest config
├── README.md                           # File này
└── src/
    ├── index.ts                        # Barrel export chính
    ├── bases/                          # Abstract base classes
    │   ├── base-service.class.ts       # BaseService (generic, cũ)
    │   ├── base-controller.class.ts    # BaseController (generic, cũ)
    │   ├── base-crud.service.ts        # BaseCrudService (generic CRUD)
    │   ├── base-crud.controller.ts     # BaseCrudController (generic HTTP)
    │   └── crud-factory.ts             # createCrudModule / createCrudService
    ├── interfaces/                     # Service / Controller interfaces
    │   ├── base-service.interface.ts
    │   ├── user-service.interface.ts
    │   └── index.ts
    ├── types/                          # TypeScript types
    │   ├── common.types.ts             # BaseEntity, PaginationInput, ...
    │   ├── user.types.ts               # UserRowDto, ListUsersParams, ...
    │   ├── crud.types.ts               # CrudRowDto, BulkOperationResult, ...
    │   └── index.ts
    ├── utils/                          # Pure utility functions
    │   ├── entity-id.ts                # toEntityId / toEntityIdList
    │   ├── pagination.ts               # Pagination helpers
    │   ├── date-utils.ts               # Date formatting
    │   └── *.spec.ts                   # Unit tests cho utilities
    ├── data-test/                      # Test fixtures (chỉ dùng trong test)
    │   ├── fixture.ts                  # Loader cho hub-system-export JSON
    │   ├── fixture.spec.ts             # Unit test cho fixture
    │   ├── fake-em.ts                  # In-memory EntityManager (test)
    │   ├── fake-em.spec.ts             # Unit test cho fake-em
    │   └── hub-system-export-2026-06-11.json  # Production fixture (47MB)
    └── modules/                        # Mỗi entity = 1 folder (47 folders)
        ├── users/                      # Rich module (logic riêng: roles, password, dev login)
        │   ├── users.service.ts        # BaseUsersService extends BaseCrudService
        │   ├── users.controller.ts     # BaseUsersController extends BaseCrudController
        │   ├── users.module.ts         # BaseUsersModule (NestJS module)
        │   ├── users.types.ts          # UserRowDto, ListUsersParams, ...
        │   ├── users.mapper.ts         # Entity <-> DTO mapping
        │   ├── users.service.spec.ts   # Unit tests (mock EM)
        │   ├── users.mapper.spec.ts    # Mapper unit tests
        │   └── users.integration.spec.ts  # Integration tests (real fixture)
        ├── posts/                      # Rich module
        ├── comments/                   # Rich module
        ├── categories/                 # Rich module
        ├── accounts/                   # CRUD scaffold với concrete DTOs
        │   ├── account.service.ts      # BaseAccountsService + AccountRowDto (concrete fields)
        │   ├── account.controller.ts   # BaseAccountsController
        │   ├── accounts.module.ts      # BaseAccountsModule
        │   ├── account.service.spec.ts # Unit tests
        │   └── index.ts                # Barrel export
        ├── academic-years/             # CRUD scaffold
        ├── cameras/                    # CRUD scaffold
        ├── events/                     # CRUD scaffold
        ├── products/                   # CRUD scaffold
        ├── orders/                     # CRUD scaffold
        ├── notifications/              # CRUD scaffold
        ├── roles/                      # CRUD scaffold
        ├── settings/                   # CRUD scaffold
        ├── ...                         # 47 modules tổng cộng
        └── index.ts                    # Barrel export cho tất cả
```

## Quy ước đặt tên

Pattern bám sát 100% `apps/main/api/src/<entity>/`:

| Item | Convention | Ví dụ |
| ---- | ---------- | ----- |
| Folder | kebab-case số nhiều (plural) | `accounts/`, `event-checkins/` |
| Service class | `Base{Entity}sService` (PascalCase, **số nhiều**) | `BaseAccountsService` |
| Controller class | `Base{Entity}sController` (số nhiều) | `BaseAccountsController` |
| Module class | `Base{Entity}sModule` (số nhiều) | `BaseAccountsModule` |
| Service file | Singular kebab-case | `account.service.ts` |
| Controller file | Singular kebab-case | `account.controller.ts` |
| Module file | Plural kebab-case | `accounts.module.ts` |
| Index | `index.ts` | barrel export |
| DTOs | `{Entity}sRowDto`, `{Entity}sCreateData`, `{Entity}sUpdateData` | `AccountsRowDto` |
| Service contract | `I{Entity}sControllerService` | `IAccountsControllerService` |

**Lưu ý**: Service/Controller/Module class dùng số nhiều, entity class (trong
`apps/main/api/src/entities/`) dùng số ít - khớp với convention NestJS chuẩn.

## Mapping: 47 entities ↔ 47 modules

| # | Entity (singular) | Module (plural) | Loại |
| - | ----------------- | --------------- | ---- |
| 1 | AcademicYear | academic-years | scaffold |
| 2 | Account | accounts | scaffold |
| 3 | AdmissionResult | admission-results | scaffold |
| 4 | Camera | cameras | scaffold |
| 5 | Category | categories | rich |
| 6 | Comment | comments | rich |
| 7 | ContactRequest | contact-requests | scaffold |
| 8 | Course | courses | scaffold |
| 9 | CustomerCart | customer-carts | scaffold |
| 10 | Department | departments | scaffold |
| 11 | Event | events | scaffold |
| 12 | EventCheckin | event-checkins | scaffold |
| 13 | EventRegistration | event-registrations | scaffold |
| 14 | EventSpeaker | event-speakers | scaffold |
| 15 | FaceData | face-data | scaffold |
| 16 | Group | groups | scaffold |
| 17 | GroupMember | group-members | scaffold |
| 18 | ImportedUser | imported-users | scaffold |
| 19 | Location | locations | scaffold |
| 20 | Major | majors | scaffold |
| 21 | Message | messages | scaffold |
| 22 | MessageRead | message-reads | scaffold |
| 23 | Notification | notifications | scaffold |
| 24 | Order | orders | scaffold |
| 25 | PageContent | page-contents | scaffold |
| 26 | ParentStudent | parent-students | scaffold |
| 27 | Post | posts | rich |
| 28 | PostCategory | post-categories | scaffold |
| 29 | PostTag | post-tags | scaffold |
| 30 | Product | products | scaffold |
| 31 | PromoCode | promo-codes | scaffold |
| 32 | Role | roles | scaffold |
| 33 | Screen | screens | scaffold |
| 34 | SeoMeta | seo-metas | scaffold |
| 35 | Session | sessions | scaffold |
| 36 | Setting | settings | scaffold |
| 37 | Speaker | speakers | scaffold |
| 38 | StorageFile | storage-files | scaffold |
| 39 | Student | students | scaffold |
| 40 | Tag | tags | scaffold |
| 41 | Template | templates | scaffold |
| 42 | TrainingLevel | training-levels | scaffold |
| 43 | TrainingSystem | training-systems | scaffold |
| 44 | User | users | rich |
| 45 | UserRole | user-roles | scaffold |
| 46 | VerificationToken | verification-tokens | scaffold |

**4 rich modules** có logic riêng: `users`, `posts`, `comments`, `categories` (logic từ `apps/main/api/src/<entity>/` được tích hợp sẵn).
**42 scaffold modules** tự động generate DTOs từ entity fields. Subclass chỉ cần override `getEntity()` để integrate với concrete entity.

## Quick start - Tích hợp vào app

Trong app, tạo concrete class inject `EntityManager` từ Nest:

```typescript
// apps/main/api/src/accounts/accounts.service.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseAccountsService } from '@workspace/api-server/modules/accounts';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountsService extends BaseAccountsService {
  constructor(private readonly em: EntityManager) {
    super();
  }
  protected getEm() { return this.em; }
  protected getEntity() { return Account; }
}
```

Trong `accounts.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { BaseAccountsModule } from '@workspace/api-server/modules/accounts';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [BaseAccountsModule.forRoot()],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
```

## Endpoints được cung cấp sẵn

`BaseCrudController` cung cấp sẵn 8 routes CRUD chuẩn:

| Method | Path | Mô tả |
| ------ | ---- | ----- |
| `GET`    | `/<path>`            | List entities (pagination + search + filter) |
| `GET`    | `/<path>/:id`        | Get entity by id |
| `POST`   | `/<path>`            | Create entity |
| `PUT`    | `/<path>/:id`        | Update entity |
| `DELETE` | `/<path>/:id`        | Soft delete (set `deletedAt = now()`) |
| `POST`   | `/<path>/:id/restore` | Restore soft-deleted |
| `DELETE` | `/<path>/:id/hard`   | Hard delete (không thể restore) |
| `POST`   | `/<path>/bulk`       | Bulk action (`delete` / `restore` / `hard-delete` / `active` / `unactive`) |

Query parameters cho `GET /<path>`:
- `page` - Trang (mặc định 1)
- `limit` - Số bản ghi / trang (mặc định 10, max 1000)
- `search` - Tìm kiếm LIKE trên các field trong `getSearchFields()`
- `status` - `active` (mặc định) / `deleted` / `all`
- `<column>` - Filter exact match (vd `?isActive=true`)

## Tests

```bash
# Tất cả tests (unit + integration)
pnpm --filter @workspace/api-server test

# Test cụ thể
pnpm --filter @workspace/api-server test users
pnpm --filter @workspace/api-server test integration

# Coverage
pnpm --filter @workspace/api-server test:cov
```

Hiện có **254 tests / 27 suites**:
- `data-test/fixture.spec.ts` - Fixture loader
- `data-test/fake-em.spec.ts` - In-memory EntityManager
- `utils/*.spec.ts` - Pure utilities
- `modules/users/users.service.spec.ts` - User service (rich)
- `modules/users/users.mapper.spec.ts` - User mapper
- `modules/users/users.integration.spec.ts` - User với 47MB fixture thực
- `modules/posts/*.spec.ts` - Posts service
- `modules/comments/*.spec.ts` - Comments service
- `modules/categories/*.spec.ts` - Categories service
- `modules/<42 scaffolds>/*service.spec.ts` - 42 scaffold CRUD tests

### Test data

`src/data-test/hub-system-export-2026-06-11.json` - file JSON 47MB export
từ production database (10 users + 7 roles + 10 user_roles). Dùng làm
fixture cho integration test:

- `loadFixture()` - load file, cache
- `getUsers()` / `getRoles()` / `getUserRoles()` - accessors
- `findUserByEmail()` / `findUserById()` - lookups
- `getUserIdsForRole()` - users in role
- `createFakeEntityManager()` - in-memory EM simulation

### In-memory EntityManager

`createFakeEntityManager(fixture)` trả về object mô phỏng
`@mikro-orm/core.EntityManager` interface. Dùng trong test thay cho
real database. Hỗ trợ:

- `findOne(entity, filter, options)` - với `populate` support
- `find(entity, filter, options)` - với `populate`/`orderBy`/`offset`/`limit`
- `count(entity, filter)` - đếm bản ghi
- `persist(entity)` - lưu (cả id số và id CUID string)
- `flush()` - commit (no-op cho in-memory)
- `remove(entity)` - xóa
- `getReference(entity, id)` - trả về reference
- `nativeUpdate(entity, filter, update)` - update trực tiếp
- `nativeDelete(entity, filter)` - delete trực tiếp
- `__store` / `__commit` / `__reset` - helpers cho test

Filter hỗ trợ: `$in`, `$ne`, `$like`, `$or`, nested object (vd `{ role: { name: 'super_admin' } }`).

## Build & Lint

```bash
# Type-check (= pnpm lint)
pnpm --filter @workspace/api-server lint

# Build -> dist/
pnpm --filter @workspace/api-server build

# Watch tests
pnpm --filter @workspace/api-server test:watch
```

Build output ở `dist/`. Mỗi module có `.js` + `.d.ts` + sourcemaps.

## Pattern sử dụng

- **Pure CRUD (43/46 modules)**: Dùng `BaseCrudService` + `BaseCrudController` ngay, không cần custom logic.
- **Logic riêng (3 modules - `users`, `posts`, `comments`)**: Override các abstract methods:
  - `getEntity()` - trả về class entity
  - `getSearchFields()` / `getFilterableFields()` - whitelist fields
  - `beforeCreate()` / `beforeUpdate()` - hooks (vd hash password)
  - `validateCreate()` / `validateUpdate()` - validation
  - `mapRow()` - custom mapping entity → DTO

## Lưu ý quan trọng

- **Không import `apps/*` từ package này** - giữ boundaries theo workspace rules.
- **Subclass trong app** - Mỗi app tự tạo concrete service inject `EntityManager`.
- **`users` module có logic đặc biệt** - skip super_admin, hash password, dev login.
  Các module khác dùng CRUD thuần, subclass chỉ cần override `getEntity` etc.
- **Mở rộng entity** - Thêm file vào `apps/main/api/src/entities/`, sau đó tạo
  module mới trong `packages/api-server/src/modules/<entity>/` theo template
  (4 files: `<entity>.service.ts`, `<entity>.controller.ts`, `<entity>s.module.ts`, `index.ts`).
- **Regenerate scaffolds** - Dùng `node script-system/api-server/enrich-scaffolds.cjs` để
  tự động generate lại tất cả 43 module scaffolds từ entities hiện tại.
- **Plural vs Singular** - Folder và `*Module.ts` dùng plural (`accounts/`, `accounts.module.ts`).
  File service/controller/spec dùng singular (`account.service.ts`, `account.controller.ts`).
  Class names dùng plural (`BaseAccountsService`, `BaseAccountsController`).
