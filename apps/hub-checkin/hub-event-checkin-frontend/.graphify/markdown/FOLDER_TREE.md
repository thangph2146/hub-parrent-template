# Cây thư mục — apps/hub-event/hub-event-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-15T03:40:54.458Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

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
│       ├── contact-requests/
│       │   └── [id]/
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
│   ├── admin/
│   │   └── events/
│   │       ├── _alert-dialog/
│   │       ├── _form/
│   │       ├── _hooks/
│   │       ├── _live/
│   │       ├── _query/
│   │       └── _table/
│   ├── icons/
│   └── shared/
├── config/
│   ├── admin/
│   └── portal/
├── features/
│   ├── admin-auth/
│   ├── auth/
│   └── my-registered-events/
├── hooks/
│   └── admin/
├── lib/
│   ├── admin/
│   ├── portal/
│   └── site/
├── providers/
│   ├── admin/
│   └── portal/
└── types/
    └── admin/
```

## Làm mới

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-event/hub-event-checkin-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
