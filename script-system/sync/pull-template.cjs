/**
 * Kéo lớp kế thừa từ mono-repo-template (packages, script-system, docs pattern, …).
 *
 * Downstream repo (role !== upstream):
 *   pnpm pull:template
 *   pnpm pull:template --ref v1.0.0
 *   pnpm pull:template --dry-run
 *   pnpm pull:template --full     # pull + post-pull-downstream (install + line sync)
 *
 * Upstream (repo này): báo skip — đây là nguồn template.
 */
const fs = require("node:fs")
const path = require("node:path")
const { execFileSync, execSync } = require("node:child_process")

const { ROOT: SCRIPT_ROOT } = require("../lib/monorepo-root.cjs")

function resolveRepoRoot() {
  const cwd = process.cwd()
  if (fs.existsSync(path.join(cwd, "template.manifest.json"))) {
    return cwd
  }
  return SCRIPT_ROOT
}

const ROOT = resolveRepoRoot()
const MANIFEST_PATH = path.join(ROOT, "template.manifest.json")
const LOCK_PATH = path.join(ROOT, ".template-lock.json")

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("[pull:template] Thiếu template.manifest.json tại root repo.")
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
}

function parseArgs(argv) {
  let ref = null
  let dryRun = false
  let postSync = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--dry-run") dryRun = true
    else if (arg === "--post-sync" || arg === "--full") postSync = true
    else if (arg === "--ref" && argv[i + 1]) ref = argv[++i]
  }
  return { ref, dryRun, postSync }
}

function runGit(args, { dryRun = false, label } = {}) {
  const cmd = `git ${args.join(" ")}`
  if (label) console.log(`\n[pull:template] ${label}\n`)
  if (dryRun) {
    console.log(`[pull:template] dry-run: ${cmd}`)
    return ""
  }
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim()
}

function listRemotes() {
  const out = runGit(["remote"], { label: "" })
  return out ? out.split(/\r?\n/).filter(Boolean) : []
}

function ensureTemplateRemote(manifest, dryRun) {
  const name = manifest.remoteName ?? "template"
  const url = manifest.defaultRemote
  const remotes = listRemotes()
  if (remotes.includes(name)) return name
  console.log(`[pull:template] Thêm remote ${name} → ${url}`)
  runGit(["remote", "add", name, url], { dryRun, label: `remote add ${name}` })
  return name
}

function pathIsKept(relPath, keepPaths) {
  const norm = relPath.replace(/\\/g, "/")
  return keepPaths.some(
    (k) => norm === k || norm.startsWith(`${k}/`),
  )
}

function pullTemplate({ ref, dryRun }) {
  const manifest = loadManifest()

  if (manifest.role === "upstream") {
    console.log(
      "[pull:template] Repo upstream (template) — không pull chính mình.\n" +
        "  Sửa packages/* + script-system → pnpm check → pnpm push\n" +
        "  Downstream: pnpm sync (sau khi upstream đã push main)\n" +
        "  Doc: docs/TEMPLATE_MONOREPO.md",
    )
    return null
  }

  const remote = ensureTemplateRemote(manifest, dryRun)
  const resolvedRef = ref ?? manifest.defaultRef ?? "main"

  runGit(["fetch", remote, resolvedRef], {
    dryRun,
    label: `fetch ${remote} ${resolvedRef}`,
  })

  const rev = dryRun
    ? "DRYRUN"
    : runGit(["rev-parse", `${remote}/${resolvedRef}`], {
        label: `resolve ${remote}/${resolvedRef}`,
      })

  const keepPaths = manifest.keepPaths ?? ["apps"]
  const paths = [
    ...(manifest.inheritPaths ?? []),
    ...(manifest.inheritRootFiles ?? []),
  ]

  if (manifest.library?.pullMode === "full") {
    console.log("[pull:template] Chế độ full library — packages/ được checkout nguyên cây")
  }

  console.log(`\n[pull:template] Checkout ${paths.length} path từ ${rev}\n`)

  for (const p of paths) {
    if (pathIsKept(p, keepPaths)) {
      console.log(`[pull:template] skip (keep): ${p}`)
      continue
    }
    if (!dryRun && !fs.existsSync(path.join(ROOT, p)) && !p.includes(".")) {
      fs.mkdirSync(path.join(ROOT, p), { recursive: true })
    }
    runGit(["checkout", `${remote}/${resolvedRef}`, "--", p], {
      dryRun,
      label: `checkout ${p}`,
    })
  }

  const lock = {
    templateId: manifest.id,
    remote,
    ref: resolvedRef,
    revision: rev,
    pulledAt: new Date().toISOString(),
  }

  if (dryRun) {
    console.log("[pull:template] dry-run: ghi .template-lock.json")
  } else {
    fs.writeFileSync(LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`, "utf8")
    console.log(`\n[pull:template] Đã ghi ${path.relative(ROOT, LOCK_PATH)}`)
    console.log(
      "[pull:template] Bước 2: pnpm sync\n" +
        "  (= post-pull: install + build:packages + sync theo productLine)\n" +
        "  Hoặc: node script-system/sync/post-pull-downstream.cjs",
    )
  }

  return manifest
}

function runPostPull({ dryRun }) {
  if (dryRun) {
    console.log("[pull:template] dry-run: post-pull-downstream.cjs")
    return
  }
  execFileSync(
    process.execPath,
    [path.join(ROOT, "script-system/sync/post-pull-downstream.cjs")],
    { cwd: ROOT, stdio: "inherit" },
  )
}

const { ref, dryRun, postSync } = parseArgs(process.argv.slice(2))
console.log("[pull:template] mono-repo-template inheritance\n")
const manifest = pullTemplate({ ref, dryRun })
if (postSync && manifest?.role === "downstream") {
  runPostPull({ dryRun })
}
