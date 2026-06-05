import fs from "node:fs";
import path from "node:path";

const base = path.join("apps", "backend", "src", "app");

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith("-table.tsx")) files.push(full);
  }
  return files;
}

let fixed = 0;
for (const file of walk(base)) {
  let text = fs.readFileSync(file, "utf8");
  const next = text.replace(
    /<AdminDataTable\s*\n\s*tableScope="([^"]+)"<([^>]+)>/g,
    '<AdminDataTable<$2>\n      tableScope="$1"',
  );
  if (next !== text) {
    fs.writeFileSync(file, next);
    fixed += 1;
    console.log("fixed:", file);
  }
}
console.log(`Done. ${fixed} file(s) fixed.`);
