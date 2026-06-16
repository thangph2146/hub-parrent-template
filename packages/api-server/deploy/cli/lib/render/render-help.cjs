const HELP_LINES = `
api:render — materialize deploy/nest → app API deploy

CÁCH CHẠY
  pnpm api:render                              Menu: repo → chọn mẫu → (module) → render + .env
  pnpm api:render apps/hub-event/api --prune   Render full check-in + dọn module thừa
  pnpm api:sync-template                       Sync main/api → deploy/nest

FLAGS
  --pick                 Chọn module (TTY, sau khi chọn repo)
  --modules=a,b          Module cụ thể (+ closure import)
  --all-modules / --full Toàn template
  --prune                Xóa module thừa trong src/ (mặc định bật cho line subset)
  --no-prune             Giữ module ngoài graph closure (không khuyến nghị)
  --prune-entities       Cắt entity theo graph closure (thử nghiệm; mặc định: full entities)
  --init-config          Tạo/ghi api.app.config.json
  --skip-env             Không tạo / patch .env
  --force-env            Ghi đè .env từ .env.example (mặc định: patch DATABASE_URL + field stack)
  --skip-sync-template   Không sync main → template
  --verbose              Log chi tiết từng file khi sync template
  --skip-verify          Bỏ verify check-in
  --skip-typecheck       Bỏ typecheck app
  --heal                 Typecheck fail → sync template + render lại 1 lần

TỰ ĐIỀU CHỈNH
  • OOP main → copy binding (tránh duplicate export type)
  • Prune helper → patch import sang module-bases
  • --modules=… → closure + cắt app.module + bỏ seed phụ thuộc
  • Partial → bỏ verify; full hub-event → verify + parity
  • Entity: mặc định full copy; --prune-entities dùng entity-graph.manifest.json
  • Module dư: verify graph closure — pnpm verify:module-graph · render subset auto --prune
  • pnpm verify:entity-closure — kiểm closure entity theo graph cho mọi line deploy

MA TRẬN (check-in · parent · store)
  pnpm api:render:matrix
  pnpm api:render:matrix -- --lines=checkin,parent,store
`.trim()

function getApiRenderHelpShort() {
  return '↑↓ chọn repo · Space tick module · Enter xác nhận · Ctrl+C hủy'
}

function printApiRenderHelp() {
  console.log(HELP_LINES)
}

module.exports = { HELP_LINES, getApiRenderHelpShort, printApiRenderHelp }
