/**
 * Chạy lệnh shell có log bước — dùng bởi orchestrator sync/db.
 *
 * Step bắt buộc có `id` + `name` để log thể hiện rõ thứ tự thao tác theo
 * AGENTS.md, tránh label thủ công kiểu "1/N" bị lệch khi thêm/bớt bước.
 */
const { execSync } = require("node:child_process")

function formatStepHeader(step, prefix = "run") {
  const order =
    Number.isInteger(step.index) && Number.isInteger(step.total)
      ? `STEP ${step.index}/${step.total}`
      : "STEP"
  return `[${prefix}] ${order} · ${step.id} · ${step.name}`
}

/**
 * @param {string} cwd
 * @param {{ id: string, name: string, cmd: string, index?: number, total?: number }} step
 * @param {string} [prefix]
 */
function runStep(cwd, step, prefix = "run") {
  if (!step?.id || !step?.name || !step?.cmd) {
    throw new Error(`[${prefix}] step thiếu id/name/cmd`)
  }
  console.log(`\n${formatStepHeader(step, prefix)}\n`)
  execSync(step.cmd, { cwd, stdio: "inherit" })
}

module.exports = { runStep, formatStepHeader }
