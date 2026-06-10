# Step 8: Architecture Maintenance and System Updates

Ðây là bu?c dành cho b?o trì ki?n trúc, c?p nh?t docs, và gi? h? th?ng s?ch lâu dài.

## M?c tiêu

- Duy trì ki?n trúc h? th?ng sau khi hoàn thành task.
- C?p nh?t tài li?u n?i b? khi h? th?ng thay d?i.
- Ki?m tra và gi? clean các ranh gi?i service.

## Nh?ng vi?c c?n làm

1. Ki?m tra l?i các thay d?i ki?n trúc sau khi merge:
   - route m?i
   - module m?i
   - package workspace m?i
   - thay d?i import boundaries
2. C?p nh?t `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` ho?c `docs/pages/README.md` n?u feature m?i c?n hu?ng d?n implementation thêm.
3. C?p nh?t `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` n?u ki?n trúc service dã thay d?i.
4. C?p nh?t `packages/eslint-config/service-boundaries.js` khi boundary rules c?n m? r?ng ho?c si?t ch?t.
5. N?u có thay d?i dependency workspace, ch?y `pnpm graphify:ai-summary`.

## Khi c?n b?o trì Graphify

- Sau khi thêm ho?c di chuy?n module/route: ch?y

```bash
node script-system/graphify-update.cjs apps/<app>
pnpm graphify:ai-summary
```

- N?u thêm package workspace: ch?y l?i `pnpm graphify:ai-summary`.
- N?u ch? s?a code n?i b? nh? không thay d?i module/route: `pnpm check` v?n d?.

## Ghi nh? thay d?i h? th?ng

- Ghi l?i trong PR ho?c commit message n?u:
  - d?i ranh gi?i `apps/*`
  - thêm package workspace m?i
  - thay d?i API contract
  - thêm route/public page m?i
- Khi task xong, c?p nh?t checklist h? th?ng nhu sau:
  - `pnpm check` pass
  - `pnpm check:full` pass n?u dã ch?y Graphify
  - docs liên quan dã du?c c?p nh?t
  - reviewer dã xác nh?n không sai boundary

## K?t lu?n

Step 8 là bu?c dành cho vi?c gi? nh?p h? th?ng sau khi thay d?i dã du?c th?c hi?n, d? duy trì tính s?ch, nh?t quán và d? d?c cho agent AI.
