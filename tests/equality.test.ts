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

describe('equality operator transformations', () => {
  describe('loose equality (==) to strict equality (===)', () => {
    it('should transform == to === in simple comparison', () => {
      const input = `
        function test() {
          if (a == b) { return true }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a === b')
      expect(output).not.toContain('a == b')
    })

    it('should transform == with null comparison', () => {
      const input = `
        function test() {
          if (user == null) { return false }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('user === null')
      expect(output).not.toContain('user == null')
    })

    it('should transform == with undefined comparison', () => {
      const input = 'if (value == undefined) { throw error }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('value === undefined')
      expect(output).not.toContain('value == undefined')
    })

    it('should transform == with string comparison', () => {
      const input = 'if (status == "active") { process() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('status === "active"')
      expect(output).not.toContain('status == "active"')
    })

    it('should transform == with number comparison', () => {
      const input = 'if (count == 0) { reset() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('count === 0')
      expect(output).not.toContain('count == 0')
    })

    it('should transform == with boolean comparison', () => {
      const input = 'if (isActive == true) { activate() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('isActive === true')
      expect(output).not.toContain('isActive == true')
    })
  })

  describe('loose inequality (!=) to strict inequality (!==)', () => {
    it('should transform != to !== in simple comparison', () => {
      const input = `
        function test() {
          if (a != b) { return false }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a !== b')
      expect(output).not.toContain('a != b')
    })

    it('should transform != with null comparison', () => {
      const input = 'if (user != null) { processUser(user) }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('user !== null')
      expect(output).not.toContain('user != null')
    })

    it('should transform != with undefined comparison', () => {
      const input = 'if (data != undefined) { process(data) }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('data !== undefined')
      expect(output).not.toContain('data != undefined')
    })

    it('should transform != with string comparison', () => {
      const input = 'if (role != "admin") { deny() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('role !== "admin"')
      expect(output).not.toContain('role != "admin"')
    })

    it('should transform != with number comparison', () => {
      const input = 'if (index != -1) { found() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('index !== -1')
      expect(output).not.toContain('index != -1')
    })

    it('should transform != with boolean comparison', () => {
      const input = 'if (enabled != false) { run() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('enabled !== false')
      expect(output).not.toContain('enabled != false')
    })
  })

  describe('complex expressions', () => {
    it('should handle object property comparisons', () => {
      const input = 'if (user.id == expectedId) { authorize() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('user.id === expectedId')
      expect(output).not.toContain('user.id == expectedId')
    })

    it('should handle array element comparisons', () => {
      const input = 'if (items[0] != target) { search() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('items[0] !== target')
      expect(output).not.toContain('items[0] != target')
    })

    it('should handle function call comparisons', () => {
      const input = 'if (getValue() == expected) { success() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('getValue() === expected')
      expect(output).not.toContain('getValue() == expected')
    })

    it('should handle nested property access', () => {
      const input = 'if (config.database.host != "localhost") { connect() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('config.database.host !== "localhost"')
      expect(output).not.toContain('config.database.host != "localhost"')
    })

    it('should handle arithmetic expressions', () => {
      const input = `
        function test() {
          if ((x + y) == sum) { validate() }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('x + y === sum')
      expect(output).not.toContain('x + y == sum')
    })
  })

  describe('multiple comparisons', () => {
    it('should transform multiple == operators in logical AND', () => {
      const input = 'if (a == b && c == d) { process() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a === b && c === d')
      expect(output).not.toContain('a == b')
      expect(output).not.toContain('c == d')
    })

    it('should transform multiple != operators in logical OR', () => {
      const input = 'if (x != null || y != undefined) { handle() }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('x !== null || y !== undefined')
      expect(output).not.toContain('x != null')
      expect(output).not.toContain('y != undefined')
    })

    it('should handle mixed == and != operators', () => {
      const input = `
        function test() {
          if (user == null || user.status != "active") { return }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('user === null || user.status !== "active"')
      expect(output).not.toContain('user == null')
      expect(output).not.toContain('user.status != "active"')
    })

    it('should transform in complex conditional chains', () => {
      const input = `
        if (a == b) {
          if (c != d) {
            if (e == f) {
              execute()
            }
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a === b')
      expect(output).toContain('c !== d')
      expect(output).toContain('e === f')
      expect(output).not.toContain('a == b')
      expect(output).not.toContain('c != d')
      expect(output).not.toContain('e == f')
    })
  })

  describe('edge cases', () => {
    it('should not transform strict equality operators (===)', () => {
      const input = `
        function test() {
          if (a === b && c !== d) { return true }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('a === b')
      expect(output).toContain('c !== d')
      // Should remain unchanged
    })

    it('should handle comparisons in ternary operators', () => {
      const input = 'const result = user == null ? "guest" : user.name'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('user === null ? "guest" : user.name')
      expect(output).not.toContain('user == null')
    })

    it('should handle comparisons in return statements', () => {
      const input = `
        function test() {
          return status != "error"
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('return status !== "error"')
      expect(output).not.toContain('return status != "error"')
    })

    it('should handle comparisons in switch case equivalents', () => {
      const input = `
        if (type == "string") {
          handleString()
        } else if (type == "number") {
          handleNumber()
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('type === "string"')
      expect(output).toContain('type === "number"')
      expect(output).not.toContain('type == "string"')
      expect(output).not.toContain('type == "number"')
    })

    it('should handle comparisons in loops', () => {
      const input = `
        for (let i = 0; i < items.length; i++) {
          if (items[i].status != "processed") {
            process(items[i])
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('items[i].status !== "processed"')
      expect(output).not.toContain('items[i].status != "processed"')
    })

    it('should handle comparisons with typeof', () => {
      const input = 'if (typeof value == "string") { parse(value) }'
      const output = transformWithPlugin(input)
      
      expect(output).toContain('typeof value === "string"')
      expect(output).not.toContain('typeof value == "string"')
    })
  })

  describe('context preservation', () => {
    it('should preserve function structure while transforming comparisons', () => {
      const input = `
        function validate(user) {
          if (user == null) {
            return false
          }
          return user.id != undefined
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('function validate(user)')
      expect(output).toContain('user === null')
      expect(output).toContain('user.id !== undefined')
      expect(output).not.toContain('user == null')
      expect(output).not.toContain('user.id != undefined')
    })

    it('should preserve class methods while transforming comparisons', () => {
      const input = `
        class Validator {
          isValid(data) {
            return data != null && data.status == "valid"
          }
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('class Validator')
      expect(output).toContain('isValid(data)')
      expect(output).toContain('data !== null && data.status === "valid"')
      expect(output).not.toContain('data != null')
      expect(output).not.toContain('data.status == "valid"')
    })

    it('should preserve async/await while transforming comparisons', () => {
      const input = `
        async function checkUser(id) {
          const user = await getUser(id)
          if (user == null) {
            throw new Error("User not found")
          }
          return user.status != "inactive"
        }
      `
      const output = transformWithPlugin(input)
      
      expect(output).toContain('async function checkUser(id)')
      expect(output).toContain('await getUser(id)')
      expect(output).toContain('user === null')
      expect(output).toContain('user.status !== "inactive"')
      expect(output).not.toContain('user == null')
      expect(output).not.toContain('user.status != "inactive"')
    })
  })
})
