/**
 * Ghi đè module product-owned sau api:render (hub-parent).
 * Nằm trong product-overrides để không bị render xóa.
 *
 * Usage: pnpm --filter @hub-parent/api run apply-overrides
 */
const fs = require("node:fs")
const path = require("node:path")

const API_ROOT = path.resolve(__dirname, "../..")
const OVERRIDES = path.join(API_ROOT, "product-overrides")
const DEST_SRC = path.join(API_ROOT, "src")

const PUBLIC_FILES_TO_REMOVE = [
  "public/public-events.service.ts",
  "public/public-event-categories.service.ts",
  "public/public-event-registration.service.ts",
  "public/event-student-email.ts",
]

function copyOverrideTree(rel) {
  const src = path.join(OVERRIDES, rel)
  const dest = path.join(DEST_SRC, rel)
  if (!fs.existsSync(src)) {
    console.warn(`[apply-overrides] bỏ qua — không có ${rel}`)
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, { recursive: true })
  console.log(`[apply-overrides] applied ${rel}`)
}

function removePublicEventArtifacts() {
  for (const rel of PUBLIC_FILES_TO_REMOVE) {
    const target = path.join(DEST_SRC, rel)
    if (!fs.existsSync(target)) continue
    fs.unlinkSync(target)
    console.log(`[apply-overrides] removed ${rel}`)
  }
}

function main() {
  if (!fs.existsSync(OVERRIDES)) {
    console.log("[apply-overrides] không có product-overrides — skip")
    return
  }
  copyOverrideTree("public")
  removePublicEventArtifacts()
  console.log("[apply-overrides] xong")
}

main()
