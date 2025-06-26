/**
 * Runtime-only exports for browser usage
 * This file only contains browser-safe functions without Node.js dependencies
 */

/**
 * Print a value to console with newline
 * This function is transpiled by babel-defer plugin to console.log()
 * when the Babel plugin is configured, otherwise it works as a fallback
 */
export function println(value: unknown): void {
  console.log(`${String(value)}\n`)
}

// TODO: Add more runtime functions here as needed
// export function defer(fn: () => void): void { ... }
