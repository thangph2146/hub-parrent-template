# Step 6: Code Execution and Change Tracking

Đây là bước thực thi thay đổi code và ghi nhớ các thay đổi của hệ thống hiện tại.

## Mục tiêu

- Kiểm tra thay đổi code bằng các công cụ chuẩn.
- Ghi lại các file đã thay đổi và scope ảnh hưởng.
- Cập nhật Graphify nếu cần.

## Trước khi thực thi

1. Xác nhận scope thay đổi: app trong `apps/*` (dev: `apps/main/*`) hoặc `packages/*`.
2. Thống kê file thay đổi chính bằng `git status --short`.
3. Ghi lại các điểm thay đổi quan trọng:
   - module mới / route mới
   - import mới giữa service
   - package workspace mới

## Các lệnh kiểm tra

1. Chạy từ root repo:

```bash
pnpm check
```

2. Nếu thay đổi cấu trúc module/route đáng kể, chạy:

```bash
node script-system/graphify/graphify-update.cjs apps/<duong-dan-app>
pnpm graphify:ai-summary
pnpm check:full
```

3. Nếu chỉ thay đổi package workspace hoặc docs, `pnpm check` vẫn là tối thiểu.

## Ghi nhớ thay đổi

- Nếu thay đổi liên quan API Nest (`apps/main/api` hoặc `packages/api-server`), kiểm tra import mới có vi phạm boundary không.
- Nếu thay đổi Next app (admin/storefront), xác nhận API vẫn gọi qua `@workspace/api-client`.
- Nếu thêm package hoặc share logic, ghi chú `packages/*` và chạy `pnpm graphify:ai-summary` nếu cần.

## Nếu kiểm tra không pass

1. Đọc lại output `pnpm check`.
2. Chia lỗi theo nhóm:
   - `verify:bounds` → boundary/import sai (`package.json` workspace)
   - `verify:sdk-http` → app Next gọi `api.http` thay vì resource SDK
   - `lint` → style/import/cấu trúc
   - `typecheck` → kiểu dữ liệu
3. Sửa theo nhóm lỗi, rồi chạy lại `pnpm check`.

## Nếu cần cập nhật docs

- Nếu thay đổi cấu trúc hoặc feature mới: cập nhật `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` hoặc `docs/pages/README.md` hoặc `docs/steps/*.md` tương ứng.
- Nếu thay đổi ranh giới service: cập nhật `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` hoặc `packages/eslint-config/service-boundaries.js`.
- Giữ tiếng Việt UTF-8; không tạo file markdown rời ngoài `docs/` trừ khi có lý do trong `AGENTS.md` mục 4.

## Kết luận bước này

- `pnpm check` pass.
- Nếu cần, `pnpm check:full` pass.
- Giữ note thay đổi rõ ràng và theo scope.

## Push code và cập nhật branch deploy

Sau khi kiểm tra pass, đẩy code lên remote và đồng bộ branch deploy (`hub-event`, `hub-parent`):

```bash
pnpm push -- "feat: mô tả thay đổi ngắn"
```

Lệnh này (trên branch **`main`**):

1. `git add -A` + `git commit` nếu còn thay đổi local (bắt buộc có message).
2. `pnpm pull:checkin` — sync API subset + admin check-in.
3. `pnpm pull:parent` — sync API full → hub-parent.
4. Commit sync nếu có diff (`chore(sync): ...`).
5. Push **`main`** + cập nhật branch **`hub-event`**, **`hub-parent`**.

| Lệnh | Khi nào |
|------|---------|
| `pnpm push -- "..."` | Chuẩn — commit (nếu cần) + sync + push 3 branch |
| `pnpm push:deploy` | Đã commit sẵn — chỉ sync + push branch |
| `pnpm push -- --skip-sync "..."` | Push không chạy sync |
| `pnpm push -- --dry-run "..."` | Xem trước |

**CI:** push `main` thường cũng kích hoạt `.github/workflows/deploy-branches.yml` (sync + branch deploy).

**Server deploy:** `git pull origin hub-event` hoặc `git pull origin hub-parent` — chi tiết `docs/MONOREPO_STRUCTURE.md`.
