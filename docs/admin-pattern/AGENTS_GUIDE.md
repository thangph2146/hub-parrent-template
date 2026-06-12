# Hướng dẫn cho AI / agent (hub-parent-template)

Tài liệu này giúp **hiểu nhanh hệ thống**, **sửa đúng chỗ**, **chạy kiểm tra**, và **lặp lại cho đến khi sạch lỗi**.

Tài liệu tổng quan kiến trúc microservice: `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`.

## 1. Đọc theo thứ tự (bản đồ trước, chi tiết sau)

| Thứ tự | Nội dung                                                                 | Mục đích                                            |
| ------ | ------------------------------------------------------------------------ | --------------------------------------------------- |
| 1      | `apps/hub-parent/hub-parent-frontend/.graphify/markdown/SUMMARY_FOR_AI.md` | Storefront Next, route, import                      |
| 1b     | `docs/admin-pattern/FRONTEND_UX.md`                                      | Token màu / UX / a11y storefront (khi sửa UI)       |
| 1c     | `docs/admin-pattern/ADMIN_PAGE_PATTERN.md`                               | Pattern admin page (khi sửa `apps/main/backend`)    |
| 2      | `apps/main/backend/.graphify/markdown/SUMMARY_FOR_AI.md`                 | Admin Next                                          |
| 3      | `apps/main/api/.graphify/markdown/SUMMARY_FOR_AI.md`                     | Nest API: module, controller, entity (**MikroORM**) |
| 4      | `packages/eslint-config/service-boundaries.js`       | Ranh giới import giữa service                       |
| 5      | Source cụ thể (`*.ts`, `*.tsx`)                      | Chỉ mở khi đã biết file/module liên quan            |

**Tránh** đọc toàn bộ `context.json` (rất dài, nhúng full source). Chỉ tra theo path khi cần đoạn code.

## 2. Sau khi chỉnh sửa code — lệnh bắt buộc

Từ **thư mục gốc repo**:

```bash
pnpm check
```

Gồm: `verify:bounds` (package.json) + `lint` + `typecheck`.

Nếu đổi **cấu trúc file/route/module** nhiều và đã cập nhật `apps/*/.graphify/snapshot/context.json`:

```bash
pnpm graphify:ai-summary
```

Làm mới snapshot Graphify (sau đổi route/module/cây file):

```bash
pnpm graphify:refresh
# = pnpm graphify:update && pnpm graphify:ai-summary
```

Hoặc gộp kiểm tra + làm mới bản tóm tắt Markdown cho AI:

```bash
pnpm check:full
```

(`check:full` không chạy `graphify-update` — nếu chưa refresh snapshot, chạy `pnpm graphify:refresh` trước.)

## 3. Pattern bắt buộc khi sửa code

| Chủ đề                   | Đọc / dùng                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| Admin page CRUD          | `ADMIN_PAGE_PATTERN.md` + `useAdminMutation` (`@workspace/ui`)    |
| Toast mutation + socket  | `docs/api-client-pattern/REALTIME.md`, `toast-coordinator.ts`     |
| API + client contract    | `docs/api-pattern/README.md`, `docs/api-client-pattern/README.md` |
| Import/backup data admin | `apps/main/backend/src/app/data/_component/`, `system.service.ts` (main) / `BaseSystemAdminService` (check-in) |

## 4. Vòng chuẩn hóa (kết thúc task lớn)

1. `pnpm check`
2. Nếu đổi kiến trúc: `pnpm graphify:refresh`
3. Đối chiếu `.graphify/README.md` checklist
4. Skill tự động: `.cursor/skills/hub-graphify-standardize-loop/SKILL.md`
