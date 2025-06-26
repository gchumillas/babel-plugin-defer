# Babel Plugin Defer - Roadmap

## 🎯 Current Status
- [x] Project setup and basic structure
- [x] Test suite foundation with comprehensive test cases
- [ ] Core plugin implementation
- [ ] Documentation and examples

## 🚀 Phase 1: Core Implementation
### High Priority
- [ ] Implement basic defer transformation (defer() → defers.push())
- [ ] Transform functions to try-finally pattern
- [ ] Handle single and multiple defer calls
- [ ] Support nested defer calls (if blocks, loops, etc.)
- [ ] Function detection (only transform functions with defer calls)
- [ ] Preserve original function logic and structure

### Medium Priority
- [ ] Error handling and edge cases
- [ ] Performance optimizations
- [ ] TypeScript support improvements
- [ ] Handle different function types (arrow functions, methods, etc.)

## 🔧 Phase 2: Testing & Quality
### Test Improvements
- [ ] **Replace fragment-based assertions with full code comparison**
  - Use AST normalization (@babel/generator) or recast for accurate comparison
  - Compare `input` vs `expected` variables instead of `toContain()`
  - More robust and precise test assertions
  - Better error messages when tests fail

### Code Quality
- [ ] Add integration tests with real-world scenarios
- [ ] Performance benchmarks
- [ ] Edge case coverage (empty functions, syntax errors, etc.)
- [ ] Code coverage reporting

## 🌟 Phase 3: Advanced Features
- [ ] Support for async defer functions
- [ ] Custom error handlers in finally block
- [ ] Source map support for debugging
- [ ] Babel preset integration
- [ ] Configuration options for defer behavior

## 📚 Phase 4: Documentation & Ecosystem
- [ ] Comprehensive README with examples
- [ ] Usage examples and tutorials
- [ ] API documentation
- [ ] Migration guide from manual try-finally patterns
- [ ] VS Code extension for defer syntax highlighting
- [ ] npm package publication

## 🐛 Known Issues & Technical Debt
- [ ] Test normalization needs AST-based comparison instead of string replacement
- [ ] Plugin error handling needs improvement
- [ ] Need to handle edge cases (empty functions, syntax errors)
- [ ] Better error messages for malformed defer calls

## 💡 Ideas for Future Consideration
- [ ] Integration with popular frameworks (React, Vue, Node.js)
- [ ] ESLint rules for defer usage patterns
- [ ] Defer debugging tools and utilities
- [ ] Performance monitoring integration
- [ ] Support for defer in other contexts (classes, modules)
- [ ] Defer with timeout/cancellation support

## 🔍 Technical Decisions Made
- ✅ Using try-finally pattern for defer implementation
- ✅ LIFO (Last In, First Out) execution order for defers
- ✅ console.log for error handling in finally block
- ✅ Fragment-based testing approach (to be improved)

## 📝 Notes
- The defer syntax is inspired by Go's defer statement
- Focus on simplicity and reliability over advanced features
- Maintain backward compatibility with existing JavaScript code

---
*Last updated: June 26, 2025*
