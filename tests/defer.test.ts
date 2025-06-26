import { transform } from '@babel/core'
import { createTranspilerPlugin } from '../src/plugin'
import { parse } from '@babel/parser'
import generate from '@babel/generator'

function normalize(code: string) {
    const ast = parse(code, { sourceType: 'module', allowImportExportEverywhere: true })
    return generate(ast, { compact: true }).code
}

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

    const expected = `
function foo() {
    const defers = [];
    try {
        const db = Db.open();
        defers.push(() => db.close());

        const f = File.open('file.txt');
        defers.push(() => f.close());
    } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
            try {
                defers[i]();
            } catch(e) {
                console.log(e)
            }
        }
    }
}`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should handle single defer call', () => {
    const input = `
function test() {
    const resource = openResource();
    defer(() => resource.close());
}`

    const expected = `
function test() {
    const defers = [];
    try {
        const resource = openResource();
        defers.push(() => resource.close());
    } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
            try {
                defers[i]();
            } catch(e) {
                console.log(e)
            }
        }
    }
}`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should handle function without defer calls unchanged', () => {
    const input = `
function normal() {
    const x = 1;
    console.log(x);
    return x;
}`
    const expected = `
function normal() {
    const x = 1;
    console.log(x);
    return x;
}`
    
    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should handle multiple defer calls in correct reverse order', () => {
    const input = `
function multiDefer() {
    defer(() => console.log('first'));
    defer(() => console.log('second'));
    defer(() => console.log('third'));
}`

    const expected = `
function multiDefer() {
    const defers = [];
    try {
        defers.push(() => console.log('first'));
        defers.push(() => console.log('second'));
        defers.push(() => console.log('third'));
    } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
            try {
                defers[i]();
            } catch(e) {
                console.log(e)
            }
        }
    }
}`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
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

    const expected = `
function withNested() {
    const defers = [];
    try {
        const db = openDb();
        defers.push(() => db.close());
        if (condition) {
            const file = openFile();
            defers.push(() => file.close());
        }
    } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
            try {
                defers[i]();
            } catch(e) {
                console.log(e)
            }
        }
    }
}`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
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

    const expected = `
function complex() {
    const defers = [];
    try {
        let result = 0;
        const conn = connect();
        defers.push(() => conn.disconnect());
        for (let i = 0; i < 10; i++) {
            result += i;
        }
        return result;
    } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
            try {
                defers[i]();
            } catch(e) {
                console.log(e)
            }
        }
    }
}`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
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

    const expected = `
function outer() {
  const defers = [];
  try {
    const db = Db.open()
    defers.push(() => db.close())
    function inner() {
      const x = 42
      return x
    }
    return inner()
  } finally {
    for (let i = defers.length - 1; i >= 0; i--) {
      try {
        defers[i]()
      } catch(e) {
        console.log(e)
      }
    }
  }
}`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should transform nested functions independently if both use defer', () => {
    const input = `
function foo() {
    const db = Db.open();
    defer(() => db.close());

    function innerFunction() {
        defer(() => console.log('inner function'));
    }
    innerFunction();

    const f = File.open('file.txt');
    defer(() => f.close());
}`

    const expected = `
function foo() {
    const defers = [];
    try {
        const db = Db.open();
        defers.push(() => db.close());

        function innerFunction() {
            const defers = [];
            try {
                defers.push(() => console.log('inner function'));
            } finally {
                for (let i = defers.length - 1; i >= 0; i--) {
                    try {
                        defers[i]();
                    } catch(e) {
                        console.log(e);
                    }
                }
            }
        }
        innerFunction();

        const f = File.open('file.txt');
        defers.push(() => f.close());
    } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
            try {
                defers[i]();
            } catch(e) {
                console.log(e);
            }
        }
    }
}`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })
})
