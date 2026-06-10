# Step 2: Clean Code Guide Line

M?c tiêu: các nguyên t?c d? gi? code s?ch, dúng ranh gi?i, và d? review trong monorepo.

## Nguyên t?c chung

- Vi?t code rõ ràng, có tên bi?n/method mô t? m?c dích.
- Tránh thay d?i ngoài ph?m vi task; không s?a file unrelated.
- Vi?t test nh? cho logic quan tr?ng khi có th?.

## Ranh gi?i service

- Không import tr?c ti?p gi?a `apps/*`.
- N?u c?n chia s? logic, dua vào `packages/*` và c?p nh?t `WORKSPACE_DEPS.md` b?ng `pnpm graphify:ai-summary`.

## Lint / Type / Tests

- Tru?c khi PR: ch?y t? root:

```bash
pnpm check
```

- `pnpm check` = `verify:bounds` + `lint` + `typecheck`.
- N?u thay d?i nhi?u v? c?u trúc: ch?y `pnpm check:full` sau c?p nh?t `.graphify` snapshot.

## Commit / PR

- Gi? commit nh?, rõ ràng, theo ch?c nang.
- M?i PR nên: mô t? ng?n, li?t kê file dã thay d?i, và l?nh reproduce `pnpm check`.

## Khi refactor/di chuy?n module

- C?p nh?t Graphify snapshot n?u thay d?i file/route/module dáng k?:

```bash
node script-system/graphify-update.cjs apps/<app>
pnpm graphify:ai-summary
pnpm check:full
```

## Ki?m tra boundary và ph? thu?c

- Ki?m tra `packages/eslint-config/service-boundaries.js` tru?c khi thêm import m?i.
- Dùng `pnpm verify:bounds` d? phát hi?n import c?m.

## Ghi chú cho agents / reviewers

- Tru?c khi s?a: xác d?nh scope, d?c `docs/admin-pattern/PRE_CODE_PROTOCOL.md`.
- Tri?t d? ch?y `pnpm check` và s?a theo l?i lint/type.
- N?u không tìm th?y docs feature: báo và ti?p t?c b?ng Graphify ? source.

---

File này là checklist nhanh; ch?nh s?a khi c?n phù h?p quy trình team.
