# Cây thư mục — apps/hub-event/hub-event-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-13T11:10:25.259Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── dang-nhap/
│   │   │   └── [role]/
│   │   ├── guest/
│   │   │   └── dang-nhap/
│   │   └── student/
│   │       └── dang-nhap/
│   ├── (portal)/
│   │   ├── guest/
│   │   │   ├── events/
│   │   │   └── profile/
│   │   └── student/
│   │       ├── events/
│   │       └── profile/
│   ├── (site)/
│   │   ├── _component/
│   │   ├── [slug]/
│   │   ├── su-kien/
│   │   │   ├── _component/
│   │   │   └── [slug]/
│   │   └── su-kien-cua-toi/
│   └── admin/
│       ├── _component/
│       │   ├── _alert-dialog/
│       │   ├── _form/
│       │   ├── _hooks/
│       │   ├── _live/
│       │   ├── _query/
│       │   └── _table/
│       ├── [id]/
│       │   └── edit/
│       ├── cameras/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── categories/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── check-in-ky-tuc-xa/
│       ├── dang-ky/
│       ├── dang-nhap/
│       ├── data/
│       ├── file-storage/
│       ├── guides/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── locations/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── new/
│       ├── posts/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── profile/
│       ├── rbac/
│       │   └── [id]/
│       │       └── edit/
│       ├── screens/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── settings/
│       │   └── _component/
│       ├── speakers/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── staff/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── tags/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── templates/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       └── tong-quan/
├── components/
│   ├── icons/
│   └── shared/
├── config/
│   └── admin/
├── features/
│   ├── admin-auth/
│   ├── auth/
│   ├── my-events/
│   └── my-registered-events/
│       ├── _query/
│       └── _table/
├── hooks/
│   └── admin/
├── lib/
│   └── admin/
├── providers/
│   └── admin/
└── types/
    └── admin/
```

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-event/hub-event-checkin-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
