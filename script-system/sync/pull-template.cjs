/**
 * Kéo lớp kế thừa từ mono-repo-template (packages, script-system, docs pattern, …).
 *
 * Downstream repo (role !== upstream):
 *   pnpm pull:template
 *   pnpm pull:template --ref v1.0.0
 *   pnpm pull:template --dry-run
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
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--dry-run") dryRun = true
    else if (arg === "--ref" && argv[i + 1]) ref = argv[++i]
  }
  return { ref, dryRun }
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
        "  Downstream: clone repo sản phẩm → pnpm pull:template\n" +
        "  Doc: docs/TEMPLATE_MONOREPO.md",
    )
    return
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
    console.log("[pull:template] Chạy tiếp: pnpm install && pnpm check")
  }
}

const { ref, dryRun } = parseArgs(process.argv.slice(2))
console.log("[pull:template] mono-repo-template inheritance\n")
pullTemplate({ ref, dryRun })
