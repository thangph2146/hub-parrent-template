# Step 6: Code Execution and Change Tracking

Ðây là bu?c th?c thi thay d?i code và ghi nh? các thay d?i c?a h? th?ng hi?n t?i.

## M?c tiêu

- Ki?m tra thay d?i code b?ng các công c? chu?n.
- Ghi l?i các file dã thay d?i và scope ?nh hu?ng.
- C?p nh?t Graphify n?u c?n.

## Tru?c khi th?c thi

1. Xác nh?n scope thay d?i: `apps/frontend`, `apps/backend`, `apps/api`, ho?c `packages/*`.
2. Th?ng kê file thay d?i chính b?ng `git status --short`.
3. Ghi l?i các di?m thay d?i quan tr?ng:
   - module m?i / route m?i
   - import m?i gi?a service
   - package workspace m?i

## Các l?nh ki?m tra

1. Ch?y t? root repo:

```bash
pnpm check
```

2. N?u thay d?i c?u trúc module/route dáng k?, ch?y:

```bash
node script-system/graphify-update.cjs apps/<app>
pnpm graphify:ai-summary
pnpm check:full
```

3. N?u ch? thay d?i package workspace ho?c docs, `pnpm check` v?n là t?i thi?u.

## Ghi nh? thay d?i

- N?u thay d?i liên quan `apps/api`, ki?m tra import m?i có vi ph?m boundary không.
- N?u thay d?i liên quan `apps/frontend` ho?c `apps/backend`, xác nh?n r?ng API v?n g?i qua HTTP / `@workspace/api-client`.
- N?u thêm package ho?c share logic, ghi chú `packages/*` và ch?y `pnpm graphify:ai-summary` n?u c?n.

## N?u ki?m tra không pass

1. Ð?c l?i `pnpm check` tr? v?.
2. Chia l?i theo nhóm:
   - `verify:bounds` ? boundary/import sai (`package.json` workspace)
   - `verify:sdk-http` ? app Next g?i `api.http` thay vì resource SDK
   - `lint` ? style/import/c?u trúc
   - `typecheck` ? ki?u d? li?u
3. S?a theo nhóm l?i, r?i ch?y l?i `pnpm check`.

## N?u c?n c?p nh?t docs

- N?u thay d?i c?u trúc ho?c feature m?i: c?p nh?t `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` (pattern chu?n) ho?c `docs/pages/README.md` (ki?n trúc file) ho?c `docs/steps/*.md` tuong ?ng.
- N?u thay d?i ranh gi?i service: c?p nh?t `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` ho?c `packages/eslint-config/service-boundaries.js` n?u có.

## K?t lu?n bu?c này

- `pnpm check` pass.
- N?u c?n, `pnpm check:full` pass.
- Gi? note thay d?i rõ ràng và theo scope.
