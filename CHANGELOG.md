# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-26

### Added
- Initial release of babel-plugin-defer
- Support for `defer` statement transpilation to try/finally blocks
- Runtime fallback functions for environments without Babel
- Full TypeScript support with type declarations
- Vite integration support
- Comprehensive documentation and examples

### Features
- Transpiles `defer(() => cleanup())` to proper try/finally blocks
- Browser-safe runtime exports at `/runtime`
- Zero dependencies in runtime bundle
- Full compatibility with React, Vite, and modern build tools
