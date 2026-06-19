# Cây thư mục — apps/hub-parent/hub-parent-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.516Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

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
│   ├── admin/
│   │   ├── academic-years/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── cameras/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── categories/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── contact-requests/
│   │   │   └── [id]/
│   │   ├── courses/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── dashboard/
│   │   ├── data/
│   │   ├── departments/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── events/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── file-storage/
│   │   ├── guides/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── hanet/
│   │   │   ├── avatar/
│   │   │   ├── checkin/
│   │   │   ├── dia-diem/
│   │   │   ├── ket-noi/
│   │   │   ├── nguoi/
│   │   │   └── thiet-bi/
│   │   ├── locations/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── login/
│   │   ├── majors/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── my-students/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   ├── parent-students/
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
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
│   │   ├── register/
│   │   ├── screens/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── seo-metas/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── settings/
│   │   ├── speakers/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── staff/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── tags/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── templates/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── training-levels/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   └── training-systems/
│   │       ├── [id]/
│   │       │   └── edit/
│   │       └── new/
│   ├── api/
│   │   └── graphify/
│   └── graph/
├── components/
│   ├── icons/
│   └── shared/
├── config/
│   └── admin/
├── features/
│   ├── admin-auth/
│   ├── auth/
│   └── pages/
│       ├── about-page/
│       │   └── sub-sections/
│       └── home-page/
│           └── sub-sections/
├── hooks/
│   └── admin/
├── lib/
│   └── admin/
├── providers/
│   └── admin/
└── types/
```

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
