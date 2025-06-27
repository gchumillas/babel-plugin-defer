/**
 * Runtime-only exports for browser usage
 * This file only contains browser-safe functions without Node.js dependencies
 */

/**
 * Defer a function call to be executed when the current function scope exits
 * This function is transpiled by babel-defer plugin to try/finally blocks
 * when the Babel plugin is configured, otherwise it works as a fallback
 */
export function defer(fn: () => void): void {
  // Fallback implementation - in practice, this should be transpiled
  // by the Babel plugin to proper try/finally blocks
  // Using Promise.resolve() as a cross-platform fallback
  Promise.resolve().then(fn).catch(console.error)
}
