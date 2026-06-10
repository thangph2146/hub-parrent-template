import { execSync } from "child_process";

if (process.env.HUB_DEV_SKIP_PORT_KILL === "1") {
  console.log("[kill-ports] skip (HUB_DEV_SKIP_PORT_KILL=1)");
  process.exit(0);
}

const ports = process.argv.slice(2).map(Number).filter(Boolean);

for (const port of ports) {
  try {
    const output = execSync(
      `netstat -ano | findstr "LISTENING" | findstr ":${port} "`,
      { encoding: "utf8", shell: true },
    );

    const pids = [
      ...new Set(
        output
          .split("\n")
          .map((l) => l.trim().split(/\s+/).pop())
          .filter((pid) => pid && pid !== "0" && /^\d+$/.test(pid)),
      ),
    ];

    if (pids.length === 0) {
      console.log(`No process on port ${port}`);
      continue;
    }

    for (const pid of pids) {
      execSync(`taskkill /F /PID ${pid}`, { encoding: "utf8", shell: true });
      console.log(`Killed process on port ${port} (PID ${pid})`);
    }
  } catch {
    console.log(`No process on port ${port}`);
  }
}
