# `@workspace/api-server`

NestJS library + pipeline deploy API check-in.

## Cấu trúc package (chuẩn)

```
packages/api-server/
├── src/
│   ├── modules/          # 42 Base* thin — source of truth cho module-bases
│   ├── common/           # Helper portable (entity-id, pagination, …)
│   ├── bases/            # BaseCrud* — vend → deploy/nest/src/common/crud/
│   ├── types/            # DTO → deploy/nest/src/common/module-types/
│   ├── config/           # Constants/permissions (pkg export)
│   ├── data-test/        # Fake EM + fixture gzip (~29MB) cho unit test pkg
│   │   └── fixtures/     # hub-system-export-*.json.gz (bỏ .json thuần — xem .gitignore)
│   └── utils/            # Re-export backward-compat → common/
├── deploy/               # Xem deploy/README.md
│   ├── template-common/  # Infra chỉ cho template (không nằm trong src/)
│   ├── config/
│   ├── cli/
│   └── nest/             # Template render (AUTO sync)
└── package.json
```

**Không có trong pkg `src/modules`:** mirror module (`public`, `uploads`, `hanet`, …) — logic ở `apps/main/api`.

**Không commit:** `src/modules/**/*.spec.ts` (test CRUD trên `apps/main/api`).

**Meta sync (có chủ đích):** `deploy/nest/TEMPLATE.meta.json`, `.pipeline/PACKAGE_MODULE_TEMPLATES.meta.json` — output pipeline, không trùng `deploy/config/*.cjs`.

**Đã bỏ:** thư mục `tooling/` (script sinh spec cũ — test CRUD nằm ở `apps/main/api`).

**Fixture test:** commit `src/data-test/fixtures/hub-system-export-*.json.gz` (~29MB). Tạo lại:

```bash
node packages/api-server/deploy/cli/dev/gzip-test-fixture.cjs path/to/export.json
```

File `.json` thuần bị `.gitignore` trong `fixtures/`.

## Luồng deploy

```
src/modules ──sync-module-bases──► deploy/nest/src/common/module-bases/
src/common  ──sync-common──────────► deploy/nest/src/common/ (+ template-common)
src/bases   ──sync-crud────────────► deploy/nest/src/common/crud/
apps/main/api ──sync-template──────► deploy/nest/src/<module>/ (binding + mirror)
deploy/nest ──api:render───────────► apps/hub-checkin/api
```

## Lệnh

```bash
pnpm api:sync-template
pnpm verify:api-template
pnpm api:render                              # Tương tác: repo → module → render + .env
pnpm api:render apps/hub-checkin/api --prune # Render full check-in
pnpm --filter @workspace/api-server test
pnpm --filter @workspace/api-server run test:nest-contract   # common + data-test trên nest
pnpm --filter @workspace/api-server run test:nest-module-specs  # *.service.spec.ts từng module (mirror main)
pnpm --filter @workspace/api-server run prune:module-specs
```

Chi tiết deploy: [`deploy/README.md`](deploy/README.md).
