const path = require("node:path")

const PACKAGE_ROOT = path.resolve(__dirname, "../../..")
const ROOT = path.resolve(PACKAGE_ROOT, "../..")

module.exports = { PACKAGE_ROOT, ROOT }
