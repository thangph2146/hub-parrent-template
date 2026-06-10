/**
 * Log dev prep — gọn, có màu khi TTY. Tắt: HUB_DEV_LOG=quiet
 */
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
function yellow(s) {
  return useColor ? `\x1b[33m${s}\x1b[0m` : s
}

/** @param {string} s */
function bold(s) {
  return useColor ? `\x1b[1m${s}\x1b[0m` : s
}

function pkgLabel() {
  return process.env.npm_package_name || process.env.HUB_DEV_APP || "app"
}

function isQuiet() {
  return process.env.HUB_DEV_LOG === "quiet"
}

/** Stack đã kill port + clean .next ở root predev — im lặng prep từng app. */
function stackPrepQuiet() {
  return (
    process.env.HUB_DEV_SKIP_PORT_KILL === "1" &&
    process.env.HUB_DEV_SKIP_NEXT_CLEAN === "1"
  )
}

function shouldPrintPrep() {
  return !isQuiet() && !stackPrepQuiet()
}

/**
 * @param {string} title
 */
function prepHeader(title) {
  if (!shouldPrintPrep()) return
  const name = title || pkgLabel()
  console.log(`${dim("─")} ${cyan(name)} ${dim("· prepare")}`)
}

/**
 * @param {string} left
 * @param {string} right
 */
function prepRow(left, right) {
  if (!shouldPrintPrep()) return
  const pad = 10
  const l = left.length >= pad ? left : left + " ".repeat(pad - left.length)
  console.log(`  ${dim(l)} ${right}`)
}

/**
 * @param {string} msg
 */
function info(msg) {
  if (isQuiet()) return
  console.log(msg)
}

/**
 * @param {string} msg
 */
function warn(msg) {
  console.warn(yellow(msg))
}

/**
 * @param {string} stackName
 * @param {string[]} apps
 */
function stackBanner(stackName, apps) {
  if (isQuiet()) return
  const line = "─".repeat(44)
  console.log(`\n${dim(`┌${line}`)}`)
  console.log(`${dim("│")} ${bold(`dev:${stackName}`)} ${dim("· turbo")}`)
  console.log(`${dim("│")} ${apps.join(dim(" · "))}`)
  console.log(`${dim(`└${line}`)}\n`)
}

module.exports = {
  dim,
  cyan,
  green,
  yellow,
  bold,
  pkgLabel,
  isQuiet,
  stackPrepQuiet,
  shouldPrintPrep,
  prepHeader,
  prepRow,
  info,
  warn,
  stackBanner,
}
