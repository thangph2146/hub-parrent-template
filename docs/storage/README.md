# Lưu trữ file (upload + disk)

Nguồn sự thật code: `apps/main/api/src/uploads/` (`UploadsService`, `storage-upload-policy.ts`, `storage-media.ts`).

## Biến môi trường

| Biến | Mô tả |
|------|--------|
| `STORAGE_DIR` | Thư mục gốc trên disk (vd. `D:/HUB/data/main`) |
| `STORAGE_LEGACY_DIR` | (tuỳ chọn) Quét import file cũ ngoài `uploads/` |

Xem `.env.example` từng API (`ENV_TEMPLATE=api-*`).

## Cấu trúc disk chuẩn

```text
{STORAGE_DIR}/
├── uploads/
│   ├── images/          # Realm: images
│   │   ├── avatars/     # Avatar user
│   │   ├── posts/       # Ảnh bài viết
│   │   ├── events/      # Banner / check-in
│   │   ├── guides/      # Page content
│   │   ├── san-pham/    # Store catalog
│   │   └── admincp/     # Asset admin
│   ├── files/           # Realm: files (document + archive)
│   ├── videos/
│   └── audio/
└── cache/
    └── resized/         # Sharp — có thể xóa, tái tạo được
```

Metadata: bảng `storage_files` (MikroORM `StorageFile`). Disk là nơi chứa byte thật; DB giữ path, mime, owner.

## Khởi tạo thư mục disk

```bash
pnpm storage:init           # @api — đọc STORAGE_DIR từ apps/main/api/.env
pnpm storage:init:checkin   # hub-event
pnpm storage:init:store     # store-sync
node script-system/db/init-storage-dirs.cjs --dir D:/HUB/data/custom
```

Tạo đủ `uploads/images/*`, `uploads/files`, `cache/resized`, … — xem `script-system/lib/layout/storage-layout.cjs`.

## Realm & extension

| Realm | Nhãn | Nhóm extension |
|-------|------|----------------|
| `images` | Hình ảnh | jpg, png, webp, gif, svg, heic… |
| `files` | Tệp tin | pdf, docx, xlsx, csv, zip… |
| `videos` | Video | mp4, mov, webm… |
| `audio` | Âm thanh | mp3, wav |

Policy từng folder con: file `.storage-policy.json` (slug path ASCII, nhãn tiếng Việt trong `label`).

## Quy ước đặt tên

- Upload ảnh: `{ownerId}_{slug}_{timestamp}.{ext}` (`upload-filename.ts`)
- Folder tab: slug ASCII (`san-pham`, `avatars`); nhãn UI trong policy hoặc `STORAGE_TAB_LABELS` (`storage-media.ts`)

## Export / seed JSON (không phải upload)

Export hệ thống (admin import/export) và file seed DB đặt tại [`data/`](../../data/README.md) — **không** commit vào `apps/*/api/src/`.

## Root mỗi API app (gọn)

| Thư mục / file | Vai trò |
|----------------|---------|
| `src/` | Source Nest |
| `.pipeline/` | Artifact pipeline (`PACKAGE_MODULE_TEMPLATES.meta.json`) — commit **main** + **nest** |
| `scripts/` | Chỉ `apps/main/api` (seed, demo) |

Không để ở root API: `full-export-*.json`, `MODULE_*_AUDIT.md`, `tsc-errors.txt`, meta JSON lẻ. Kiểm tra: `pnpm verify:data-layout`.

## Liên quan

- [`docs/env/README.md`](../env/README.md) — stack `.env`
- [`data/README.md`](../../data/README.md) — `data/seed`, `data/exports`
