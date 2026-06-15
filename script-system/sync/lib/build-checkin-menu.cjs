/**
 * Dựng menu check-in từ BACKEND_ADMIN_MENU_ITEMS — giữ thứ tự gốc, lọc href, thay native group.
 */

function normalizeMenuLabel(label) {
  return String(label)
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function stripNativeMeta(native) {
  const { insertAfter, replaceLabel, ...group } = native
  return group
}

function findNativeReplacement(label, nativeGroups) {
  const norm = normalizeMenuLabel(label)
  for (const raw of nativeGroups) {
    if (raw.replaceLabel && normalizeMenuLabel(raw.replaceLabel) === norm) {
      return stripNativeMeta(raw)
    }
  }
  return null
}

function buildIncludeHrefs(config, moduleToHref) {
  const hrefs = new Set(config.menu?.alwaysIncludeHrefs ?? ["/", "/events"])
  for (const mod of config.modules ?? []) {
    hrefs.add(moduleToHref(mod))
  }
  for (const ex of config.menu?.excludeHrefs ?? []) {
    hrefs.delete(ex)
  }
  return hrefs
}

/** Menu con của module (vd. /hanet/ket-noi khi module hanet có trong config). */
function isCheckinHrefIncluded(href, includeHrefs, config, moduleToHref) {
  if (includeHrefs.has(href)) return true
  for (const mod of config.modules ?? []) {
    const base = moduleToHref(mod)
    if (href === base || href.startsWith(`${base}/`)) return true
  }
  return false
}

function remapHref(href, overrides) {
  if (Object.prototype.hasOwnProperty.call(overrides, href)) {
    return overrides[href]
  }
  if (href === "/") return "/admin/tong-quan"
  return `/admin${href}`
}

function remapNativeGroup(group, overrides) {
  return {
    ...group,
    children: group.children.map((c) => ({
      ...c,
      href:
        typeof c.href === "string" && c.href.startsWith("/admin")
          ? c.href
          : remapHref(c.href, overrides),
    })),
  }
}

function applyAppendToGroup(menu, config) {
  const appendToGroup = config.menu?.appendToGroup ?? {}
  return menu.map((item) => {
    if (item.type !== "group") return item
    const extra = appendToGroup[item.label]
    if (!extra?.length) return item
    return { ...item, children: [...item.children, ...extra] }
  })
}

function buildCheckinMenu(mainItems, config, moduleToHref) {
  const includeHrefs = buildIncludeHrefs(config, moduleToHref)
  const overrides = config.menu?.hrefOverrides ?? {
    "/": "/admin/tong-quan",
    "/events": "/admin",
  }
  const nativeGroups = config.menu?.nativeGroups ?? []
  const out = []

  for (const item of mainItems) {
    if (item.type === "leaf") {
      if (!includeHrefs.has(item.href)) continue
      out.push({ ...item, href: remapHref(item.href, overrides) })
      continue
    }

    const replacement = findNativeReplacement(item.label, nativeGroups)
    if (replacement) {
      out.push(remapNativeGroup(replacement, overrides))
      continue
    }

    const children = item.children
      .filter((c) => isCheckinHrefIncluded(c.href, includeHrefs, config, moduleToHref))
      .map((c) => ({ ...c, href: remapHref(c.href, overrides) }))
    if (children.length === 0) continue
    out.push({ ...item, children })
  }

  return applyAppendToGroup(out, config)
}

/** Kiểm tra thứ tự nhãn check-in không đảo so với main (theo index gốc). */
function verifyMenuOrderAgainstMain(mainItems, checkinMenu, config) {
  const errors = []
  const nativeGroups = config.menu?.nativeGroups ?? []
  const replacementMainLabels = new Map(
    nativeGroups
      .filter((n) => n.replaceLabel)
      .map((n) => [normalizeMenuLabel(n.label), normalizeMenuLabel(n.replaceLabel)]),
  )

  const mainIndexByLabel = new Map()
  mainItems.forEach((item, idx) => {
    mainIndexByLabel.set(normalizeMenuLabel(item.label), idx)
  })

  let lastMainIdx = -1
  for (const item of checkinMenu) {
    let norm = normalizeMenuLabel(item.label)
    if (replacementMainLabels.has(norm)) {
      norm = replacementMainLabels.get(norm)
    }
    const mainIdx = mainIndexByLabel.get(norm)
    if (mainIdx === undefined) {
      errors.push(`menu check-in có nhãn không map được main: "${item.label}"`)
      continue
    }
    if (mainIdx <= lastMainIdx) {
      errors.push(
        `thứ tự menu sai: "${item.label}" (main index ${mainIdx}) phải sau index ${lastMainIdx}`,
      )
    }
    lastMainIdx = mainIdx
  }

  return errors
}

module.exports = {
  buildCheckinMenu,
  buildIncludeHrefs,
  isCheckinHrefIncluded,
  normalizeMenuLabel,
  verifyMenuOrderAgainstMain,
}
