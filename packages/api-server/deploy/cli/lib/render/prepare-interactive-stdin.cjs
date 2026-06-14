function prepareInteractiveStdin() {
  if (!process.stdin.isTTY) return

  process.stdin.setEncoding('utf8')
  process.stdin.resume()

  if (process.platform !== 'win32') return

  process.env.FORCE_COLOR = process.env.FORCE_COLOR ?? '1'

  try {
    const stdoutHandle = process.stdout._handle
    if (stdoutHandle?.setMode) stdoutHandle.setMode(0x0004)
    const stdinHandle = process.stdin._handle
    if (stdinHandle?.setMode) stdinHandle.setMode(0x0004)
  } catch {
    /* ignore */
  }
}

module.exports = { prepareInteractiveStdin }
