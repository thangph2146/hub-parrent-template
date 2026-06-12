# Graphify — `apps/hub-parent/hub-parent-frontend`

Package **@frontend**. Thư mục `.graphify/` giữ **snapshot** (`snapshot/`) và **Markdown cho AI** (`markdown/`).

## File trong thư mục này

| File / Thư mục | Mục đích |
|----------------|----------|
| `snapshot/graph.json` | Đồ thị node/link (`node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend`) |
| `snapshot/context.json` | Snapshot nội dung file để AI hiểu hệ thống |
| `markdown/SUMMARY_FOR_AI.md` | Tóm tắt module (sinh bởi `pnpm graphify:ai-summary`) |
| `markdown/FOLDER_TREE.md` | Cây thư mục `src/` |
| `markdown/GRAPH_STATS.md` | Thống kê graph |
| `README.md` | File này (mô tả layout) |

## Làm mới

```bash
node script-system/graphify/graphify-update.cjs apps/hub-parent/hub-parent-frontend
pnpm graphify:ai-summary
```

## Liên kết

- [SUMMARY monorepo](../../../../.graphify/markdown/SUMMARY_FOR_AI.md)
- [packages SUMMARY](../../../../packages/.graphify/markdown/SUMMARY_FOR_AI.md)
- [AGENTS.md](../../../../AGENTS.md)
