import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tablesDir = path.join(root, "apps", "backend", "src", "app");

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith("-table.tsx") || name === "event-registrations-live-table.tsx")
      files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(tablesDir)) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  const templateMatch = text.match(
    /buildAdminTableXlsxExport\(\s*["']([^"']+)["']/,
  );
  if (!templateMatch) continue;
  const scope = templateMatch[1];

  if (!text.includes("tableScope=")) {
    text = text.replace(
      /<AdminDataTable[^(]*\n/,
      (m) => m.replace(/<AdminDataTable/, `<AdminDataTable\n      tableScope="${scope}"`),
    );
    if (!text.includes(`tableScope="${scope}"`)) {
      text = text.replace(
        "<AdminDataTable",
        `<AdminDataTable\n      tableScope="${scope}"`,
      );
    }
  }

  text = text.replace(
    /\s*filterColumnVisibilityKey="[^"]*"\n/g,
    "\n",
  );
  text = text.replace(
    /\s*tableColumnVisibilityKey="[^"]*"\n/g,
    "\n",
  );

  if (text !== original) {
    fs.writeFileSync(file, text);
    changed += 1;
    console.log("updated:", path.relative(root, file));
  }
}

console.log(`Done. ${changed} table file(s) updated.`);
