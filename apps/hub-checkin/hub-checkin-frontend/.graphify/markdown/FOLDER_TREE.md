# Cây thư mục — apps/hub-checkin/hub-checkin-frontend (Graphify)

> **Sinh tự động:** `2026-06-19T01:42:38.607Z` từ `snapshot/graph.json` (node `directory` / `route-group` dưới `src/`).

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
│       ├── contact-requests/
│       │   └── [id]/
│       ├── dashboard/
│       ├── data/
│       ├── dormitory-checkin/
│       ├── file-storage/
│       ├── guides/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── hanet/
│       │   ├── avatar/
│       │   ├── checkin/
│       │   ├── dia-diem/
│       │   ├── ket-noi/
│       │   ├── nguoi/
│       │   └── thiet-bi/
│       ├── hanet-avatars/
│       ├── locations/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── login/
│       ├── new/
│       ├── posts/
│       │   ├── [id]/
│       │   │   └── edit/
│       │   └── new/
│       ├── profile/
│       ├── rbac/
│       │   └── [id]/
│       │       └── edit/
│       ├── register/
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
│       └── templates/
│           ├── [id]/
│           │   └── edit/
│           └── new/
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

Chạy `node script-system/graphify/graphify-update.cjs apps/hub-checkin/hub-checkin-frontend` rồi `pnpm graphify:ai-summary` (hoặc `pnpm graphify:refresh`).
