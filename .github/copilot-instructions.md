# GitHub Copilot Instructions

All instructions added to this document should be short and concise for optimal AI processing.

## Development Guidelines

**Language Requirement**: This project must be developed entirely in English.

## ESLint Rules - Quick Reference

**MUST follow these patterns:**

- No semicolons: `const x = 'value'` ✅ not `const x = 'value';` ❌
- Single quotes: `'text'` ✅ not `"text"` ❌
- Strict equality: `===` and `!==` only
- Always use braces: `if (x) { ... }` ✅ not `if (x) ...` ❌
- Const by default, let when reassigning
- Unused variables: prefix with `_`
- No semicolons in interfaces:
  ```typescript
  interface User {
    name: string  // ✅ no semicolon
    age: number
  }
  ```

**Scope:** Only `src/` directory, `.ts` and `.tsx` files
**Note:** `console.log` is allowed for debugging
