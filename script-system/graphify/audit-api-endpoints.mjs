/**
 * So sánh endpoint thực tế (quét controller) vs graphify scanApiControllers.
 * Chạy: node script-system/graphify/audit-api-endpoints.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, relative } from "node:path"
import { createRequire } from "node:module"
import { scanApiControllers, listPackageModuleControllerPaths } from "./graphify-route-surface.mjs"

const require = createRequire(import.meta.url)
const { ROOT: root } = require("../lib/monorepo-root.cjs")

const DEFAULT_API = "apps/main/api"
const apiRel = process.argv[2] ?? DEFAULT_API
const CONTROLLER_DECORATOR_RE =
  /@Controller\(\s*(ADMIN_ROUTES\.(\w+)|PUBLIC_ROUTES\.(\w+)|['"]([^'"]+)['"]|`\$\{PUBLIC_ROUTES\.(\w+)\}([^`]*)`)\s*\)/g

/** @param {string} apiRoot */
function loadRouteConstants(apiRoot) {
  const constantsPath = join(root, apiRoot, "src/config/constants.ts")
  if (!existsSync(constantsPath)) return {}
  const content = readFileSync(constantsPath, "utf8")
  /** @type {Record<string, string>} */
  const map = {}
  for (const blockName of ["ADMIN_ROUTES", "PUBLIC_ROUTES"]) {
    const block = content.match(
      new RegExp(`export const ${blockName} = \\{([\\s\\S]*?)\\} as const`, "m")
    )
    if (!block) continue
    for (const m of block[1].matchAll(/(\w+):\s*['"]([^'"]+)['"]/g)) {
      map[`${blockName}.${m[1]}`] = m[2]
    }
  }
  return map
}

/** @param {RegExpMatchArray} match @param {Record<string, string>} routeMap */
function resolveControllerBase(match, routeMap) {
  if (match[2]) return routeMap[`ADMIN_ROUTES.${match[2]}`] ?? ""
  if (match[3]) return routeMap[`PUBLIC_ROUTES.${match[3]}`] ?? ""
  if (match[4]) return match[4]
  if (match[5]) {
    return `${routeMap[`PUBLIC_ROUTES.${match[5]}`] ?? ""}${match[6] ?? ""}`.replace(
      /\/+/g,
      "/"
    )
  }
  return ""
}

/** @param {string} content @param {Record<string, string>} routeMap */
function resolveAllControllerSegments(content, routeMap) {
  const matches = [...content.matchAll(CONTROLLER_DECORATOR_RE)]
  return matches
    .map((m, i) => {
      const start = m.index ?? 0
      const nextStart = matches[i + 1]?.index ?? content.length
      return {
        base: resolveControllerBase(m, routeMap),
        segment: content.slice(start, nextStart),
      }
    })
    .filter((s) => s.base)
}

/** @param {string} content @param {string} base */
function extractHttpMethods(content, base) {
  const methods = []
  for (const m of content.matchAll(
    /@(Get|Post|Put|Patch|Delete)\(\s*(?:['"]([^'"]*)['"])?\s*\)/g
  )) {
    const suffix = m[2] ?? ""
    const path = suffix ? `${base}/${suffix}`.replace(/\/+/g, "/") : base
    methods.push(`${m[1].toUpperCase()} /${path}`)
  }
  return [...new Set(methods)]
}

/** @param {string} dir */
function listControllers(dir) {
  /** @type {string[]} */
  const out = []
  function walk(d) {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const abs = join(d, ent.name)
      if (ent.isDirectory()) walk(abs)
      else if (ent.name.endsWith(".controller.ts")) out.push(abs)
    }
  }
  walk(dir)
  return out
}

function collectTruthEndpoints() {
  const routeMap = loadRouteConstants(apiRel)
  const pkgRouteMap = loadRouteConstants("packages/api-server")
  /** @type {Set<string>} */
  const truth = new Set()
  /** @type {string[]} */
  const unresolved = []

  for (const abs of listControllers(join(root, apiRel, "src"))) {
    const rel = relative(join(root, apiRel, "src"), abs).replace(/\\/g, "/")
    let content = readFileSync(abs, "utf8")
    let map = routeMap

    let segments = resolveAllControllerSegments(content, map)
    if (
      !segments.length &&
      /extends\s+(Base\w+Controller|Package\w+Controller)/.test(content)
    ) {
      const pkg = content.match(
        /from\s+['"]@workspace\/api-server\/modules\/([^'"]+)['"]/
      )
      if (pkg) {
        const candidates = listPackageModuleControllerPaths(pkg[1])
        const preferred = join(
          root,
          "packages/api-server/src/modules",
          pkg[1],
          `${pkg[1]}.controller.ts`,
        )
        const pkgPath =
          candidates.find((p) => p === preferred) ?? candidates[0]
        if (pkgPath && existsSync(pkgPath)) {
          content = readFileSync(pkgPath, "utf8")
          map = pkgRouteMap
          segments = resolveAllControllerSegments(content, map)
        }
      }
    }

    if (!segments.length) unresolved.push(rel)
    for (const { base, segment } of segments) {
      for (const method of extractHttpMethods(segment, base)) truth.add(method)
    }
  }
  return { truth, unresolved }
}

function collectGraphifyEndpoints() {
  const routeMap = loadRouteConstants(apiRel)
  const pkgRouteMap = loadRouteConstants("packages/api-server")
  const byDomain = scanApiControllers(apiRel, routeMap, {
    packageRouteMap: pkgRouteMap,
  })
  /** @type {Set<string>} */
  const doc = new Set()
  for (const row of byDomain.values()) {
    for (const m of row.methods) doc.add(m)
  }
  return { doc, domainCount: byDomain.size }
}

const { truth, unresolved } = collectTruthEndpoints()
const { doc, domainCount } = collectGraphifyEndpoints()

const missingInDoc = [...truth].filter((m) => !doc.has(m)).sort()
const extraInDoc = [...doc].filter((m) => !truth.has(m)).sort()

console.log(`=== Audit API endpoints (${apiRel}) ===`)
console.log(`Truth (full scan): ${truth.size} routes`)
console.log(`Graphify doc:      ${doc.size} routes (${domainCount} domains)`)
console.log(`Unresolved files:  ${unresolved.length}`)
if (unresolved.length) console.log(unresolved.map((f) => `  - ${f}`).join("\n"))

console.log(`\nMissing in graphify scan: ${missingInDoc.length}`)
for (const m of missingInDoc) console.log(`  ${m}`)

if (extraInDoc.length) {
  console.log(`\nExtra in doc (not in truth scan): ${extraInDoc.length}`)
  for (const m of extraInDoc) console.log(`  ${m}`)
}

process.exit(missingInDoc.length ? 1 : 0)
