/**
 * Chuẩn hóa import workspace sau sync admin main → check-in.
 * UI package: luôn @ui/... (không @workspace/ui, không barrel @/hooks/.../use-admin-mutation).
 */

const { normalizeUiImportsInSource } = require("../../lib/import-alias-rules.cjs")

const ADMIN_MUTATION_HOOK = new Set([
  "useAdminMutation",
  "UseAdminMutationOptions",
])

const ADMIN_OPERATION_TOAST = new Set([
  "adminToastMeta",
  "createAdminMutationCache",
  "defaultAdminOperationToast",
  "defaultBulkOperationToast",
  "resolveAdminOperationError",
  "AdminOperationToastMessages",
])

const ADMIN_TOAST_SUPPRESS = new Set([
  "adminToastSuppressMeta",
  "suppressRealtimeToastAfterMutation",
  "suppressRealtimeToastForEntity",
  "AdminToastSuppressMeta",
])

const ADMIN_MUTATION_BARREL =
  /@\/hooks\/(?:admin\/)?use-admin-mutation|@ui\/hooks\/use-admin-mutation/

function parseNamedImport(spec, importTypeOnly = false) {
  const out = []
  for (const part of spec.split(",")) {
    const chunk = part.trim()
    if (!chunk) continue
    const typeOnly = importTypeOnly || chunk.startsWith("type ")
    const body =
      !importTypeOnly && chunk.startsWith("type ")
        ? chunk.slice(5).trim()
        : chunk
    const asMatch = body.match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/)
    if (!asMatch) continue
    out.push({
      name: asMatch[1],
      alias: asMatch[2],
      typeOnly,
    })
  }
  return out
}

function formatNamedImport(symbols, source) {
  const allTypes = symbols.length > 0 && symbols.every((s) => s.typeOnly)
  const parts = symbols.map(({ name, alias, typeOnly }) => {
    const prefix = !allTypes && typeOnly ? "type " : ""
    const asSuffix = alias && alias !== name ? ` as ${alias}` : ""
    return `${prefix}${name}${asSuffix}`
  })
  const typeKeyword = allTypes ? "type " : ""
  return `import ${typeKeyword}{ ${parts.join(", ")} } from "${source}"`
}

function routeAdminMutationSymbols(symbols) {
  const groups = {
    hook: [],
    toast: [],
    suppress: [],
    unknown: [],
  }
  for (const sym of symbols) {
    if (ADMIN_MUTATION_HOOK.has(sym.name)) groups.hook.push(sym)
    else if (ADMIN_OPERATION_TOAST.has(sym.name)) groups.toast.push(sym)
    else if (ADMIN_TOAST_SUPPRESS.has(sym.name)) groups.suppress.push(sym)
    else groups.unknown.push(sym)
  }
  return groups
}

function rewriteAdminMutationBarrelImports(content) {
  const re =
    /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["'](?:@\/hooks\/(?:admin\/)?|@ui\/hooks\/)use-admin-mutation["'];?/g

  return content.replace(re, (full, spec) => {
    const importTypeOnly = /^import\s+type\s+\{/.test(full)
    const symbols = parseNamedImport(spec, importTypeOnly)
    const { hook, toast, suppress, unknown } = routeAdminMutationSymbols(symbols)
    if (unknown.length) {
      const names = unknown.map((s) => s.name).join(", ")
      throw new Error(
        `[normalize-sync-imports] symbol không map được từ use-admin-mutation: ${names}`,
      )
    }

    const lines = []
    if (hook.length) {
      lines.push(formatNamedImport(hook, "@ui/hooks/use-admin-mutation"))
    }
    if (toast.length) {
      lines.push(formatNamedImport(toast, "@ui/lib/admin-operation-toast"))
    }
    if (suppress.length) {
      lines.push(formatNamedImport(suppress, "@ui/lib/admin-toast-suppress"))
    }
    return lines.join("\n")
  })
}

/** @param {string} content */
function normalizeSyncImports(content) {
  let out = normalizeUiImportsInSource(content)

  if (ADMIN_MUTATION_BARREL.test(out)) {
    out = rewriteAdminMutationBarrelImports(out)
  }

  return out
}

module.exports = { normalizeSyncImports, ADMIN_MUTATION_BARREL }
