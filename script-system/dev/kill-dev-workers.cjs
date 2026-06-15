/**
 * Dọn process dev zombie (turbo / nest / next / tsup) — không đụng Cursor/IDE.
 *
 * Usage:
 *   node script-system/kill-dev-workers.cjs          # dev stack + port
 *   node script-system/kill-dev-workers.cjs --mcp    # thêm MCP plugin zombie (mongodb×N, prisma, firebase)
 *   node script-system/kill-dev-workers.cjs --ports-only
 */
const { execSync, spawnSync } = require("node:child_process");
const path = require("node:path");

const { ROOT } = require("../lib/monorepo-root.cjs");
const ROOT_NORM = ROOT.replace(/\\/g, "/").toLowerCase();
const portsOnly = process.argv.includes("--ports-only");
const killMcp = process.argv.includes("--mcp");
const IS_WIN = process.platform === "win32";

const DEV_PORTS = [3000, 3001, 3002];

/** Command line khớp → coi là worker dev monorepo (an toàn kill). */
const DEV_PATTERNS = [
  /nest\s+start/i,
  /nest-cli/i,
  /@nestjs\/cli/i,
  /\bnext\s+dev\b/i,
  /next-dev\.cjs/i,
  /tsup\s+--watch/i,
  /\bturbo(\.exe)?\b/i,
  /dev-stack\.cjs/i,
  /dev-next\.cjs/i,
  /dev-prep-next\.cjs/i,
  /dev-prep-api\.cjs/i,
  /wait-api-port/i,
  /ensure-dist\.mjs/i,
  /pnpm\.cjs.*\bdev\b/i,
  /node_modules[\\/]\.pnpm[\\/].*turbo/i,
];

/** MCP plugin Cursor — không cần cho pnpm dev:* (thường bị spawn trùng). */
const MCP_PATTERNS = [
  /mongodb-mcp-server/i,
  /prisma[\\/].*mcp/i,
  /firebase-tools/i,
];

/** Không kill process IDE / language service. */
const SKIP_PATTERNS = [
  /cursor[\\/]resources[\\/]helpers[\\/]node\.exe/i,
  /tsserver/i,
  /typescript.*language/i,
  /eslint.*server/i,
  /prettier.*server/i,
  /vite.*language/i,
  /graphify/i,
];

function killPorts() {
  const killPortsScript = path.join(__dirname, "kill-ports.cjs");
  execSync(`node "${killPortsScript}" ${DEV_PORTS.join(" ")}`, {
    cwd: ROOT,
    stdio: "inherit",
    shell: IS_WIN,
  });
}

function killTurboExe() {
  if (!IS_WIN) return;
  try {
    execSync("taskkill /F /IM turbo.exe /T", { stdio: "pipe", shell: true });
    console.log("[kill-dev] đã dừng turbo.exe");
  } catch {
    /* không chạy */
  }
}

function listNodeProcessesWin() {
  const ps = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      "Get-CimInstance Win32_Process -Filter \"name = 'node.exe'\" | Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress",
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (ps.status !== 0 || !ps.stdout?.trim()) return [];
  try {
    const parsed = JSON.parse(ps.stdout.trim());
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

function shouldKillDev(cmd) {
  const line = (cmd || "").replace(/\\/g, "/");
  const lower = line.toLowerCase();
  if (!lower.includes("hub-parent-template")) return false;
  if (SKIP_PATTERNS.some((re) => re.test(line))) return false;
  return DEV_PATTERNS.some((re) => re.test(line));
}

function shouldKillMcp(cmd) {
  const line = cmd || "";
  if (SKIP_PATTERNS.some((re) => re.test(line))) return false;
  return MCP_PATTERNS.some((re) => re.test(line));
}

function killDevNodeWorkers() {
  if (!IS_WIN) {
    console.log("[kill-dev] kill node workers: chỉ hỗ trợ Windows đầy đủ; đã kill port.");
    return;
  }

  const processes = listNodeProcessesWin();
  let killed = 0;
  for (const proc of processes) {
    const pid = Number(proc.ProcessId);
    const cmd = proc.CommandLine || "";
    if (!pid || !shouldKillDev(cmd)) continue;
    try {
      execSync(`taskkill /F /PID ${pid} /T`, { stdio: "pipe", shell: true });
      console.log(`[kill-dev] dev node PID ${pid}`);
      killed++;
    } catch {
      /* đã thoát */
    }
  }
  console.log(`[kill-dev] đã dừng ${killed} node worker dev`);
}

function killMcpWorkers() {
  if (!IS_WIN) return;
  const processes = listNodeProcessesWin();
  let killed = 0;
  for (const proc of processes) {
    const pid = Number(proc.ProcessId);
    const cmd = proc.CommandLine || "";
    if (!pid || !shouldKillMcp(cmd)) continue;
    try {
      execSync(`taskkill /F /PID ${pid} /T`, { stdio: "pipe", shell: true });
      const label = MCP_PATTERNS.find((re) => re.test(cmd))?.source || "mcp";
      console.log(`[kill-dev] mcp (${label}) PID ${pid}`);
      killed++;
    } catch {
      /* đã thoát */
    }
  }
  console.log(`[kill-dev] đã dừng ${killed} MCP plugin node`);
}

console.log("[kill-dev] dọn turbo / nest / next / tsup zombie…\n");
killTurboExe();
killPorts();
if (!portsOnly) {
  killDevNodeWorkers();
}
if (killMcp) {
  killMcpWorkers();
}
console.log("\n[kill-dev] xong.");
