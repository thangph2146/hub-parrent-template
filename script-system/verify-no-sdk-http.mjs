/**
 * Next apps không gọi StoreSyncSdk.http trực tiếp — chỉ resource API trong @workspace/api-client.
 *
 * Chạy: pnpm verify:sdk-http
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const NEXT_APPS = [
  "apps/frontend",
  "apps/store-sync-frontend",
  "apps/backend",
  "apps/hub-event-checkin-frontend",
];

const RAW_SDK_HTTP = /\b(api|apiClient|sdk)\.http\b/;

/** @param {string} dir @param {string[]} out */
function walkTs(dir, out) {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walkTs(p, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(ent.name)) out.push(p);
  }
}

function main() {
  const errors = [];

  for (const appRel of NEXT_APPS) {
    const src = join(root, appRel, "src");
    const files = [];
    walkTs(src, files);

    for (const file of files) {
      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) return;
        if (RAW_SDK_HTTP.test(line)) {
          errors.push(
            `${relative(root, file)}:${index + 1} — ${trimmed.slice(0, 120)}`,
          );
        }
      });
    }
  }

  if (errors.length) {
    console.error(
      "[verify-no-sdk-http] Phát hiện sdk.http trong Next app (dùng api.<resource> thay thế):\n",
    );
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }

  console.log("[verify-no-sdk-http] OK — không có sdk.http trong Next apps.");
}

main();
