/**
 * Chuẩn hóa .env hiện có theo .env.example (giữ giá trị biến, đổi layout + marker).
 * Backup: .env.bak (ghi đè mỗi lần chạy).
 *
 * Usage:
 *   node script-system/env/reorganize-env.cjs
 *   node script-system/env/reorganize-env.cjs checkin
 *   node script-system/env/reorganize-env.cjs --dry-run all
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/paths.cjs")
const { ENV_STACKS, allEnvApps } = require("./manifest.cjs")

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const stackKey = args.find((a) => !a.startsWith("-")) ?? "all"

function resolveApps(key) {
  if (key === "all") return allEnvApps()
  const stack = ENV_STACKS[key]
  if (!stack) {
    console.error(
      `[env:reorganize] stack không hợp lệ: ${key}\n` +
        `  Hợp lệ: ${Object.keys(ENV_STACKS).join(", ")}, all`,
    )
    process.exit(1)
  }
  return stack.apps
}

/** @param {string} content */
function parseEnvVars(content) {
  /** @type {Record<string, string>} */
  const vars = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (isPlaceholderValue(val)) continue
    vars[key] = val
  }
  return vars
}

const ACTIVE_KEY_LINE = /^([A-Z][A-Z0-9_]*)\s*=/

function isPlaceholderValue(value) {
  const v = value.trim()
  return (
    /your-/i.test(v) ||
    /change-me/i.test(v) ||
    v === "D:/HUB/data" ||
    v === "http://localhost:5000"
  )
}

/** @param {string} example @param {Record<string, string>} vars */
function mergeExampleWithVars(example, vars) {
  const used = new Set()
  const lines = example.split(/\r?\n/)

  const merged = lines.map((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("#")) {
      const commented = trimmed.replace(/^#\s*/, "")
      const cm = commented.match(ACTIVE_KEY_LINE)
      if (cm && cm[1] in vars) {
        used.add(cm[1])
        return `${cm[1]}=${vars[cm[1]]}`
      }
      return line
    }
    const m = trimmed.match(ACTIVE_KEY_LINE)
    if (!m) return line
    const key = m[1]
    if (key in vars) {
      used.add(key)
      return `${key}=${vars[key]}`
    }
    const eq = trimmed.indexOf("=")
    const exampleVal = trimmed.slice(eq + 1).trim()
    if (isPlaceholderValue(exampleVal)) {
      return `# ${trimmed}`
    }
    return line
  })

  const extra = Object.keys(vars).filter((k) => !used.has(k))
  if (extra.length) {
    merged.push("")
    merged.push("# ------------------------------------------------------------------------------")
    merged.push("# Local overrides (không có trong .env.example)")
    merged.push("# ------------------------------------------------------------------------------")
    merged.push("")
    for (const key of extra.sort()) {
      merged.push(`${key}=${vars[key]}`)
    }
  }

  return `${merged.join("\n").replace(/\n+$/, "")}\n`
}

let updated = 0
let created = 0
let skipped = 0

for (const app of resolveApps(stackKey)) {
  const dir = path.join(ROOT, app.path)
  const examplePath = path.join(dir, ".env.example")
  const envPath = path.join(dir, ".env")
  const rel = app.path

  if (!fs.existsSync(examplePath)) {
    console.error(`[env:reorganize] thiếu ${rel}/.env.example`)
    process.exitCode = 1
    continue
  }

  const example = fs.readFileSync(examplePath, "utf8")
  const vars = fs.existsSync(envPath)
    ? parseEnvVars(fs.readFileSync(envPath, "utf8"))
    : {}

  const next = mergeExampleWithVars(example, vars)

  if (fs.existsSync(envPath)) {
    const prev = fs.readFileSync(envPath, "utf8")
    if (prev === next) {
      console.log(`[env:reorganize] unchanged: ${rel}/.env`)
      skipped++
      continue
    }
    if (!dryRun) {
      fs.copyFileSync(envPath, path.join(dir, ".env.bak"))
      fs.writeFileSync(envPath, next)
    }
    console.log(`[env:reorganize] ${dryRun ? "would update" : "updated"}: ${rel}/.env`)
    updated++
  } else {
    if (!dryRun) fs.writeFileSync(envPath, next)
    console.log(`[env:reorganize] ${dryRun ? "would create" : "created"}: ${rel}/.env`)
    created++
  }
}

console.log(
  `[env:reorganize] xong — cập nhật ${updated}, tạo mới ${created}, giữ nguyên ${skipped}` +
    (dryRun ? " (dry-run)" : ""),
)
