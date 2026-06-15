# Dữ liệu ngoài source (`data/`)

Thư mục này gom **file runtime / seed / backup** — **không** đặt trong `apps/*/api/src/`.

| Thư mục | Mục đích | Commit git |
|---------|----------|------------|
| `seed/` | Export JSON phục vụ seed DB (`pnpm db:demo`, `seed-full-export`) | Chỉ `.gitkeep`; file `.json` lớn **gitignore** |
| `exports/` | Export tải từ admin `/admin/data`, import reference, backup | Gitignore |
| `local/` | Scratch dev (import thử, export tạm) | Gitignore |

Import reference (verify admin `/data`): `data/exports/import-reference-*.json` — env `SYSTEM_IMPORT_REFERENCE_FILE`.

## Seed export

Copy **một bản** export vào `data/seed/` (vd. `full-export-2026-05-14.json`).

```bash
# Tuỳ chọn — ghi đè file mặc định
SEED_EXPORT_PATH=data/seed/full-export-2026-06-10.json
CHECKIN_DEMO_POSTS_EXPORT=data/seed/full-export-2026-06-10.json
```

Thứ tự tìm file (API seed): biến môi trường → `data/seed/full-export-*.json` → legacy `apps/*/api/src/` (cảnh báo).

## Upload media (disk)

File upload user/admin **không** nằm trong repo. Cấu hình qua `STORAGE_DIR` — xem [`docs/storage/README.md`](../docs/storage/README.md).

## Production server

```text
/HUB/data/{main|hub-event|store}/
├── uploads/
└── cache/
```

Tách hẳn `source/` (git clone) và `data/` (STORAGE_DIR + backup).
