# Deploy line — `@workspace/api-server`

Materialize API check-in: `apps/main/api` → `deploy/nest` → `apps/hub-event/api`.

## Cấu trúc chuẩn

```
deploy/
├── config/                 # registry, render, product-lines
├── template-common/        # 14 file infra Nest
├── cli/
│   ├── lib/monorepo-root.cjs
│   ├── sync-template.cjs      # main → deploy/nest
│   ├── render.cjs             # deploy/nest → app + menu TTY
│   ├── render-prompts.cjs     # @clack/prompts
│   ├── scaffold-api-app-config.cjs
│   ├── ensure-app-env.cjs     # tạo .env
│   ├── dev/                   # script audit (không CI)
│   └── verify/
└── nest/                   # template AUTO sync (~48 module)
```

**Contract tests:** `pnpm api:sync-template` vend spec vào nest:

| Vị trí sau sync | Nguồn | Chạy test |
|-----------------|-------|-----------|
| `deploy/nest/src/common/**/*.spec.ts` | `packages/api-server/src` | `pnpm --filter @workspace/api-server run test:nest-contract` |
| `deploy/nest/src/data-test/**/*.spec.ts` | pkg + fixture gzip | (cùng lệnh trên) |
| `deploy/nest/src/<module>/*.service.spec.ts` | `apps/main/api` (45 file) | `pnpm --filter @workspace/api-server run test:nest-module-specs` (tham chiếu) |

Logic CRUD thật nằm ở `src/common/module-bases/` — spec module mirror từ main có thể fail trên binding mỏng; dùng để đối chiếu contract khi dev.

Script nội bộ (sync/prune/render pipeline) nằm trong `cli/lib/{sync,prune,render}/` — không gọi trực tiếp.

## Lệnh

```bash
pnpm api:render
pnpm api:sync-template
pnpm verify:api-template
pnpm api:render apps/hub-event/api --prune
```

Chi tiết CLI: [`cli/README.md`](cli/README.md).
