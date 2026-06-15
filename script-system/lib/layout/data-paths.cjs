/**

 * Đường dẫn chuẩn data/ tại monorepo root — dùng cho verify + db scripts.

 */

const fs = require("node:fs");

const path = require("node:path");

const { ROOT } = require("../monorepo-root.cjs");



const SEED_EXPORT_BASENAMES = [

  "full-export-2026-06-10.json",

  "full-export-2026-05-14.json",

];



const DATA_SUBDIRS = ["seed", "exports", "local"];



function dataDir(...segments) {

  return path.join(ROOT, "data", ...segments);

}



function listSeedExportCandidates() {

  return SEED_EXPORT_BASENAMES.map((name) => dataDir("seed", name));

}



function findSeedExportOnDisk() {

  for (const candidate of listSeedExportCandidates()) {

    if (fs.existsSync(candidate)) return candidate;

  }

  return null;

}



module.exports = {

  ROOT,

  DATA_SUBDIRS,

  SEED_EXPORT_BASENAMES,

  dataDir,

  listSeedExportCandidates,

  findSeedExportOnDisk,

};

