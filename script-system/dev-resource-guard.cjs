/**
 * Giám sát CPU/GPU khi chạy dev stack — vượt ngưỡng liên tục thì dừng stack + báo lỗi.
 *
 * Bật mặc định qua dev-stack.cjs. Tắt: HUB_DEV_RESOURCE_GUARD=0
 *
 * Env:
 *   HUB_DEV_CPU_LIMIT_PERCENT   — mặc định 92
 *   HUB_DEV_GPU_LIMIT_PERCENT   — mặc định 88
 *   HUB_DEV_RESOURCE_INTERVAL_MS — mặc định 8000
 *   HUB_DEV_RESOURCE_STRIKES    — số lần vượt ngưỡng liên tiếp (mặc định 4)
 *   HUB_DEV_RESOURCE_GRACE_MS   — không giám sát lúc compile ban đầu (mặc định 90000)
 *   HUB_DEV_GPU_GUARD           — 0 = chỉ CPU (khi không đọc được GPU)
 */

const { execFile } = require("child_process")
const { promisify } = require("util")
const os = require("os")

const execFileAsync = promisify(execFile)

const IS_WIN = process.platform === "win32"
const IS_LINUX = process.platform === "linux"
const IS_DARWIN = process.platform === "darwin"

function envNum(name, fallback) {
  const n = Number(process.env[name])
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function envFlag(name, fallback = true) {
  const v = process.env[name]
  if (v === undefined || v === "") return fallback
  return v !== "0" && v.toLowerCase() !== "false"
}

function readConfig() {
  return {
    enabled: envFlag("HUB_DEV_RESOURCE_GUARD", false),
    cpuLimit: envNum("HUB_DEV_CPU_LIMIT_PERCENT", 92),
    gpuLimit: envNum("HUB_DEV_GPU_LIMIT_PERCENT", 88),
    intervalMs: envNum("HUB_DEV_RESOURCE_INTERVAL_MS", 8000),
    strikes: envNum("HUB_DEV_RESOURCE_STRIKES", 4),
    graceMs: envNum("HUB_DEV_RESOURCE_GRACE_MS", 90_000),
    gpuGuard: envFlag("HUB_DEV_GPU_GUARD", true),
  }
}

/** @returns {Promise<number | null>} */
async function sampleCpuPercent() {
  if (IS_WIN) {
    const ps = [
      "(Get-Counter '\\Processor(_Total)\\% Processor Time'",
      "-SampleInterval 1 -MaxSamples 1).CounterSamples.CookedValue",
    ].join(" ")
    try {
      const { stdout } = await execFileAsync(
        "powershell",
        ["-NoProfile", "-Command", ps],
        { timeout: 15_000, windowsHide: true },
      )
      const v = Number(String(stdout).trim())
      return Number.isFinite(v) ? Math.round(v) : null
    } catch {
      return null
    }
  }

  if (IS_LINUX || IS_DARWIN) {
    try {
      const { stdout } = await execFileAsync("sh", ["-c", "ps -A -o %cpu | awk '{s+=$1} END {print s}'"], {
        timeout: 10_000,
      })
      const cores = os.cpus().length || 1
      const v = Number(String(stdout).trim()) / cores
      return Number.isFinite(v) ? Math.min(100, Math.round(v)) : null
    } catch {
      return null
    }
  }

  return null
}

/** @returns {Promise<number | null>} */
async function sampleGpuPercentNvidia() {
  try {
    const { stdout } = await execFileAsync(
      "nvidia-smi",
      [
        "--query-gpu=utilization.gpu",
        "--format=csv,noheader,nounits",
      ],
      { timeout: 10_000, windowsHide: true },
    )
    const lines = String(stdout)
      .trim()
      .split(/\r?\n/)
      .map((l) => Number(l.trim()))
      .filter((n) => Number.isFinite(n))
    if (!lines.length) return null
    return Math.round(Math.max(...lines))
  } catch {
    return null
  }
}

/** @returns {Promise<number | null>} */
async function sampleGpuPercentWindows() {
  const ps = [
    "$s = Get-Counter '\\GPU Engine(*engtype_3D)\\Utilization Percentage'",
    "-ErrorAction SilentlyContinue;",
    "if ($s) {",
    "  ($s.CounterSamples | Measure-Object -Property CookedValue -Maximum).Maximum",
    "} else { $null }",
  ].join(" ")
  try {
    const { stdout } = await execFileAsync(
      "powershell",
      ["-NoProfile", "-Command", ps],
      { timeout: 15_000, windowsHide: true },
    )
    const v = Number(String(stdout).trim())
    return Number.isFinite(v) ? Math.round(v) : null
  } catch {
    return null
  }
}

/** @returns {Promise<{ cpu: number | null; gpu: number | null; gpuAvailable: boolean }>} */
async function sampleUsage() {
  const cpu = await sampleCpuPercent()
  let gpu = null
  let gpuAvailable = false

  if (IS_WIN) {
    gpu = await sampleGpuPercentNvidia()
    if (gpu !== null) {
      gpuAvailable = true
    } else {
      gpu = await sampleGpuPercentWindows()
      gpuAvailable = gpu !== null
    }
  } else if (IS_LINUX || IS_DARWIN) {
    gpu = await sampleGpuPercentNvidia()
    gpuAvailable = gpu !== null
  }

  return { cpu, gpu, gpuAvailable }
}

/**
 * @param {{ stackName?: string; onTrip: (report: {
 *   reason: 'cpu' | 'gpu' | 'both';
 *   cpu: number | null;
 *   gpu: number | null;
 *   cpuLimit: number;
 *   gpuLimit: number;
 *   strikes: number;
 *   message: string;
 * }) => void }} options
 * @returns {() => void}
 */
function startResourceGuard(options) {
  const cfg = readConfig()
  if (!cfg.enabled) {
    return () => {}
  }

  const startedAt = Date.now()
  let cpuStrikes = 0
  let gpuStrikes = 0
  let gpuWarned = false
  let stopped = false
  let ticking = false

  const stackLabel = options.stackName ? ` [${options.stackName}]` : ""

  console.log(
    `[dev-resource-guard]${stackLabel} CPU≤${cfg.cpuLimit}%` +
      (cfg.gpuGuard ? ` · GPU≤${cfg.gpuLimit}%` : " · GPU off") +
      ` · grace ${Math.round(cfg.graceMs / 1000)}s · mỗi ${cfg.intervalMs / 1000}s`,
  )

  const timer = setInterval(async () => {
    if (stopped || ticking) return
    ticking = true
    try {
      if (Date.now() - startedAt < cfg.graceMs) {
        return
      }

      const { cpu, gpu, gpuAvailable } = await sampleUsage()

      if (cfg.gpuGuard && !gpuAvailable && !gpuWarned) {
        gpuWarned = true
        console.warn(
          "[dev-resource-guard] Không đọc được GPU — chỉ giám sát CPU (hoặc cài nvidia-smi).",
        )
      }

      const cpuHigh = cpu !== null && cpu >= cfg.cpuLimit
      const gpuHigh =
        cfg.gpuGuard && gpuAvailable && gpu !== null && gpu >= cfg.gpuLimit

      cpuStrikes = cpuHigh ? cpuStrikes + 1 : 0
      gpuStrikes = gpuHigh ? gpuStrikes + 1 : 0

      if (cpuStrikes >= cfg.strikes || gpuStrikes >= cfg.strikes) {
        stopped = true
        clearInterval(timer)

        const reason =
          cpuStrikes >= cfg.strikes && gpuStrikes >= cfg.strikes
            ? "both"
            : cpuStrikes >= cfg.strikes
              ? "cpu"
              : "gpu"

        const parts = []
        if (cpu !== null) parts.push(`CPU ${cpu}% (ngưỡng ${cfg.cpuLimit}%)`)
        if (gpu !== null) parts.push(`GPU ${gpu}% (ngưỡng ${cfg.gpuLimit}%)`)

        const message = [
          "Dev stack đã dừng: tài nguyên hệ thống vượt ngưỡng an toàn.",
          parts.join(" · "),
          `Vượt ngưỡng ${cfg.strikes} lần liên tiếp (~${Math.round((cfg.strikes * cfg.intervalMs) / 1000)}s).`,
          "Gợi ý: đóng app nặng GPU, dùng HUB_DEV_USE_WEBPACK=1, giảm stack (pnpm dev:main),",
          "hoặc tăng ngưỡng HUB_DEV_CPU_LIMIT_PERCENT / HUB_DEV_GPU_LIMIT_PERCENT.",
          "Tắt guard: HUB_DEV_RESOURCE_GUARD=0",
        ].join("\n")

        options.onTrip({
          reason,
          cpu,
          gpu,
          cpuLimit: cfg.cpuLimit,
          gpuLimit: cfg.gpuLimit,
          strikes: cfg.strikes,
          message,
        })
      }
    } catch (err) {
      console.warn(
        `[dev-resource-guard] Lỗi lấy mẫu: ${err instanceof Error ? err.message : err}`,
      )
    } finally {
      ticking = false
    }
  }, cfg.intervalMs)

  if (typeof timer.unref === "function") timer.unref()

  return () => {
    stopped = true
    clearInterval(timer)
  }
}

module.exports = { startResourceGuard, readConfig, sampleUsage }
