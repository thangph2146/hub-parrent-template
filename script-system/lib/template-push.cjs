/**
 * Copy inheritPaths từ downstream → checkout mono-repo-template (upstream).
 */
const fs = require("node:fs")
const path = require("node:path")
const { execFileSync, execSync } = require("node:child_process")

const { ROOT } = require("./monorepo-root.cjs")

function loadManifest(root = ROOT) {
  const p = path.join(root, "template.manifest.json")
  if (!fs.existsSync(p)) {
    throw new Error("[push:template] Thiếu template.manifest.json")
  }
  return JSON.parse(fs.readFileSync(p, "utf8"))
}

function gitExec(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim()
}

function listTrackedPaths(repoRoot, relPath) {
  try {
    const out = gitExec(["ls-files", "--", relPath], repoRoot)
    return out ? out.split(/\r?\n/).filter(Boolean) : []
  } catch {
    return []
  }
}

function listUntrackedPaths(repoRoot, relPath) {
  try {
    const out = gitExec(
      ["ls-files", "--others", "--exclude-standard", "--", relPath],
      repoRoot,
    )
    return out ? out.split(/\r?\n/).filter(Boolean) : []
  } catch {
    return []
  }
}

function listPathsToSync(repoRoot, relPath) {
  return [
    ...new Set([
      ...listTrackedPaths(repoRoot, relPath),
      ...listUntrackedPaths(repoRoot, relPath),
    ]),
  ]
}

function ensureDirForFile(filePath, dryRun) {
  const dir = path.dirname(filePath)
  if (dryRun || fs.existsSync(dir)) return
  fs.mkdirSync(dir, { recursive: true })
}

function copyTrackedFile(sourceRoot, targetRoot, rel, dryRun) {
  const src = path.join(sourceRoot, rel)
  const dest = path.join(targetRoot, rel)
  if (!fs.existsSync(src)) return false
  ensureDirForFile(dest, dryRun)
  if (dryRun) {
    console.log(`[push:template] copy ${rel}`)
    return true
  }
  fs.copyFileSync(src, dest)
  return true
}

function inheritPathsToSync(manifest) {
  const keep = new Set(manifest.keepPaths ?? [])
  const paths = [
    ...(manifest.inheritPaths ?? []),
    ...(manifest.inheritRootFiles ?? []),
  ]
  return [...new Set(paths)].filter((p) => !keep.has(p))
}

function syncInheritPaths({ sourceRoot, targetRoot, manifest, dryRun }) {
  const paths = inheritPathsToSync(manifest)
  let copied = 0
  for (const rel of paths) {
    const files = listPathsToSync(sourceRoot, rel)
    if (files.length === 0) {
      const abs = path.join(sourceRoot, rel)
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        if (copyTrackedFile(sourceRoot, targetRoot, rel, dryRun)) copied += 1
      }
      continue
    }
    for (const file of files) {
      if (copyTrackedFile(sourceRoot, targetRoot, file, dryRun)) copied += 1
    }
  }
  return { paths, copied }
}

function resolveTemplateRoot(manifest) {
  const candidates = [
    process.env.TEMPLATE_REPO_PATH,
    manifest.templatePush?.localPath,
    "../monorepo-template",
    "../mono-repo-template",
  ].filter(Boolean)

  for (const candidate of candidates) {
    const abs = path.isAbsolute(candidate)
      ? candidate
      : path.resolve(ROOT, candidate)
    const manifestPath = path.join(abs, "template.manifest.json")
    if (!fs.existsSync(manifestPath)) continue
    const upstream = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    if (upstream.role === "upstream") {
      return { root: abs, manifest: upstream }
    }
  }

  throw new Error(
    "[push:template] Không tìm thấy repo mono-repo-template (role=upstream).\n" +
      "  Đặt TEMPLATE_REPO_PATH hoặc templatePush.localPath trong template.manifest.json\n" +
      "  Ví dụ: \"templatePush\": { \"localPath\": \"../monorepo-template\" }",
  )
}

function ensureMainBranch(repoRoot, label) {
  const branch = gitExec(["rev-parse", "--abbrev-ref", "HEAD"], repoRoot)
  if (branch !== "main") {
    throw new Error(`[${label}] Cần branch main (hiện tại: ${branch}).`)
  }
}

function gitStatusPorcelain(repoRoot) {
  return gitExec(["status", "--porcelain"], repoRoot)
}

function commitIfDirty(repoRoot, message, paths, dryRun, label) {
  if (!gitStatusPorcelain(repoRoot)) {
    console.log(`[${label}] Working tree sạch — bỏ qua commit.`)
    return false
  }
  if (!message?.trim()) {
    throw new Error(`[${label}] Cần commit message (-m hoặc positional).`)
  }
  console.log(`\n[${label}] Commit: ${message.trim()}\n`)
  if (dryRun) return true
  execFileSync("git", ["add", "--", ...paths], { cwd: repoRoot, stdio: "inherit" })
  execFileSync("git", ["commit", "-m", message.trim()], {
    cwd: repoRoot,
    stdio: "inherit",
  })
  return true
}

function pushOriginMain(repoRoot, dryRun, label) {
  console.log(`\n[${label}] Push origin main\n`)
  if (dryRun) {
    console.log(`[${label}] dry-run: git push origin main`)
    return
  }
  execFileSync("git", ["push", "origin", "main"], {
    cwd: repoRoot,
    stdio: "inherit",
  })
}

/**
 * @param {{ message?: string | null, dryRun?: boolean, skipCheck?: boolean }} options
 */
function pushTemplateToUpstream(options = {}) {
  const { message = null, dryRun = false, skipCheck = false } = options
  const manifest = loadManifest()

  if (manifest.role === "upstream") {
    console.log(
      "[push:template] Repo upstream — dùng pnpm push (script-system/git/commit-and-push.cjs).",
    )
    return { skipped: true }
  }

  if (manifest.role !== "downstream") {
    throw new Error(
      `[push:template] role=${manifest.role ?? "unknown"} — chỉ downstream hoặc upstream.`,
    )
  }

  const { root: templateRoot, manifest: upstreamManifest } =
    resolveTemplateRoot(manifest)
  const syncPaths = inheritPathsToSync(manifest)

  console.log(
    `[push:template] ${manifest.id ?? "downstream"} → ${upstreamManifest.id ?? "upstream"}\n` +
      `  source: ${ROOT}\n` +
      `  target: ${templateRoot}\n` +
      `  paths: ${syncPaths.length}`,
  )

  ensureMainBranch(templateRoot, "push:template")

  const { copied } = syncInheritPaths({
    sourceRoot: ROOT,
    targetRoot: templateRoot,
    manifest,
    dryRun,
  })
  console.log(`[push:template] Đã sync ${copied} file`)

  if (!skipCheck && manifest.templatePush?.runCheck !== false) {
    console.log("\n[push:template] pnpm check trên template upstream\n")
    if (dryRun) {
      console.log("[push:template] dry-run: pnpm check")
    } else {
      execSync("pnpm check", { cwd: templateRoot, stdio: "inherit" })
    }
  }

  commitIfDirty(templateRoot, message, syncPaths, dryRun, "push:template")
  pushOriginMain(templateRoot, dryRun, "push:template")

  console.log(
    "\n[push:template] Xong.\n" +
      "  Các downstream khác: pnpm pull:template",
  )

  return { templateRoot, syncPaths, copied }
}

module.exports = {
  loadManifest,
  inheritPathsToSync,
  syncInheritPaths,
  resolveTemplateRoot,
  ensureMainBranch,
  gitStatusPorcelain,
  commitIfDirty,
  pushOriginMain,
  pushTemplateToUpstream,
}
