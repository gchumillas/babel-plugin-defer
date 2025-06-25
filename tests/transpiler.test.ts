import { BabelTranspiler, transformCode } from '../src/index'

describe('BabelTranspiler', () => {
  describe('constructor and basic functionality', () => {
    it('should create transpiler with default config', () => {
      const transpiler = new BabelTranspiler()
      expect(transpiler).toBeInstanceOf(BabelTranspiler)
    })

    it('should create transpiler with custom config', () => {
      const transpiler = new BabelTranspiler({
        debug: true,
        transforms: ['equality']
      })
      expect(transpiler).toBeInstanceOf(BabelTranspiler)
    })
  })

  describe('transform method', () => {
    it('should transform code correctly', () => {
      const transpiler = new BabelTranspiler()
      const input = `
        if (user == null) {
          println("User not found")
        }
      `
      
      const output = transpiler.transform(input)
      
      expect(output).toContain('user === null')
      expect(output).toContain('console.log(`${"User not found"}\\n`)')
    })

    it('should handle invalid code gracefully', () => {
      const transpiler = new BabelTranspiler()
      const invalidCode = 'if (( {'
      
      expect(() => transpiler.transform(invalidCode)).toThrow()
    })

    it('should return original code when no transformations apply', () => {
      const transpiler = new BabelTranspiler()
      const input = 'const x = 42'
      
      const output = transpiler.transform(input)
      expect(output).toContain('const x = 42')
    })
  })

  describe('analyze method', () => {
    it('should analyze code without errors', () => {
      const transpiler = new BabelTranspiler({ debug: false })
      const input = `
        import React from 'react'
        
        function component() {
          println("Hello")
          defer(() => cleanup())
          return <div>Hello</div>
        }
      `
      
      // Should not throw
      expect(() => transpiler.analyze(input)).not.toThrow()
    })
  })
})

describe('transformCode utility function', () => {
  it('should transform code with default options', () => {
    const input = 'println("Hello World")'
    const output = transformCode(input)
    
    expect(output).toContain('console.log(`${"Hello World"}\\n`)')
  })

  it('should transform code with custom options', () => {
    const input = `
      if (a == b) {
        println("Equal")
      }
    `
    const output = transformCode(input, { debug: true })
    
    expect(output).toContain('a === b')
    expect(output).toContain('console.log(`${"Equal"}\\n`)')
  })

  it('should handle empty code', () => {
    const output = transformCode('')
    expect(output).toBe('')
  })
})
