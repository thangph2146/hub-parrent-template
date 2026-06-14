/**
 * Kiểm tra contract giữa `packages/api-client` và `apps/main/api` + `packages/api-server`.
 *
 * 1) Mọi path mà api-client gọi phải khớp prefix trong ADMIN_ROUTES / PUBLIC_ROUTES (main API).
 * 2) Các route mở rộng (ngoài CRUD chuẩn) phải có test contract trong api-server controller spec.
 *
 * Chạy: pnpm verify:api-contract
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ROOT: root } = require("../lib/paths.cjs");

const CLIENT_RESOURCES_DIR = join(root, "packages/api-client/src/resources");
const API_CONSTANTS_PATH = join(root, "apps/main/api/src/config/constants.ts");
const API_SERVER_MODULES_DIR = join(root, "packages/api-server/src/modules");

/** Route mở rộng: api-client path pattern → api-server controller spec phải cover. */
const EXTENDED_ROUTE_CONTRACTS = [
  {
    label: "event-registrations.setAttendance",
    clientSnippet: "/admin/event-registrations/",
    subPath: "/attendance",
    specFile: "event-registrations.controller.spec.ts",
    specMarkers: ["setAttendance", "/:id/attendance"],
  },
  {
    label: "orders.statusCounts",
    clientSnippet: "/admin/orders/staff/status-counts",
    specFile: "order.controller.spec.ts",
    specMarkers: ["statusCounts", "/staff/status-counts"],
  },
  {
    label: "orders.updateStatus",
    clientSnippet: "/admin/orders/",
    subPath: "/status",
    specFile: "order.controller.spec.ts",
    specMarkers: ["updateStatus", "/:id/status"],
  },
  {
    label: "categories.usage",
    clientSnippet: "/admin/categories/usage",
    specFile: "categories.controller.spec.ts",
    specMarkers: ["usage", "/usage"],
  },
  {
    label: "products.restore row",
    clientSnippet: "/admin/products/",
    subPath: "/restore",
    specFile: "product.controller.spec.ts",
    specMarkers: ["restoreRow", "row như apps/main/api"],
  },
];

function readApiRoutePrefixes() {
  if (!existsSync(API_CONSTANTS_PATH)) {
    throw new Error(`Missing ${API_CONSTANTS_PATH}`);
  }
  const src = readFileSync(API_CONSTANTS_PATH, "utf8");
  const prefixes = new Set(["auth/admin", "public"]);

  for (const block of ["ADMIN_ROUTES", "PUBLIC_ROUTES"]) {
    const re = new RegExp(`${block}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const`, "m");
    const m = src.match(re);
    if (!m) continue;
    for (const val of m[1].matchAll(/:\s*'([^']+)'/g)) {
      prefixes.add(val[1].replace(/^\/+/, ""));
    }
  }

  return prefixes;
}

function extractClientPaths() {
  const paths = new Set();
  for (const file of readdirSync(CLIENT_RESOURCES_DIR)) {
    if (!file.endsWith(".ts") || file.startsWith("_")) continue;
    const src = readFileSync(join(CLIENT_RESOURCES_DIR, file), "utf8");
    for (const m of src.matchAll(/["'`](\/(?:admin|public|auth)[^"'`]+)["'`]/g)) {
      let p = m[1];
      p = p.replace(/\$\{[^}]+\}/g, ":param");
      paths.add(p);
    }
  }
  return [...paths].sort();
}

function pathMatchesKnownPrefix(path, prefixes) {
  const normalized = path.replace(/^\/+/, "");
  for (const prefix of prefixes) {
    const p = prefix.replace(/^\/+/, "");
    if (normalized === p || normalized.startsWith(`${p}/`)) {
      return true;
    }
  }
  return false;
}

function findSpecFile(name) {
  const stack = [API_SERVER_MODULES_DIR];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === name) return full;
    }
  }
  return null;
}

function main() {
  const prefixes = readApiRoutePrefixes();
  const clientPaths = extractClientPaths();
  const unknown = clientPaths.filter((p) => !pathMatchesKnownPrefix(p, prefixes));

  let failed = false;

  if (unknown.length) {
    failed = true;
    console.error(
      `[verify-api-client-contract] FAIL — ${unknown.length} api-client path không khớp ADMIN_ROUTES/PUBLIC_ROUTES:`,
    );
    for (const p of unknown) console.error(`  - ${p}`);
  }

  for (const contract of EXTENDED_ROUTE_CONTRACTS) {
    const specPath = findSpecFile(contract.specFile);
    if (!specPath) {
      failed = true;
      console.error(
        `[verify-api-client-contract] FAIL — thiếu spec ${contract.specFile} cho ${contract.label}`,
      );
      continue;
    }
    const specSrc = readFileSync(specPath, "utf8");
    const missing = contract.specMarkers.filter((m) => !specSrc.includes(m));
    if (missing.length) {
      failed = true;
      console.error(
        `[verify-api-client-contract] FAIL — ${contract.label}: spec thiếu marker ${missing.join(", ")}`,
      );
    }
  }

  if (failed) {
    console.error(
      "\n[verify-api-client-contract] FAIL — cập nhật api-server controller hoặc api-client cho khớp.",
    );
    process.exit(1);
  }

  console.log(
    `[verify-api-client-contract] OK — ${clientPaths.length} api-client paths · ${prefixes.size} route prefixes · ${EXTENDED_ROUTE_CONTRACTS.length} extended contracts`,
  );
}

main();
