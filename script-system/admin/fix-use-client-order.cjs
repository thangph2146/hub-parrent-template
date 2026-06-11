const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/paths.cjs")

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
  if (!content.includes('"use client"') && !content.includes("'use client'")) continue

  const original = content
  const useClientMatch = content.match(/^["']use client["']\s*\n/m)
  if (useClientMatch && content.indexOf(useClientMatch[0]) === 0) continue

  content = content.replace(/^["']use client["']\s*\n/m, "")
  content = content.replace(
    /^import \{ api \} from ["']@workspace\/admin-app\/lib\/api["']\s*\n/m,
    "",
  )

  const imports = []
  if (/import \{ api \}/.test(original)) {
    imports.push('import { api } from "@workspace/admin-app/lib/api"')
  }

  const body = content.trimStart()
  content = `"use client"\n${imports.length ? `${imports.join("\n")}\n` : ""}${body}`

  if (content !== original) {
    fs.writeFileSync(file, content)
    fixed++
  }
}

console.log(`[fix-use-client-order] fixed ${fixed} files`)
