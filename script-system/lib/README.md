# lib/

Helper dùng chung bởi script-system.

```text
lib/
├── monorepo-root.cjs       # ROOT, SCRIPT_SYSTEM, PRODUCT_LINES
├── monorepo-apps.cjs       # Registry path target theo product line (metadata)
├── run-step.cjs            # Pipeline step runner (post-pull downstream)
├── admin-app-config-path.cjs
└── README.md
```

| Cần | Dùng |
|-----|------|
| Root repo / script-system | `monorepo-root.cjs` |
| Target app theo product line | `monorepo-apps.cjs` hoặc `product-line-profiles.cjs` trong package |
| Admin config path | `admin-app-config-path.cjs` |

Layout `data/`, storage, env runtime — downstream product tự quản lý.
