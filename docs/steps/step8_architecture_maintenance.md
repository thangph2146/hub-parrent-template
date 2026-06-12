# Step 8: Architecture Maintenance and System Updates

Đây là bước dành cho bảo trì kiến trúc, cập nhật docs, và giữ hệ thống sạch lâu dài.

## Mục tiêu

- Duy trì kiến trúc hệ thống sau khi hoàn thành task.
- Cập nhật tài liệu nội bộ khi hệ thống thay đổi.
- Kiểm tra và giữ clean các ranh giới service.

## Những việc cần làm

1. Kiểm tra lại các thay đổi kiến trúc sau khi merge: route/module/package/boundary mới.
2. Cập nhật `ADMIN_PAGE_PATTERN.md` hoặc `docs/pages/README.md` nếu feature mới cần hướng dẫn.
3. Cập nhật `MICROSERVICE_SYSTEM_MAP.md` nếu kiến trúc service đã thay đổi.
4. Cập nhật `service-boundaries.js` khi boundary rules cần mở rộng hoặc siết chặt.
5. Nếu có thay đổi dependency workspace, chạy `pnpm graphify:ai-summary`.
6. Docs agent: giữ **tiếng Việt UTF-8**; cập nhật `AGENTS.md` / `docs/README.md` khi thêm product line hoặc lệnh mới.

## Khi cần bảo trì Graphify

```bash
node script-system/graphify/graphify-update.cjs apps/<duong-dan-app>
pnpm graphify:ai-summary
```

Nếu chỉ sửa code nội bộ nhỏ: `pnpm check` vẫn đủ.

## Ghi nhớ thay đổi hệ thống

Ghi trong PR/commit nếu đổi ranh giới `apps/*`, thêm package, đổi API contract, hoặc route public mới.

Checklist hoàn thành: `pnpm check` pass; `pnpm check:full` nếu đã chạy Graphify; docs liên quan đã cập nhật.

## Kết luận

Step 8 giúp giữ hệ thống nhất quán sau thay đổi, dễ đọc cho agent và dev tiếp theo.
