# Lib (`script-system/lib/`)

Module dùng chung — **luôn** `require("../lib/monorepo-root.cjs")` cho `ROOT` / `SCRIPT_SYSTEM`.

## Cấu trúc

```
lib/
├── monorepo-root.cjs       # Entry chuẩn — ROOT, PRODUCT_LINES, …
├── monorepo-apps.cjs       # Registry product line
├── run-step.cjs            # runStep() orchestrator
├── api-server-cli.cjs      # Đường dẫn packages/api-server/deploy/cli
├── admin-app-config-path.cjs
├── import-alias-rules.cjs  # @ui / workspace imports (verify:imports)
└── layout/                 # Đường dẫn disk / data / pipeline
    ├── data-paths.cjs      # data/seed, data/exports
    ├── storage-layout.cjs  # STORAGE_DIR/uploads/*
    └── pipeline-paths.cjs  # apps/*/api/.pipeline/
```

## Quy ước import

| Nhu cầu | Import |
|---------|--------|
| ROOT, product lines | `monorepo-root.cjs` |
| data/seed, verify layout | `layout/data-paths.cjs` |
| STORAGE_DIR subdirs | `layout/storage-layout.cjs` |
| `.pipeline/` meta | `layout/pipeline-paths.cjs` |
| API deploy CLI | `api-server-cli.cjs` |

Không dùng `paths.cjs` (đã bỏ) — không tự `path.resolve(__dirname, '../../..')`.
