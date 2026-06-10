# Step 7: Review, PR, and System Memory

Ðây là bu?c cu?i cùng: review thay d?i, chu?n b? PR, và ghi nh? tr?ng thái h? th?ng.

## M?c tiêu

- Ð?m b?o code m?i tuân th? quy trình t? step 1–6.
- Vi?t PR rõ ràng và ghi nh? các thay d?i h? th?ng.
- Ð?m b?o reviewer có d? context d? dánh giá.

## Checklist review

1. Ð?c l?i các bu?c dã th?c hi?n ? `docs/steps/step1...step6`.
2. Xác nh?n các file thay d?i phù h?p scope.
3. Ki?m tra:
   - không import chéo gi?a `apps/*`
   - API g?i qua HTTP / `@workspace/api-client`
   - shared logic n?m trong `packages/*` n?u c?n
4. Ch?y l?i `pnpm check`.
5. N?u có thay d?i c?u trúc l?n, xác nh?n `pnpm check:full` pass.

## Ghi nh? h? th?ng hi?n t?i

- Ghi note các module m?i, route m?i, ho?c API m?i.
- Ghi note n?u thay d?i dã ?nh hu?ng d?n `apps/frontend`, `apps/backend`, `apps/api`, ho?c `packages/*`.
- Ghi note n?u c?n c?p nh?t docs feature trong `docs/pages/`.

## Vi?t PR

1. Tiêu d? ng?n g?n và rõ ràng.
2. Mô t?:
   - M?c tiêu c?a thay d?i.
   - Scope: app/package/module ?nh hu?ng.
   - Các bu?c test dã ch?y.
3. Danh sách file chính dã thay d?i.
4. N?u c?n, d? xu?t reviewer chuyên môn cho `apps/api`, `apps/backend`, `apps/frontend`, ho?c `packages/*`.

## Ghi nh? h? th?ng cho reviewer

- N?u task là feature m?i: tr? t?i `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` và `docs/pages/README.md`.
- N?u task là thay d?i ki?n trúc: tr? t?i `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`.
- N?u task là thay d?i boundary: tr? t?i `packages/eslint-config/service-boundaries.js` và `script-system/verify-service-boundaries.mjs`.

## Hoàn thành bu?c này

- PR dã s?n sàng v?i context rõ ràng.
- Không còn l?i `pnpm check`.
- N?u c?n, dã ch?y `pnpm check:full`.
- Tài li?u n?i b?/guide du?c c?p nh?t n?u thay d?i h? th?ng có tính ch?t tái s? d?ng.
