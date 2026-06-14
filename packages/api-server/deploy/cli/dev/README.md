# Dev scripts — không chạy trong CI

| Script | Mục đích |
|--------|----------|
| `audit-common-usage.cjs` | Liệt kê file `deploy/nest/src/common/*.ts` USED/DEAD |
| `report-module-bindings.cjs` | Trạng thái binding extends Base* sau render |
| `report-module-files.cjs` | Chi tiết file từng module sau render |
| `gzip-test-fixture.cjs` | Nén export JSON → `src/data-test/fixtures/*.json.gz` |

```bash
node packages/api-server/deploy/cli/dev/gzip-test-fixture.cjs path/to/hub-system-export-2026-06-11.json
```
