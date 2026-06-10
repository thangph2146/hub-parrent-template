# Step 1: System Overview

T?ng quan nhanh d? hi?u c?u trúc monorepo và các ranh gi?i tru?c khi phát tri?n.

## D?ch v? chính

- `apps/api` — NestJS + MikroORM: entities, migrations, seeders, controllers, services.
- `apps/frontend` — Storefront Next.js (public-facing).
- `apps/backend` — Admin Next.js (internal admin).

## Packages chia s?

- `packages/api-client` — SDK g?i `apps/api` (HTTP).
- `packages/query-client` — c?u hình TanStack Query dùng chung.
- `packages/ui`, `packages/editor` — UI / editor components.
- `packages/eslint-config`, `packages/typescript-config` — quy t?c lint/tsconfig chung.

## Nguyên t?c ranh gi?i

- KHÔNG import chéo source gi?a `apps/*`.
- Next apps g?i `apps/api` qua HTTP ho?c `@workspace/api-client`.
- Logic DB (entities, migrations, seeders) ch? ? `apps/api`.
- Logic dùng chung d?t ? `packages/*` n?u th?c s? c?n chia s?.

## Tài li?u quan tr?ng (d?c tru?c khi s?a code)

- `docs/admin-pattern/PRE_CODE_PROTOCOL.md` — quy trình b?t bu?c tru?c khi s?a code.
- `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` — so d? microservice và checklist.
- `docs/admin-pattern/AGENTS_GUIDE.md` — hu?ng d?n d?c th? t? và ch?y `pnpm check`.
- `.graphify/markdown/SUMMARY_FOR_AI.md` và `apps/*/.graphify/markdown/SUMMARY_FOR_AI.md` — b?n tóm t?t graph cho t?ng app.
- N?u task liên quan page/feature: `docs/pages/<feature>-implementation.md`.

## Quy trình thay d?i (t?i thi?u)

1. Xác d?nh ph?m vi (app/package/feature).
2. Ð?c các tài li?u trong m?c "Tài li?u quan tr?ng" theo th? t?.
3. M? `apps/<app>/.graphify/markdown/FOLDER_TREE.md` d? d?nh v? file m?c tiêu.
4. Ch?nh code ch? sau khi hi?u lu?ng d? li?u.
5. Ch?y t? root:

```bash
pnpm check
```

6. N?u thay d?i ki?n trúc/module/routes l?n:

```bash
# c?p nh?t snapshot cho app
node script-system/graphify-update.cjs apps/<app>
pnpm graphify:ai-summary
pnpm check:full
```

## Ki?m tra hoàn thành

- `pnpm check` ph?i pass.
- Không vi ph?m `service-boundaries` (xem `packages/eslint-config/service-boundaries.js`).
- Không thêm ph? thu?c sai vào `package.json` c?a app/package.

---

File này là tóm t?t; tham kh?o chi ti?t trong `docs/admin-pattern/` và `.graphify/markdown/`.
