/**
 * Ghi file an toàn trên Windows (EBUSY / UNKNOWN / EPERM từ antivirus/indexer).
 */
const fs = require('node:fs')
const path = require('node:path')

/** @param {NodeJS.ErrnoException} err */
function isRetryableFsError(err) {
  return (
    err?.code === 'EBUSY' ||
    err?.code === 'EPERM' ||
    err?.code === 'EACCES' ||
    err?.code === 'UNKNOWN' ||
    err?.errno === -4094
  )
}

function sleepSync(ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    /* spin */
  }
}

/**
 * @param {{ retries?: number, delayMs?: number }} [options]
 * @param {() => void} fn
 */
function withFsRetry(fn, options = {}) {
  const retries = options.retries ?? 8
  const delayMs = options.delayMs ?? 60
  /** @type {Error | undefined} */
  let lastErr
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      fn()
      return
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      if (
        !isRetryableFsError(/** @type {NodeJS.ErrnoException} */ (err)) ||
        attempt === retries - 1
      ) {
        throw err
      }
      sleepSync(delayMs * (attempt + 1))
    }
  }
  throw lastErr ?? new Error('withFsRetry failed')
}

/**
 * @param {string} src
 * @param {string} dest
 * @param {{ retries?: number, delayMs?: number }} [options]
 */
function copyFileWithRetry(src, dest, options = {}) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  try {
    withFsRetry(() => {
      fs.copyFileSync(src, dest)
    }, options)
  } catch (err) {
    // Windows: copyFileSync đích bị lock — fallback read → atomic write
    const buf = fs.readFileSync(src)
    writeFileWithRetry(dest, buf, options)
  }
}

/**
 * @param {string} absPath
 * @param {{ retries?: number, delayMs?: number, recursive?: boolean, force?: boolean }} [options]
 */
function rmWithRetry(absPath, options = {}) {
  if (!fs.existsSync(absPath)) return
  const recursive = options.recursive ?? true
  const force = options.force ?? true
  withFsRetry(() => {
    fs.rmSync(absPath, { recursive, force })
  }, options)
}

/**
 * @param {string} filePath
 * @param {string | Buffer} content
 * @param {{ encoding?: BufferEncoding, retries?: number, delayMs?: number }} [options]
 */
function writeFileWithRetry(filePath, content, options = {}) {
  const encoding = options.encoding ?? 'utf8'
  const retries = options.retries ?? 8
  const delayMs = options.delayMs ?? 60
  const dir = path.dirname(filePath)

  /** @type {Error | undefined} */
  let lastErr

  for (let attempt = 0; attempt < retries; attempt++) {
    const tmp = path.join(
      dir,
      `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
    )
    try {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(tmp, content, encoding)
      try {
        fs.renameSync(tmp, filePath)
      } catch (renameErr) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        fs.renameSync(tmp, filePath)
      }
      return
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      try {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
      } catch {
        /* ignore cleanup */
      }
      if (!isRetryableFsError(/** @type {NodeJS.ErrnoException} */ (err)) || attempt === retries - 1) {
        throw err
      }
      sleepSync(delayMs * (attempt + 1))
    }
  }

  throw lastErr ?? new Error(`writeFileWithRetry failed: ${filePath}`)
}

module.exports = {
  writeFileWithRetry,
  copyFileWithRetry,
  rmWithRetry,
  isRetryableFsError,
  sleepSync,
  withFsRetry,
}
