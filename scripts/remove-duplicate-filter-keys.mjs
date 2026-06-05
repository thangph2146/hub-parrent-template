import fs from "node:fs";
import path from "node:path";

const targets = [
  "apps/backend/src/app",
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

let changed = 0;
for (const root of targets) {
  for (const file of walk(root)) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    const filtered = lines.filter(
      (line) => !/^\s*filterColumnVisibilityKey=/.test(line),
    );
    if (filtered.length === lines.length) continue;
    if (!lines.some((line) => /tableScope=/.test(line))) continue;
    fs.writeFileSync(file, filtered.join("\n"));
    changed += 1;
    console.log("cleaned:", file);
  }
}
console.log(`Done. ${changed} file(s) cleaned.`);
