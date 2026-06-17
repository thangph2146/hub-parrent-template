/**
 * Kiểm tra mỗi app deployable có .env.example chuẩn (ENV_TEMPLATE + ENV_STACK).
 *
 * Usage: node script-system/verify/verify-env-examples.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../lib/monorepo-root.cjs");
const { allEnvApps } = require("../env/manifest.cjs");
const { API_ENV_PROFILES } = require("../env/api-env-profiles.cjs");

const REQUIRED_MARKERS = ["ENV_TEMPLATE=", "ENV_STACK="]

function loadRepoManifest() {
  const manifestPath = path.join(ROOT, "template.manifest.json")
  if (!fs.existsSync(manifestPath)) return null
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"))
}

function envAppsForRepo() {
  const apps = allEnvApps()
  const manifest = loadRepoManifest()
  if (manifest?.role !== "downstream") return apps
  return apps.filter((app) => fs.existsSync(path.join(ROOT, app.path)))
}

function verify() {
  const errors = []
  const apps = envAppsForRepo()

  for (const app of apps) {
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

    if (app.template.startsWith("api-")) {
      const profile = API_ENV_PROFILES[app.template]
      if (profile) {
        const dbMatch = content.match(
          /DATABASE_URL=mysql:\/\/[^/]+\/([A-Za-z0-9_-]+)/,
        )
        if (!dbMatch) {
          errors.push(`${rel}: thiếu DATABASE_URL mysql hợp lệ`)
        } else if (dbMatch[1] !== profile.database) {
          errors.push(
            `${rel}: DATABASE_URL db=${dbMatch[1]} ≠ mong muốn ${profile.database}`,
          )
        }
        const stackMatch = content.match(/ENV_STACK=([^\s#]+)/)
        if (stackMatch && stackMatch[1] !== profile.envStack) {
          errors.push(
            `${rel}: ENV_STACK=${stackMatch[1]} ≠ ${profile.envStack}`,
          )
        }
        if (
          (profile.envStack === "main" || profile.envStack === "checkin") &&
          !content.includes("HANET_CLIENT_ID=")
        ) {
          errors.push(`${rel}: thiếu khối HANET (HANET_CLIENT_ID=)`)
        }
      }
    }
  }

  if (errors.length) {
    console.error(
      "[verify:env] FAILED\n" + errors.map((e) => `  - ${e}`).join("\n"),
    )
    process.exit(1)
  }

  console.log(
    `[verify:env] OK — ${apps.length} app(s), marker ENV_TEMPLATE + ENV_STACK`,
  )
}

verify()
