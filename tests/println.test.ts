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

describe('println transformation', () => {
  describe('basic transformations', () => {
    it('should transform simple println call with string literal', () => {
      const input = 'println("Hello World")'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${"Hello World"}\\n`)')
    })

    it('should transform println with single quotes', () => {
      const input = "println('Hello World')"
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${\'Hello World\'}\\n`)')
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

    it('should transform println with number', () => {
      const input = 'println(42)'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${42}\\n`)')
    })

    it('should transform println with boolean', () => {
      const input = 'println(true)'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${true}\\n`)')
    })
  })

  describe('complex expressions', () => {
    it('should handle function calls as arguments', () => {
      const input = 'println(getUserName())'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${getUserName()}\\n`)')
    })

    it('should handle object property access', () => {
      const input = 'println(user.profile.name)'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${user.profile.name}\\n`)')
    })

    it('should handle array access', () => {
      const input = 'println(items[0])'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${items[0]}\\n`)')
    })

    it('should handle complex expressions', () => {
      const input = 'println((x + y) * 2)'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${(x + y) * 2}\\n`)')
    })

    it('should handle ternary operators', () => {
      const input = 'println(isActive ? "Active" : "Inactive")'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${isActive ? "Active" : "Inactive"}\\n`)')
    })
  })

  describe('multiple println calls', () => {
    it('should transform multiple println calls in sequence', () => {
      const input = `
        println("Starting process")
        println("Process completed")
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${"Starting process"}\\n`)')
      expect(output).toContain('console.log(`${"Process completed"}\\n`)')
    })

    it('should transform println calls in different scopes', () => {
      const input = `
        function outer() {
          println("Outer function")
          
          function inner() {
            println("Inner function")
          }
          
          inner()
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${"Outer function"}\\n`)')
      expect(output).toContain('console.log(`${"Inner function"}\\n`)')
    })

    it('should transform println in arrow functions', () => {
      const input = `
        const processItems = (items) => {
          items.forEach(item => {
            println(\`Processing: \${item.name}\`)
          })
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${`Processing: ${item.name}`}\\n`)')
    })
  })

  describe('edge cases', () => {
    it('should handle println without arguments', () => {
      const input = 'println()'
      const output = transformWithPlugin(input)
      
      // Should remain as println() if no arguments
      expect(output).toContain('println()')
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

    it('should handle println in conditional statements', () => {
      const input = `
        if (user) {
          println("User exists")
        } else {
          println("No user found")
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${"User exists"}\\n`)')
      expect(output).toContain('console.log(`${"No user found"}\\n`)')
    })

    it('should handle println in loops', () => {
      const input = `
        for (let i = 0; i < 3; i++) {
          println(\`Iteration \${i}\`)
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${`Iteration ${i}`}\\n`)')
    })

    it('should handle println in try-catch blocks', () => {
      const input = `
        try {
          doSomething()
          println("Success")
        } catch (error) {
          println(\`Error: \${error.message}\`)
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('console.log(`${"Success"}\\n`)')
      expect(output).toContain('console.log(`${`Error: ${error.message}`}\\n`)')
    })
  })

  describe('context preservation', () => {
    it('should preserve imports and exports', () => {
      const input = `
        import { something } from './module'
        
        export function test() {
          println("Testing")
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('import { something } from \'./module\'')
      expect(output).toContain('export function test()')
      expect(output).toContain('console.log(`${"Testing"}\\n`)')
    })

    it('should preserve async/await', () => {
      const input = `
        async function process() {
          await delay(1000)
          println("Processing complete")
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('async function process()')
      expect(output).toContain('await delay(1000)')
      expect(output).toContain('console.log(`${"Processing complete"}\\n`)')
    })

    it('should preserve class methods', () => {
      const input = `
        class Logger {
          log(message) {
            println(\`[LOG] \${message}\`)
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('class Logger')
      expect(output).toContain('log(message)')
      expect(output).toContain('console.log(`${`[LOG] ${message}`}\\n`)')
    })
  })
})
