import fs from "node:fs"
import path from "node:path"

const root = path.resolve("src")
const dirs = [
  path.join(root, "app/admin"),
  path.join(root, "lib/admin"),
  path.join(root, "hooks/admin"),
  path.join(root, "providers/admin"),
  path.join(root, "features/admin-auth"),
  path.join(root, "config/admin"),
]

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

const replacements = [
  [/useAdminCrudNavigation\("\/events"/g, 'useAdminCrudNavigation("/admin"'],
  [/useAdminCrudNavigation\('\/events'/g, "useAdminCrudNavigation('/admin'"],
  [/"\/events"/g, '"/admin"'],
  [/'\/events'/g, "'/admin'"],
  [/@\/lib\/admin\/admin\/api/g, "@/lib/admin/api"],
  [/@\/lib\/api/g, "@/lib/admin/api"],
  [/@\/lib\//g, "@/lib/admin/"],
  [/@\/hooks\//g, "@/hooks/admin/"],
  [/@\/providers\/auth-provider/g, "@/providers/admin/auth-provider"],
  [/@\/providers\/query-provider/g, "@/providers/admin/query-provider"],
  [/@\/providers\/admin-realtime-sync/g, "@/providers/admin/admin-realtime-sync"],
  [/@\/features\/auth\//g, "@/features/admin-auth/"],
  [
    /@\/config\/admin-layout-static/g,
    "@/config/admin/checkin-admin-layout-static",
  ],
  [/@\/config\/admin-menu-tree/g, "@/config/admin/checkin-admin-menu-tree"],
  [/@\/app\/cameras\/_component/g, "@/lib/admin/cameras-query"],
]

let updated = 0
for (const dir of dirs) {
  for (const file of walk(dir)) {
    let content = fs.readFileSync(file, "utf8")
    const original = content
    for (const [pattern, value] of replacements) {
      content = content.replace(pattern, value)
    }
    if (content !== original) {
      fs.writeFileSync(file, content)
      updated++
    }
  }
}

let fixed = 0
for (const dir of [root, ...dirs]) {
  for (const file of walk(dir)) {
    let content = fs.readFileSync(file, "utf8")
    const original = content
    content = content
      .replace(/@\/lib\/admin\/admin\//g, "@/lib/admin/")
      .replace(/@\/hooks\/admin\/admin\//g, "@/hooks/admin/")
      .replace(/from "@\/lib"/g, 'from "@/lib/admin"')
    if (content !== original) {
      fs.writeFileSync(file, content)
      fixed++
    }
  }
}

console.log(`updated ${updated} files, fixed ${fixed} files`)
