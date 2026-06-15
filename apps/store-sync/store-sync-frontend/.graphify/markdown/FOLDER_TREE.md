# Cây thư mục — apps/store-sync/store-sync-frontend (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.553Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

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
│   ├── admin/
│   │   ├── categories/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── dang-ky/
│   │   ├── dang-nhap/
│   │   ├── data/
│   │   ├── file-storage/
│   │   ├── guides/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── profile/
│   │   ├── promo-codes/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── rbac/
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   ├── seo-metas/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── settings/
│   │   ├── staff/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   └── tong-quan/
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
│   └── admin/
├── features/
│   └── admin-auth/
├── hooks/
│   └── admin/
├── lib/
│   └── admin/
├── providers/
│   └── admin/
└── types/
```

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/store-sync/store-sync-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
