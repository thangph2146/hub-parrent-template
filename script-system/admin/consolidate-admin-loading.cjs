/**
 * Gộp loading.tsx CRUD trùng AdminRouteLoading → re-export routing shared.
 * Giữ custom: modules/posts/loading.tsx, modules/posts/[id]/loading.tsx
 */
const fs = require("fs")
const path = require("path")

const { ROOT } = require("../lib/paths.cjs")
const modulesRoot = path.join(ROOT, "packages/admin-app/src/modules")
const skip = new Set(["posts/loading.tsx", "posts/[id]/loading.tsx"])

function walk(dir, rel = "") {
  let count = 0
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${ent.name}` : ent.name
    const abs = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      count += walk(abs, r)
      continue
    }
    if (ent.name !== "loading.tsx" || skip.has(r)) continue
    const content = fs.readFileSync(abs, "utf8")
    let target
    if (content.includes('variant="form"')) target = "admin-form-route-loading"
    else if (content.includes('variant="detail"'))
      target = "admin-detail-route-loading"
    else {
      console.warn(`[consolidate-admin-loading] bỏ qua (không phải form/detail): ${r}`)
      continue
    }
    fs.writeFileSync(
      abs,
      `export { default } from "@workspace/admin-app/routing/${target}"\n`,
      "utf8"
    )
    count += 1
  }
  return count
}

const n = walk(modulesRoot)
console.log(`[consolidate-admin-loading] Đã cập nhật ${n} file loading.tsx`)
