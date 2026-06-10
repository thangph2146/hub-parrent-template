/**
 * Chỉ chờ API khi dev stack bật HUB_DEV_WAIT_API=1 (vd. pnpm dev:checkin).
 * Chạy app đơn lẻ: không set env → thoát ngay, không block.
 *
 * Env:
 *   HUB_DEV_WAIT_API=1  — bật chờ port
 *   HUB_DEV_API_PORT    — mặc định 3002
 *   WAIT_API_SKIP=1     — bỏ qua chờ (debug)
 */
const { waitForApiPort } = require("./wait-api-port.cjs")

async function main() {
  if (process.env.WAIT_API_SKIP === "1") {
    process.exit(0)
  }
  if (process.env.HUB_DEV_WAIT_API !== "1") {
    process.exit(0)
  }

  const port = Number(process.env.HUB_DEV_API_PORT || 3002)
  const timeoutMs = Number(process.env.WAIT_API_TIMEOUT_MS || 120_000)

  try {
    await waitForApiPort(port, timeoutMs)
    process.exit(0)
  } catch (err) {
    console.error(`[conditional-api-wait] ${err.message}`)
    process.exit(1)
  }
}

void main()
