const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")

const PKG_SRC = path.join(ROOT, "packages/admin-app/src")

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

let fixed = 0
for (const file of walk(PKG_SRC)) {
  let content = fs.readFileSync(file, "utf8")
  const original = content

  content = content.replace(
    /import \{ useAdminApi \} from ["']@workspace\/admin-app\/runtime["']\s*\nconst api = useAdminApi\(\)\s*\n/g,
    'import { api } from "@workspace/admin-app/lib/api"\n',
  )
  content = content.replace(/\nconst api = useAdminApi\(\)\s*\n/g, "\n")

  const usesApi =
    /\bapi\./.test(content) ||
    /\bapi\s*,/.test(content) ||
    /\(\s*api\s*[,)]/.test(content) ||
    /\{\s*api\s*\}/.test(content)

  if (
    usesApi &&
    !/from ["']@workspace\/admin-app\/lib\/api["']/.test(content) &&
    !/useAdminApi\(/.test(content) &&
    !/bindAdminApi\(/.test(content)
  ) {
    const apiImport = 'import { api } from "@workspace/admin-app/lib/api"\n'
    const useClientMatch = content.match(/^["']use client["']\s*\n/)
    content = useClientMatch
      ? `${useClientMatch[0]}${apiImport}${content.slice(useClientMatch[0].length)}`
      : `${apiImport}${content}`
  }

  if (content !== original) {
    fs.writeFileSync(file, content)
    fixed++
  }
}

console.log(`[fix-package-api-imports] fixed ${fixed} files`)
