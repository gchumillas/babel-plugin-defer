// Runtime-only exports for browser usage
// This file only exports functions that should work in the browser

export function println(value: unknown): void {
  // This function provides a fallback when Babel plugin is not used
  // In normal usage, this should be transformed to console.log(`${value}\n`)
  console.log(`${value}\n`)
}

// Browser-safe global declaration
declare global {
  function println(_value: unknown): void
}
