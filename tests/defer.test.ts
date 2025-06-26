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

describe('Defer transformation', () => {
  it('should transform function with defer calls to try-finally pattern', () => {
    const input = `
function foo() {
    const db = Db.open();
    defer(() => db.close());

    const f = File.open('file.txt');
    defer(() => f.close());
}`

    const output = transformWithPlugin(input)
    
    // Check that defer calls are replaced with defers.push
    expect(output).toContain('defers.push(() => db.close())')
    expect(output).toContain('defers.push(() => f.close())')
    
    // Check that try-finally structure is created
    expect(output).toContain('const defers = []')
    expect(output).toContain('try {')
    expect(output).toContain('} finally {')
    
    // Check that finally block contains the cleanup logic
    expect(output).toContain('for (let i = defers.length - 1; i >= 0; i--)')
    expect(output).toContain('defers[i]()')
    expect(output).toContain('catch(e) {')
    expect(output).toContain('console.log(e)')
  })

  it('should handle single defer call', () => {
    const input = `
function test() {
    const resource = openResource();
    defer(() => resource.close());
}`

    const output = transformWithPlugin(input)
    
    expect(output).toContain('const defers = []')
    expect(output).toContain('defers.push(() => resource.close())')
    expect(output).toContain('try {')
    expect(output).toContain('} finally {')
  })

  it('should handle function without defer calls unchanged', () => {
    const input = `
function normal() {
    const x = 1;
    console.log(x);
    return x;
}`

    const output = transformWithPlugin(input)
    
    // Helper function to normalize code for comparison
    const normalize = (code: string) => code.replace(/\s+/g, ' ').trim()
    
    // Should remain exactly the same
    expect(normalize(output)).toBe(normalize(input))
  })

  it('should handle multiple defer calls in correct reverse order', () => {
    const input = `
function multiDefer() {
    defer(() => console.log('first'));
    defer(() => console.log('second'));
    defer(() => console.log('third'));
}`

    const output = transformWithPlugin(input)
    
    // All defer calls should be transformed to defers.push
    expect(output).toContain("defers.push(() => console.log('first'))")
    expect(output).toContain("defers.push(() => console.log('second'))")
    expect(output).toContain("defers.push(() => console.log('third'))")
    
    // Should have the reverse execution logic
    expect(output).toContain('for (let i = defers.length - 1; i >= 0; i--)')
  })

  it('should handle defer in nested blocks', () => {
    const input = `
function withNested() {
    const db = openDb();
    defer(() => db.close());
    
    if (condition) {
        const file = openFile();
        defer(() => file.close());
    }
}`

    const output = transformWithPlugin(input)
    
    expect(output).toContain('const defers = []')
    expect(output).toContain('defers.push(() => db.close())')
    expect(output).toContain('defers.push(() => file.close())')
    expect(output).toContain('try {')
    expect(output).toContain('} finally {')
  })

  it('should preserve original function structure and other statements', () => {
    const input = `
function complex() {
    let result = 0;
    const conn = connect();
    defer(() => conn.disconnect());
    
    for (let i = 0; i < 10; i++) {
        result += i;
    }
    
    return result;
}`

    const output = transformWithPlugin(input)
    
    // Should preserve original logic
    expect(output).toContain('let result = 0')
    expect(output).toContain('for (let i = 0; i < 10; i++)')
    expect(output).toContain('result += i')
    expect(output).toContain('return result')
    
    // Should add defer infrastructure
    expect(output).toContain('const defers = []')
    expect(output).toContain('defers.push(() => conn.disconnect())')
  })

  it('should only transform functions with defer, not nested functions without defer', () => {
    const input = `
function outer() {
  const db = Db.open()
  defer(() => db.close())

  function inner() {
    const x = 42
    return x
  }

  return inner()
}`

    const output = transformWithPlugin(input)

    // La función externa debe ser transformada
    expect(output).toContain('const defers = []')
    expect(output).toContain('defers.push(() => db.close())')
    expect(output).toContain('try {')
    expect(output).toContain('} finally {')
    // La función interna debe quedar igual
    expect(output).toContain('function inner() {')
    expect(output).toContain('const x = 42')
    expect(output).toContain('return x')
    // No debe haber defer infra en la función interna
    const innerStart = output.indexOf('function inner()')
    const innerEnd = output.indexOf('}', innerStart)
    const innerBody = output.slice(innerStart, innerEnd)
    expect(innerBody).not.toContain('defers')
  })
})
