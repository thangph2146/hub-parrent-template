# Product-Line Package Subset

Tài liệu này mô tả pha tách package vật lý sau khi profile-based render đã ổn định. Không xóa package ngay trong pha hiện tại; `packages.required` trong `product-line-profiles.cjs` trước mắt chỉ là hợp đồng verify và chuẩn bị cho generator.

## Điều Kiện Bắt Đầu

- `pnpm --filter @workspace/api-server run render -- --line=<line>` chạy ổn cho `hub-parent`, `hub-checkin`, `store-sync`.
- `pnpm --filter @workspace/api-server run verify:api-profile -- <line>` pass sau render.
- RBAC catalog của từng app chỉ chứa resource trong profile.
- Admin menu không trỏ tới module hoặc href bị profile loại.
- Không còn import runtime từ package ngoài `packages.required` của line.

## Luồng Đề Xuất

1. Dùng `packages.required` làm allow-list logic, chưa prune thư mục vật lý.
2. Thêm verify import graph: mỗi app chỉ được import package nằm trong allow-list hoặc dependency transitive đã khai báo.
3. Sinh báo cáo package thừa theo line, ví dụ `script-system/verify/verify-package-subset.cjs --line=hub-parent --report`.
4. Khi báo cáo ổn định qua nhiều lần sync, thêm chế độ dry-run cho `pull:template` để hiển thị package sẽ được giữ/xóa.
5. Chỉ bật prune thật bằng flag rõ ràng như `--prune-packages`; mặc định vẫn giữ full `packages/`.

## Quy Tắc An Toàn

- Không prune package có export public đang được downstream app hoặc package required khác import.
- Không prune package chứa migration, seed, env profile hoặc script vận hành được dùng bởi line.
- Package shared như `ui`, `api-client`, `query-client`, `logger`, `site-config` phải được xử lý theo dependency graph, không chỉ theo tên trực tiếp.
- Khi prune thật, generator phải cập nhật workspace manifest và lockfile bằng package manager, không sửa chuỗi thủ công.

## Kết Quả Mong Muốn

Downstream vẫn đồng bộ được từ template bằng `pnpm sync`, nhưng mỗi product line có thể tiến tới workspace nhỏ hơn, ít dependency hơn, và không kéo UI/API package không thuộc hệ thống đó.
