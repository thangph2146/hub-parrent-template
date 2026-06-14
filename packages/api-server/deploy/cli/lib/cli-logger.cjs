/**
 * Log CLI deploy — mặc định compact; --verbose để xem từng file.
 */
function createLogger({ quiet = false, verbose = false } = {}) {
  return {
    quiet,
    verbose,
    step(tag, message) {
      if (!quiet) console.log(`[${tag}] ${message}`)
    },
    detail(tag, message) {
      if (!quiet && verbose) console.log(`[${tag}] ${message}`)
    },
    warn(tag, message) {
      if (!quiet) console.warn(`[${tag}] ${message}`)
    },
  }
}

function parseVerboseFlag(argv = process.argv) {
  return argv.includes('--verbose') || process.env.API_CLI_VERBOSE === '1'
}

function parseQuietFlag(argv = process.argv) {
  return argv.includes('--quiet')
}

function resolveLogOptions(overrides = {}) {
  const verbose = overrides.verbose ?? parseVerboseFlag()
  const quiet = overrides.quiet ?? parseQuietFlag()
  return createLogger({ quiet, verbose })
}

module.exports = { createLogger, parseVerboseFlag, parseQuietFlag, resolveLogOptions }
