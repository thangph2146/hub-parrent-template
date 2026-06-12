# Cây thư mục — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-12T13:26:57.134Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

```text
src/
├── app/
│   ├── (public)/
│   │   ├── (store-sync)/
│   │   │   ├── cart/
│   │   │   ├── catalog/
│   │   │   │   └── [productId]/
│   │   │   ├── checkout/
│   │   │   ├── dashboard/
│   │   │   ├── help/
│   │   │   ├── login/
│   │   │   ├── orders/
│   │   │   │   └── [orderId]/
│   │   │   ├── privacy/
│   │   │   ├── profile/
│   │   │   ├── register/
│   │   │   ├── support/
│   │   │   └── terms/
│   │   ├── bai-viet/
│   │   │   └── [slug]/
│   │   ├── huong-dan-su-dung/
│   │   ├── lien-he/
│   │   └── ve-chung-toi/
│   ├── api/
│   │   └── graphify/
│   └── graph/
├── components/
│   ├── icons/
│   └── shared/
├── features/
│   ├── auth/
│   └── pages/
│       ├── about-page/
│       │   └── sub-sections/
│       └── home-page/
│           └── sub-sections/
├── hooks/
├── lib/
├── providers/
└── types/
```

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
