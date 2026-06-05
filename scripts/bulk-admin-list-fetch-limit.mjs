import fs from "node:fs";
import path from "node:path";

const backendSrc = path.join("apps", "backend", "src");

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(name)) files.push(full);
  }
  return files;
}

const IMPORT =
  'import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list";\n';

let changed = 0;
for (const file of walk(backendSrc)) {
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("limit: 100") && !text.includes("const limit = 100")) continue;

  const original = text;
  text = text.replace(/\blimit: 100\b/g, "limit: ADMIN_LIST_EXPORT_FETCH_LIMIT");
  text = text.replace(/const limit = 100;/g, "const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT;");

  if (text === original) continue;
  if (!text.includes("ADMIN_LIST_EXPORT_FETCH_LIMIT")) continue;

  if (!text.includes('from "@/lib/fetch-all-admin-list"')) {
    const idx = text.indexOf("\n");
    text = text.slice(0, idx + 1) + IMPORT + text.slice(idx + 1);
  }

  fs.writeFileSync(file, text);
  changed += 1;
  console.log("updated:", file);
}

console.log(`Done. ${changed} file(s) updated.`);
