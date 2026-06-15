# Archive — migration một lần

Script đổi entity ID (đã chạy xong trên DB dev). **Không** sync sang deploy line (`hub-event`, `hub-parent`, `store-sync`).

Chạy thủ công từ `apps/main/api` nếu cần tham khảo:

```bash
node scripts/archive/migrate-entity-ids.mjs
```
