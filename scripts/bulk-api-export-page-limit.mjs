import fs from "node:fs";
import path from "node:path";

const apiSrc = path.join("apps", "api", "src");

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith(".service.ts")) files.push(full);
  }
  return files;
}

const IMPORT =
  "import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';\n";
const IMPORT_DEPTH2 =
  "import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../../common/pagination';\n";

let changed = 0;
for (const file of walk(apiSrc)) {
  let text = fs.readFileSync(file, "utf8");
  const next = text.replace(
    /normalizePageLimit\(\s*([\s\S]*?),\s*100\s*,?\s*\)/g,
    "normalizePageLimit($1, ADMIN_TABLE_EXPORT_MAX_LIMIT)",
  );
  if (next === text) continue;

  text = next;
  if (
    text.includes("ADMIN_TABLE_EXPORT_MAX_LIMIT") &&
    !text.includes("ADMIN_TABLE_EXPORT_MAX_LIMIT }")
  ) {
    const depth = file.split(path.sep).length - apiSrc.split(path.sep).length;
    const line =
      depth > 2 ? IMPORT_DEPTH2 : IMPORT.replace("../common", "../common");
    const lastImportIdx = text.lastIndexOf("\nimport ");
    const insertAt = text.indexOf("\n", lastImportIdx + 1);
    text = text.slice(0, insertAt + 1) + line + text.slice(insertAt + 1);
  }

  fs.writeFileSync(file, text);
  changed += 1;
  console.log("updated:", file);
}

console.log(`Done. ${changed} service(s) updated.`);
