/**
 * Kiểm tra mỗi app deployable có .env.example chuẩn (ENV_TEMPLATE + ENV_STACK).
 *
 * Usage: node script-system/verify/verify-env-examples.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { ROOT } = require("../lib/paths.cjs")
const { allEnvApps } = require("../env/manifest.cjs")

const REQUIRED_MARKERS = ["ENV_TEMPLATE=", "ENV_STACK="]

function verify() {
  const errors = []

  for (const app of allEnvApps()) {
    const examplePath = path.join(ROOT, app.path, ".env.example")
    const rel = `${app.path}/.env.example`

    if (!fs.existsSync(examplePath)) {
      errors.push(`thiếu file: ${rel}`)
      continue
    }

    const content = fs.readFileSync(examplePath, "utf8")
    for (const marker of REQUIRED_MARKERS) {
      if (!content.includes(marker)) {
        errors.push(`${rel}: thiếu marker ${marker}`)
      }
    }

    const templateMatch = content.match(/ENV_TEMPLATE=([^\s#]+)/)
    if (templateMatch && templateMatch[1] !== app.template) {
      errors.push(
        `${rel}: ENV_TEMPLATE=${templateMatch[1]} ≠ manifest ${app.template}`,
      )
    }
  }

  if (errors.length) {
    console.error(
      "[verify:env] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"),
    )
    process.exit(1)
  }

  console.log(
    `[verify:env] OK — ${allEnvApps().length} app(s), marker ENV_TEMPLATE + ENV_STACK`,
  )
}

verify()
