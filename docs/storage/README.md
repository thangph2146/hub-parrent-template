# Lưu trữ file (upload + disk)

Pattern dùng chung — implementation trong `packages/api-server/deploy/nest` (UploadsService, storage policy).

**Runtime** (`STORAGE_DIR`, init thư mục disk, `.env`) thuộc downstream product app sau `api:render`.

## Biến môi trường (downstream)

| Biến | Mô tả |
|------|--------|
| `STORAGE_DIR` | Thư mục gốc trên disk |
| `STORAGE_LEGACY_DIR` | (tuỳ chọn) Quét import file cũ |

Mẫu: `packages/api-server/deploy/nest/.env.example` (copy vào app API product).

## Cấu trúc disk chuẩn

```text
{STORAGE_DIR}/
├── uploads/
│   ├── images/
│   ├── files/
│   ├── videos/
│   └── audio/
└── cache/
    └── resized/
```

Metadata: bảng `storage_files`. Disk chứa byte; DB giữ path, mime, owner.

## Realm & extension

| Realm | Nhãn | Nhóm extension |
|-------|------|----------------|
| `images` | Hình ảnh | jpg, png, webp, gif, svg, heic… |
| `files` | Tệp tin | pdf, docx, xlsx, csv, zip… |
| `videos` | Video | mp4, mov, webm… |
| `audio` | Âm thanh | mp3, wav |

## Export / seed JSON

Export hệ thống và seed DB đặt tại `data/` trong **downstream repo** — không commit vào `apps/*/api/src/`.

## Liên quan

- `packages/api-server/README.md` — render API, uploads module
- Downstream product — script `storage:init`, verify data layout
