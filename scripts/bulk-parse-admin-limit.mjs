import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiSrc = path.join(root, "apps", "api", "src");

const IMPORT_LINE =
  "import { parseAdminListLimit } from '../common/parse-list-query';";
const IMPORT_LINE_DEPTH2 =
  "import { parseAdminListLimit } from '../../common/parse-list-query';";

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith(".controller.ts") || name.endsWith(".service.ts"))
      files.push(full);
  }
  return files;
}

const patterns = [
  [
    /Math\.min\(100,\s*Math\.max\(1,\s*parseInt\(String\(limit\),\s*10\)\s*\|\|\s*10\)\)/g,
    "parseAdminListLimit(limit, 10)",
  ],
  [
    /Math\.min\(100,\s*Math\.max\(1,\s*parseInt\(String\(limit\),\s*10\)\s*\|\|\s*50\)\)/g,
    "parseAdminListLimit(limit, 50)",
  ],
  [
    /Math\.min\(100,\s*Math\.max\(1,\s*parseInt\(query\.limit,\s*10\)\s*\|\|\s*20\)\)/g,
    "parseAdminListLimit(query.limit, 20)",
  ],
  [
    /limit:\s*Math\.min\(100,\s*Math\.max\(1,\s*parseInt\(String\(limit\),\s*10\)\s*\|\|\s*10\)\)/g,
    "limit: parseAdminListLimit(limit, 10)",
  ],
  [
    /limit:\s*Math\.min\(100,\s*Math\.max\(1,\s*parseInt\(String\(limit\),\s*10\)\s*\|\|\s*50\)\)/g,
    "limit: parseAdminListLimit(limit, 50)",
  ],
  [
    /const limit = Math\.min\(100,\s*Math\.max\(1,\s*params\.limit\)\)/g,
    "const limit = parseAdminListLimit(params.limit, 20)",
  ],
];

let changed = 0;
for (const file of walk(apiSrc)) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  for (const [re, repl] of patterns) {
    text = text.replace(re, repl);
  }
  if (text === original) continue;

  if (!text.includes("parseAdminListLimit")) continue;

  if (!text.includes("parse-list-query")) {
    const depth = file.includes(path.sep + "src" + path.sep)
      ? file.split(path.sep).length - apiSrc.split(path.sep).length
      : 1;
    const importLine =
      file.replace(apiSrc, "").split(path.sep).filter(Boolean).length > 2
        ? IMPORT_LINE_DEPTH2
        : IMPORT_LINE;
    const lastImport = text.lastIndexOf("import ");
    const lineEnd = text.indexOf("\n", lastImport);
    text =
      text.slice(0, lineEnd + 1) +
      importLine +
      "\n" +
      text.slice(lineEnd + 1);
  }

  fs.writeFileSync(file, text);
  changed += 1;
  console.log("updated:", path.relative(root, file));
}

console.log(`Done. ${changed} file(s) updated.`);
