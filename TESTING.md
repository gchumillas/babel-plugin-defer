# Babel Transpiler Plugin Tests

This project includes a comprehensive testing system to validate all transpiler functionalities.

## 🧪 Test Configuration

### Technologies Used
- **Jest**: Main testing framework
- **ts-jest**: For running TypeScript tests
- **@babel/core**: For code transformations

### Test Structure
```
tests/
├── plugin.test.ts          # Main plugin tests
├── transpiler.test.ts      # BabelTranspiler class tests
├── integration.test.ts     # Integration tests with real-world cases
├── test-utils.test.ts      # Testing utilities tests
└── test-utils.ts           # Reusable testing utilities
```

## 🚀 Test Commands

### Run all tests
```bash
npm test
```

### Run tests in watch mode (re-run on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run manual test (legacy file)
```bash
npm run manual-test
```

## 📋 Tested Features

### ✅ `println()` Transformation
- [x] `println("text")` → `console.log(\`\${"text"}\\n\`)`
- [x] `println(variable)` → `console.log(\`\${variable}\\n\`)`
- [x] `println(\`template\`)` → `console.log(\`\${\`template\`}\\n\`)`
- [x] `println(expression)` → `console.log(\`\${expression}\\n\`)`
- [x] Multiple `println()` calls in the same file
- [x] Don't transform other functions like `print()` or `console.log()`

### ✅ Equality Operator Transformation
- [x] `==` → `===`
- [x] `!=` → `!==`
- [x] Multiple operators in the same file
- [x] Don't transform strict operators (`===`, `!==`)

### ✅ `defer()` Detection
- [x] Detect `defer()` calls (future implementation)

### ✅ Integration Cases
- [x] Async/await functions with transformations
- [x] React components with transformations
- [x] Classes with methods and transformations
- [x] Nested functions
- [x] Arrow functions
- [x] Complex real-world code

## 🛠️ Testing Utilities

### `transformWithPlugin(code, debug?)`
Transforms code using the main plugin.

```typescript
const output = transformWithPlugin('println("Hello")')
expect(output).toContain('console.log(`${"Hello"}\\n`)')
```

### `expectTransformation(input, expectedOutputs, plugin?, options?)`
Helper to verify that transformations are applied correctly.

```typescript
expectTransformation(
  'println("test")',
  ['console.log(`${"test"}\\n`)']
)
```

### `createTestCode(features)`
Generates test code with different features.

```typescript
const code = createTestCode({
  println: true,
  equality: true,
  classes: true
})
```

### Predefined Test Cases
- `printlnTestCases`: Common cases for `println()` transformation
- `equalityTestCases`: Common cases for equality operators

## 📊 Test Coverage

Current coverage is:
- **91.52%** statements
- **66.66%** branches  
- **81.25%** functions
- **91.22%** lines

### View Coverage Report
After running `npm run test:coverage`, you can open:
```bash
open coverage/lcov-report/index.html
```

## 🔧 Adding New Tests

### For a new feature:

1. **Create unit tests** in `tests/plugin.test.ts`:
```typescript
describe('new feature', () => {
  it('should transform new syntax', () => {
    const input = 'new_syntax()'
    const output = transformWithPlugin(input)
    expect(output).toContain('new_transformation()')
  })
})
```

2. **Add integration cases** in `tests/integration.test.ts`:
```typescript
it('should handle new feature in real code', () => {
  const input = `
    function realFunction() {
      new_syntax()
      println("testing")
    }
  `
  const output = transpiler.transform(input)
  // Verify multiple transformations
})
```

3. **Update utilities** in `tests/test-utils.ts` if needed:
```typescript
export const newFeatureTestCases = [
  {
    name: 'basic case',
    input: 'new_syntax()',
    expected: 'new_transformation()'
  }
]
```

## 🎯 Best Practices

### ✅ DO:
- Write tests before implementing new features (TDD)
- Test edge cases (empty, null, syntax error)
- Use descriptive names for tests
- Group related tests with `describe()`
- Verify both expected output and that original input is not present

### ❌ DON'T:
- Make tests depend on other tests
- Use `console.log()` in tests (use `expect()`)
- Test internal implementation, only public API
- Make tests too long or complex

## 🐛 Debugging Tests

### To debug a specific test:
```bash
npm test -- --testNamePattern="test name"
```

### To run a single test file:
```bash
npm test tests/plugin.test.ts
```

### For detailed output:
```bash
npm test -- --verbose
```

## 📈 Metrics and CI/CD

Tests can be easily integrated into CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm test

- name: Check Coverage
  run: npm run test:coverage
```

## 🚀 Next Steps

- [ ] Implement complete `defer()` transformation
- [ ] Add performance tests
- [ ] Add compatibility tests with different Node.js versions
- [ ] Implement snapshot testing for complex outputs
- [ ] Add mutation testing to validate test quality
