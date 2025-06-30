# babel-plugin-defer

[![npm version](https://badge.fury.io/js/babel-plugin-defer.svg)](https://badge.fury.io/js/babel-plugin-defer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A Babel plugin that transpiles `defer` statements to JavaScript, bringing Go-like defer functionality to JavaScript/TypeScript applications.

## Overview

`babel-plugin-defer` is a Babel transpiler plugin that enables developers to use `defer` statements in JavaScript and TypeScript, similar to the defer mechanism found in languages like Go and V. The plugin automatically transpiles defer calls into proper JavaScript code that executes cleanup functions at the end of the current scope.

```javascript
import { defer } from 'babel-plugin-defer/runtime'

function processFile(filename) {
    const file = fs.openSync(filename)
    defer(() => fs.closeSync(file)) // Transpiled to proper cleanup
    
    // Process file...
    // file.close() will be called automatically
}
```

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

## Installation

Install the package and the peer dependency:

```bash
npm install babel-plugin-defer
npm install --save-dev @babel/core
```

Visit the [examples](./examples/) folder for more examples.

## Usage

Import the functions you need from the runtime package:

```typescript
import { defer } from 'babel-plugin-defer/runtime'

function example() {
  const resource = acquireResource()
  defer(() => resource.cleanup()) // Will be transpiled to try/finally
  
  // Your code here...
  // cleanup() will be called automatically when function exits
}
```

> [!NOTE]
> When using the Babel plugin, these function calls are transpiled at build time into optimized JavaScript code. The runtime functions serve as fallbacks for environments where Babel is not configured.

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
  const _defers = [];
  try {
    const conn = database.connect();
    _defers.push(() => conn.close());

    const file = filesystem.open('path/to/file.txt');
    _defers.push(() => file.close());

    const data = conn.query('SELECT * FROM users');
    return data;
  } finally {
    // Closes the resources in reverse order
    for (let i = _defers.length - 1; i >= 0; i--) {
      try {
        _defers[i]();
      } catch (e) {
        console.log(e);
      }
    }
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
# Clone the repository
git clone https://github.com/your-username/babel-plugin-defer.git
cd babel-plugin-defer

# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test

# Run with watch mode
npm run test:watch

# Lint code
npm run lint

# Prepare for publishing
npm run prepublishOnly
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT © [Your Name](https://your-website.com)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes.

## Support

If this package is helpful to you, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 💡 Suggesting new features
- 🔗 Sharing with others
