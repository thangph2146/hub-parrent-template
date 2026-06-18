import { existsSync } from "node:fs"
import { execSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const entry = join(root, "dist", "main.js")

if (!existsSync(entry)) {
  console.log("[api] dist/main.js chưa có — chạy build trước khi dev…")
  execSync("pnpm run build", { cwd: root, stdio: "inherit" })
}
