import { createTranspilerPlugin } from './plugin'

// Export the Babel plugin as default (for Babel configuration)
export default createTranspilerPlugin

// Export runtime functions (the main user-facing API)
export { println } from './runtime'
