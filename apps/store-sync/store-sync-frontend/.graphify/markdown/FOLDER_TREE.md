# Cây thư mục — apps/store-sync/store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-12T14:20:21.285Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

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
│           └── _component/
├── components/
│   ├── graphify/
│   └── shared/
├── config/
├── hooks/
├── lib/
└── providers/
```

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
