import { 
  printlnTestCases, 
  equalityTestCases, 
  expectTransformation,
  expectNoTransformation,
  createTestCode,
  createSnapshot
} from './test-utils'

describe('Test Utils Integration', () => {
  describe('println test cases', () => {
    printlnTestCases.forEach(testCase => {
      it(`should transform ${testCase.name}`, () => {
        expectTransformation(testCase.input, [testCase.expected])
      })
    })
  })

  describe('equality test cases', () => {
    equalityTestCases.forEach(testCase => {
      it(`should transform ${testCase.name}`, () => {
        expectTransformation(testCase.input, [testCase.expected])
      })
    })
  })

  describe('combined transformations', () => {
    it('should handle all features together', () => {
      const code = createTestCode({
        println: true,
        equality: true,
        defer: true,
        imports: true,
        classes: true,
        async: true
      })

      const output = expectTransformation(code, [
        'import { helper } from "./utils"',
        'class TestClass',
        'async process()',
        'defer(() => this.cleanup())',
        'this.value === null',
        'console.log(`${"Value is null"}\\n`)'
      ])

      // Should not contain the old patterns
      expectNoTransformation(code, [
        'this.value == null',
        'println("Value is null")'
      ])
    })

    it('should handle minimal transformations', () => {
      const code = createTestCode({
        println: false,
        equality: false,
        defer: false,
        imports: false,
        classes: false,
        async: false
      })

      // Should preserve the original code structure
      expect(code).toContain('this.value === null')
      expect(code).toContain('console.log("Value is null")')
    })
  })

  describe('snapshot testing', () => {
    it('should create consistent snapshots', () => {
      const snapshots = [
        createSnapshot('println("Hello")', 'simple println'),
        createSnapshot('if (a == b) println("equal")', 'println with equality'),
        createSnapshot('defer(() => cleanup())', 'defer call')
      ]

      snapshots.forEach(snapshot => {
        expect(snapshot).toHaveProperty('description')
        expect(snapshot).toHaveProperty('input')
        expect(snapshot).toHaveProperty('output')
        expect(snapshot.output).toBeTruthy()
      })

      // Verify specific transformations
      expect(snapshots[0].output).toContain('console.log(`${"Hello"}\\n`)')
      expect(snapshots[1].output).toContain('a === b')
      expect(snapshots[1].output).toContain('console.log(`${"equal"}\\n`)')
    })
  })

  describe('error handling', () => {
    it('should handle transformation errors gracefully', () => {
      const invalidCode = 'if (( {'
      
      expect(() => {
        expectTransformation(invalidCode, ['should not matter'])
      }).toThrow() // Just check that it throws, don't check specific message
    })

    it('should handle empty expectations', () => {
      const code = 'const x = 42'
      
      expect(() => {
        expectTransformation(code, [])
      }).not.toThrow()
    })
  })
})
