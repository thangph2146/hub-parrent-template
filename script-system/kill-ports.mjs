import { execSync } from "child_process";

const ports = process.argv.slice(2).map(Number).filter(Boolean);

for (const port of ports) {
  try {
    const pid = execSync(
      `netstat -ano | findstr "LISTENING" | findstr ":${port} "`,
      { encoding: "utf8", shell: true },
    )
      .split("\n")
      .map((l) => l.trim().split(/\s+/).pop())
      .filter(Boolean)
      .shift();

    if (pid) {
      execSync(`taskkill /F /PID ${pid}`, { encoding: "utf8", shell: true });
      console.log(`Killed process on port ${port} (PID ${pid})`);
    }
  } catch {
    console.log(`No process on port ${port}`);
  }
}
