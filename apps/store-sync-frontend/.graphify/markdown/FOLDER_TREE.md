# Cây thư mục — store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-09T08:29:02.293Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

```text
src/
├── app/
│   ├── (store-sync)/
│   │   ├── cart/
│   │   ├── catalog/
│   │   │   └── [productId]/
│   │   ├── checkout/
│   │   ├── dashboard/
│   │   ├── help/
│   │   ├── login/
│   │   ├── orders/
│   │   │   └── [orderId]/
│   │   ├── privacy/
│   │   ├── profile/
│   │   ├── register/
│   │   ├── support/
│   │   └── terms/
│   ├── api/
│   │   └── graphify/
│   ├── graph/
│   └── store/
│       ├── orders/
│       │   ├── _component/
│       │   └── [orderId]/
│       └── profile/
├── components/
│   ├── graphify/
│   └── shared/
├── config/
├── hooks/
├── lib/
├── providers/
└── types/
```

## Làm mới

Chạy `node scripts/graphify-update.cjs apps/store-sync-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
