# Step 7: Review, PR, and System Memory

Đây là bước cuối: review thay đổi, chuẩn bị PR, và ghi nhớ trạng thái hệ thống.

## Mục tiêu

- Đảm bảo code mới tuân thủ quy trình từ step 1–6.
- Viết PR rõ ràng và ghi nhớ các thay đổi hệ thống.
- Đảm bảo reviewer có đủ context để đánh giá.

## Checklist review

1. Đọc lại các bước đã thực hiện ở `docs/steps/step1`…`step6`.
2. Xác nhận các file thay đổi phù hợp scope.
3. Kiểm tra:
   - không import chéo giữa `apps/*`
   - API gọi qua `@workspace/api-client`
   - shared logic nằm trong `packages/*` nếu cần
4. Chạy lại `pnpm check`.
5. Nếu có thay đổi cấu trúc lớn, xác nhận `pnpm check:full` pass.

## Ghi nhớ hệ thống hiện tại

- Ghi note các module mới, route mới, hoặc API mới.
- Ghi note nếu thay đổi đã ảnh hưởng đến app trong `apps/*` hoặc `packages/*` (nêu rõ đường dẫn thật, ví dụ `apps/main/backend`).
- Ghi note nếu cần cập nhật docs feature trong `docs/pages/`.

## Viết PR

1. Tiêu đề ngắn gọn và rõ ràng.
2. Mô tả:
   - Mục tiêu của thay đổi.
   - Scope: app/package/module ảnh hưởng.
   - Các bước test đã chạy.
3. Danh sách file chính đã thay đổi.
4. Nếu cần, đề xuất reviewer chuyên môn theo layer: API, admin, storefront, hoặc `packages/*`.

## Ghi nhớ hệ thống cho reviewer

- Feature mới: `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` + `docs/pages/README.md`.
- Thay đổi kiến trúc: `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`.
- Thay đổi boundary: `packages/eslint-config/service-boundaries.js` + `packages/eslint-config/verify/service-boundaries.cjs`.

## Hoàn thành bước này

- PR sẵn sàng với context rõ ràng.
- Không còn lỗi `pnpm check`.
- Nếu cần, đã chạy `pnpm check:full`.
- Tài liệu nội bộ được cập nhật nếu thay đổi có tính tái sử dụng.
