import { transform } from '@babel/core'
import { createTranspilerPlugin } from '../src/plugin'

/**
 * Helper function to transform code using our plugin
 */
function transformWithPlugin(code: string, debug = false): string {
  const result = transform(code, {
    plugins: [createTranspilerPlugin()],
    parserOpts: {
      sourceType: 'module',
      allowImportExportEverywhere: true,
    },
  })

  if (!result || !result.code) {
    throw new Error('Transformation failed')
  }

  return result.code
}

describe('Transpiler Plugin', () => {
  describe('println transformation', () => {
    it('should transform simple println call', () => {
      const input = 'println("Hello World")'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${"Hello World"}\\n`)')
    })

    it('should transform println with variable', () => {
      const input = `
        const message = "Hello"
        println(message)
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${message}\\n`)')
    })

    it('should transform println with template literal', () => {
      const input = 'println(`User ID: ${userId}`)'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${`User ID: ${userId}`}\\n`)')
    })

    it('should transform println with expression', () => {
      const input = 'println(user.name + " logged in")'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${user.name + " logged in"}\\n`)')
    })

    it('should handle multiple println calls', () => {
      const input = `
        println("Starting process")
        println("Process completed")
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${"Starting process"}\\n`)')
      expect(output).toContain('console.log(`${"Process completed"}\\n`)')
    })

    it('should not transform other function calls', () => {
      const input = `
        console.log("Regular log")
        print("Should not change")
        println("Should change")
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log("Regular log")')
      expect(output).toContain('print("Should not change")')
      expect(output).toContain('console.log(`${"Should change"}\\n`)')
    })

    it('should handle println without arguments', () => {
      const input = 'println()'
      const output = transformWithPlugin(input)
      
      // Should remain as println() if no arguments
      expect(output).toContain('println()')
    })
  })

  describe('equality operator transformation', () => {
    it('should transform == to ===', () => {
      const input = `
        function test() {
          if (a == b) { 
            return true 
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a === b')
      expect(output).not.toContain('a == b')
    })

    it('should transform != to !==', () => {
      const input = `
        function test() {
          if (a != b) { 
            return false 
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a !== b')
      expect(output).not.toContain('a != b')
    })

    it('should handle multiple equality operators', () => {
      const input = `
        function test() {
          if (user == null || user.id != 123) {
            return false
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('user === null')
      expect(output).toContain('user.id !== 123')
    })

    it('should not transform strict equality operators', () => {
      const input = `
        function test() {
          if (a === b && c !== d) { 
            return true 
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a === b')
      expect(output).toContain('c !== d')
    })
  })

  describe('defer transformation', () => {
    it('should detect defer calls', () => {
      // For now, just test that defer calls are detected
      // The actual transformation will be implemented later
      const input = `
        function example() {
          defer(() => cleanup())
          doSomething()
        }
      `
      
      // This should not throw an error
      expect(() => transformWithPlugin(input)).not.toThrow()
    })
  })

  describe('complex scenarios', () => {
    it('should handle mixed transformations', () => {
      const input = `
        function processUser(user) {
          if (user == null) {
            println("User not found")
            return false
          }
          
          if (user.id != expectedId) {
            println(\`Invalid user ID: \${user.id}\`)
            return false
          }
          
          println("User processed successfully")
          return true
        }
      `
      
      const output = transformWithPlugin(input)
      
      // Check equality transformations
      expect(output).toContain('user === null')
      expect(output).toContain('user.id !== expectedId')
      
      // Check println transformations
      expect(output).toContain('console.log(`${"User not found"}\\n`)')
      expect(output).toContain('console.log(`${`Invalid user ID: ${user.id}`}\\n`)')
      expect(output).toContain('console.log(`${"User processed successfully"}\\n`)')
    })
  })
})
