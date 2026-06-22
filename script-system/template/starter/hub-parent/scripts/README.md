# scripts/ — product-owned (hub-parent)

Không sync từ template. Dev local + PM2 production.

```text
scripts/
├── dev/          # pnpm dev — turbo watch (Windows + Ubuntu)
└── pm2/          # pnpm pm2 — production trên Ubuntu
```

## Dev

```bash
pnpm dev              # API :3002 + frontend :3000
```

## Production (Ubuntu)

Cần [PM2](https://pm2.keymetrics.io/) global: `npm i -g pm2`

```bash
pnpm install
pnpm build:prod       # build packages + api + next
pnpm pm2 start        # hoặc: pnpm pm2 restart
pnpm pm2 reload       # zero-downtime (chỉ process đang chạy)
pnpm pm2 stop
pnpm pm2 delete
```

Sau deploy code mới:

```bash
git pull && pnpm install && pnpm build:prod && pnpm pm2 restart
```

Process: `hub-parent-api` (:3002), `hub-parent-frontend` (:3000).
