/** Log dev — tắt: HUB_DEV_LOG=quiet */
const useColor =
  process.stdout.isTTY === true && process.env.NO_COLOR === undefined

/** @param {string} s */
function dim(s) {
  return useColor ? `\x1b[2m${s}\x1b[0m` : s
}

/** @param {string} s */
function cyan(s) {
  return useColor ? `\x1b[36m${s}\x1b[0m` : s
}

/** @param {string} s */
function green(s) {
  return useColor ? `\x1b[32m${s}\x1b[0m` : s
}

/** @param {string} s */
function bold(s) {
  return useColor ? `\x1b[1m${s}\x1b[0m` : s
}

function pkgLabel() {
  return process.env.npm_package_name || "app"
}

function isQuiet() {
  return process.env.HUB_DEV_LOG === "quiet"
}

function stackPrepQuiet() {
  return (
    process.env.HUB_DEV_SKIP_PORT_KILL === "1" &&
    process.env.HUB_DEV_SKIP_NEXT_CLEAN === "1"
  )
}

function shouldPrintPrep() {
  return !isQuiet() && !stackPrepQuiet()
}

function prepHeader(title) {
  if (!shouldPrintPrep()) return
  console.log(`${dim("─")} ${cyan(title || pkgLabel())} ${dim("· prepare")}`)
}

function prepRow(left, right) {
  if (!shouldPrintPrep()) return
  const pad = 10
  const l = left.length >= pad ? left : left + " ".repeat(pad - left.length)
  console.log(`  ${dim(l)} ${right}`)
}

function info(msg) {
  if (!isQuiet()) console.log(msg)
}

function stackBanner(apps) {
  if (isQuiet()) return
  const line = "─".repeat(44)
  console.log(`\n${dim(`┌${line}`)}`)
  console.log(`${dim("│")} ${bold("dev:parent")} ${dim("· turbo")}`)
  console.log(`${dim("│")} ${apps.join(dim(" · "))}`)
  console.log(`${dim(`└${line}`)}\n`)
}

module.exports = {
  dim,
  cyan,
  green,
  bold,
  pkgLabel,
  isQuiet,
  stackPrepQuiet,
  prepHeader,
  prepRow,
  info,
  stackBanner,
}
