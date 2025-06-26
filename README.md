# babel-defer

A Babel plugin that transpiles `defer` statements to JavaScript, bringing Go-like defer functionality to JavaScript/TypeScript applications.

## Overview

`babel-defer` is a Babel transpiler plugin that enables developers to use `defer` statements in JavaScript and TypeScript, similar to the defer mechanism found in languages like Go and V. The plugin automatically transpiles defer calls into proper JavaScript code that executes cleanup functions at the end of the current scope.

## What is `defer`?

The `defer` statement is a powerful control flow mechanism that schedules a function call to be executed when the surrounding function returns. This pattern is commonly used for:

- **Resource cleanup**: Closing files, database connections, or network sockets
- **Lock management**: Releasing mutexes or semaphores
- **Logging**: Recording function exit points
- **Error handling**: Ensuring cleanup code runs even when errors occur

### `defer` in other languages

**Go:**
```go
func processFile(filename string) error {
    file, err := os.Open(filename)
    if err != nil {
        return err
    }
    defer file.Close() // Will be called when function returns
    
    // Process file...
    return nil
}
```

**V:**
```v
fn process_file(filename string) ! {
    mut file := os.open(filename)!
    defer { file.close() } // Cleanup guaranteed
    
    // Process file...
}
```

**With babel-defer (JavaScript/TypeScript):**
```javascript
function processFile(filename) {
    const file = fs.openSync(filename)
    defer(() => fs.closeSync(file)) // Transpiled to proper cleanup
    
    // Process file...
    // file.close() will be called automatically
}
```

## Installation

### 1. Install the package

```bash
npm install babel-defer
```

### 2. Configure Vite (React applications)

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babelDefer from 'babel-defer'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [babelDefer()]
      }
    })
  ],
})
```

### 3. Install Babel core (peer dependency)

```bash
npm install --save-dev @babel/core
```

## Usage

### Option 1: Global function (Recommended)

The `defer` function is available globally once the plugin is configured. No imports needed:

```typescript
function example() {
  const resource = acquireResource()
  defer(() => resource.cleanup())
  
  // Your code here...
  // cleanup() will be called automatically when function exits
}
```

### Option 2: Explicit import

You can also import the function explicitly if preferred:

```typescript
import { defer } from 'babel-defer/runtime'

function example() {
  const resource = acquireResource()
  defer(() => resource.cleanup())
  
  // Your code here...
}
```

> **Note:** When using the Babel plugin, `defer` calls are transpiled at build time. The runtime import serves as a fallback for environments where Babel is not configured.

## How it works

The plugin transforms defer statements during the build process:

**Input:**
```javascript
function processData() {
  const conn = database.connect()
  defer(() => conn.close())
  
  const data = conn.query('SELECT * FROM users')
  return data
}
```

**Output (transpiled):**
```javascript
function processData() {
  const conn = database.connect()
  try {
    const data = conn.query('SELECT * FROM users')
    return data
  } finally {
    conn.close()
  }
}
```

## API Reference

### `defer(fn: () => void): void`

Schedules a function to be executed when the current function scope exits.

**Parameters:**
- `fn`: A function to be called during cleanup

**Example:**
```typescript
function handleRequest() {
  const startTime = Date.now()
  defer(() => console.log(`Request took ${Date.now() - startTime}ms`))
  
  // Handle request...
}
```

## TypeScript Support

The plugin includes full TypeScript support with global type declarations. The `defer` function is automatically available in your TypeScript files without additional imports.

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test

# Run with watch mode
npm run test:watch
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
