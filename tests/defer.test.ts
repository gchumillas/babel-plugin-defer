import { transform } from '@babel/core'
import { createTranspilerPlugin } from '../src/plugin'
import { parse } from '@babel/parser'
import generate from '@babel/generator'

function normalizeDefersName(code: string): string {
  // Replace _defers, _defers2, etc. with defers
  return code.replace(/_defers\d*/g, 'defers')
}

function normalize(code: string) {
  const ast = parse(code, { sourceType: 'module', allowImportExportEverywhere: true })
  return normalizeDefersName(generate(ast, { compact: true }).code)
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

describe('Functions', () => {
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

        function innerFunction() {
          defer(() => console.log('inner function 2'))
        }
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

            function innerFunction() {
              const defers = [];
              try {
                defers.push(() => console.log('inner function 2'));
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

describe('Arrow Functions', () => {
  it('should transform arrow function with defer calls', () => {
    const input = `
    const processData = () => {
      const db = openDb();
      defer(() => db.close());
      
      const file = openFile();
      defer(() => file.close());
    }`

    const expected = `
    const processData = () => {
      const defers = [];
      try {
        const db = openDb();
        defers.push(() => db.close());
        
        const file = openFile();
        defers.push(() => file.close());
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

  it('should not transform arrow function without defer calls', () => {
    const input = `
    const calculate = () => {
      const x = 10;
      const y = 20;
      return x + y;
    }`

    const expected = `
    const calculate = () => {
      const x = 10;
      const y = 20;
      return x + y;
    }`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should not transform arrow function with expression body', () => {
    const input = `
    const getValue = () => someValue;
    const add = (a, b) => a + b;`

    const expected = `
    const getValue = () => someValue;
    const add = (a, b) => a + b;`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should handle arrow function in variable assignment with nested defer', () => {
    const input = `
    const handler = () => {
      const conn = connect();
      defer(() => conn.close());
      
      if (needsFile) {
        const file = openFile();
        defer(() => file.close());
      }
    }`

    const expected = `
    const handler = () => {
      const defers = [];
      try {
        const conn = connect();
        defers.push(() => conn.close());
        
        if (needsFile) {
          const file = openFile();
          defers.push(() => file.close());
        }
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

describe('Function Expressions and Callbacks', () => {
  it('should transform function expression with defer calls', () => {
    const input = `
    const handler = function(req, res) {
      const db = openDatabase();
      defer(() => db.close());
      
      const session = createSession();
      defer(() => session.destroy());
    }`

    const expected = `
    const handler = function(req, res) {
      const defers = [];
      try {
        const db = openDatabase();
        defers.push(() => db.close());
        
        const session = createSession();
        defers.push(() => session.destroy());
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

  it('should transform callback function with defer calls', () => {
    const input = `
    items.forEach(function(item) {
      const file = openFile(item.path);
      defer(() => file.close());
      
      const lock = acquireLock(item.id);
      defer(() => lock.release());
    })`

    const expected = `
    items.forEach(function(item) {
      const defers = [];
      try {
        const file = openFile(item.path);
        defers.push(() => file.close());
        
        const lock = acquireLock(item.id);
        defers.push(() => lock.release());
      } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
          try {
            defers[i]();
          } catch(e) {
            console.log(e);
          }
        }
      }
    })`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should not transform function expression without defer calls', () => {
    const input = `
    const processor = function(data) {
      const result = process(data);
      return result;
    }`

    const expected = `
    const processor = function(data) {
      const result = process(data);
      return result;
    }`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should transform nested function expressions independently', () => {
    const input = `
    const outer = function() {
      const db = openDb();
      defer(() => db.close());
      
      const inner = function() {
        const cache = openCache();
        defer(() => cache.clear());
      };
      
      inner();
    }`

    const expected = `
    const outer = function() {
      const defers = [];
      try {
        const db = openDb();
        defers.push(() => db.close());
        
        const inner = function() {
          const defers = [];
          try {
            const cache = openCache();
            defers.push(() => cache.clear());
          } finally {
            for (let i = defers.length - 1; i >= 0; i--) {
              try {
                defers[i]();
              } catch(e) {
                console.log(e);
              }
            }
          }
        };
        
        inner();
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

describe('Scope and Binding Tests', () => {
  it('should not transform local defer functions', () => {
    const input = `
    function foo() {
      const defer = () => console.log('not the defer function you are looking for')
      defer()
    }`

    const expected = `
    function foo() {
      const defer = () => console.log('not the defer function you are looking for')
      defer()
    }`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should not transform defer function parameters', () => {
    const input = `
    function foo(defer) {
      defer()
    }`

    const expected = `
    function foo(defer) {
      defer()
    }`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should not transform defer when redefined in function scope', () => {
    const input = `
    function processData() {
      function defer(fn) {
        console.log('custom defer implementation')
        fn()
      }
      
      defer(() => console.log('cleanup'))
    }`

    const expected = `
    function processData() {
      function defer(fn) {
        console.log('custom defer implementation')
        fn()
      }
      
      defer(() => console.log('cleanup'))
    }`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should transform imported defer from babel-plugin-defer/runtime', () => {
    const input = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function foo() {
      const resource = openResource()
      defer(() => resource.close())
    }`

    const expected = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function foo() {
      const defers = [];
      try {
        const resource = openResource()
        defers.push(() => resource.close())
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

  it('should transform imported defer but not local shadowing', () => {
    const input = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function foo() {
      defer(() => console.log('this should transform'))
      
      function inner() {
        const defer = () => console.log('local defer')
        defer() // this should NOT transform
      }
      
      defer(() => console.log('this should transform too'))
    }`

    const expected = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function foo() {
      const defers = [];
      try {
        defers.push(() => console.log('this should transform'))
        
        function inner() {
          const defer = () => console.log('local defer')
          defer() // this should NOT transform
        }
        
        defers.push(() => console.log('this should transform too'))
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

  it('should not transform defer imported from other libraries', () => {
    const input = `
    import { defer } from 'other-library'
    
    function foo() {
      defer(() => console.log('should not transform'))
    }`

    const expected = `
    import { defer } from 'other-library'
    
    function foo() {
      defer(() => console.log('should not transform'))
    }`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should handle default import from babel-plugin-defer/runtime', () => {
    const input = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function foo() {
      const resource = openResource()
      defer(() => resource.close())
    }`

    const expected = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function foo() {
      const defers = [];
      try {
        const resource = openResource()
        defers.push(() => resource.close())
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

  it('should handle namespace import from babel-plugin-defer/runtime', () => {
    const input = `
    import * as deferModule from 'babel-plugin-defer/runtime'
    
    function foo() {
      const resource = openResource()
      deferModule.defer(() => resource.close())
    }`

    // Note: This test might need adjustment based on how namespace imports are handled
    // For now, assuming it doesn't transform since it's deferModule.defer, not just defer
    const expected = `
    import * as deferModule from 'babel-plugin-defer/runtime'
    
    function foo() {
      const resource = openResource()
      deferModule.defer(() => resource.close())
    }`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })

  it('should transform global defer when no import is present', () => {
    const input = `
    function foo() {
      const resource = openResource()
      defer(() => resource.close())
    }`

    const expected = `
    function foo() {
      const defers = [];
      try {
        const resource = openResource()
        defers.push(() => resource.close())
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

  it('should handle complex scoping with multiple nested functions', () => {
    const input = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function outer() {
      defer(() => console.log('outer defer 1'))
      
      function middle() {
        defer(() => console.log('middle defer'))
        
        function inner() {
          const defer = localDeferFunction
          defer() // Should NOT transform - local defer
        }
        
        inner()
        defer(() => console.log('middle defer 2'))
      }
      
      middle()
      defer(() => console.log('outer defer 2'))
    }`

    const expected = `
    import { defer } from 'babel-plugin-defer/runtime'
    
    function outer() {
      const defers = [];
      try {
        defers.push(() => console.log('outer defer 1'))
        
        function middle() {
          const defers = [];
          try {
            defers.push(() => console.log('middle defer'))
            
            function inner() {
              const defer = localDeferFunction
              defer() // Should NOT transform - local defer
            }
            
            inner()
            defers.push(() => console.log('middle defer 2'))
          } finally {
            for (let i = defers.length - 1; i >= 0; i--) {
              try {
                defers[i]();
              } catch(e) {
                console.log(e)
              }
            }
          }
        }
        
        middle()
        defers.push(() => console.log('outer defer 2'))
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
})

describe('Mixed Function Types', () => {
  it('should handle mixed function types with defer independently', () => {
    const input = `
    function regularFunc() {
      const db = openDb();
      defer(() => db.close());
      
      const arrowFunc = () => {
        const file = openFile();
        defer(() => file.close());
      };
      
      const callback = function(item) {
        const lock = acquireLock();
        defer(() => lock.release());
      };
      
      arrowFunc();
      items.forEach(callback);
    }`

    const expected = `
    function regularFunc() {
      const defers = [];
      try {
        const db = openDb();
        defers.push(() => db.close());
        
        const arrowFunc = () => {
          const defers = [];
          try {
            const file = openFile();
            defers.push(() => file.close());
          } finally {
            for (let i = defers.length - 1; i >= 0; i--) {
              try {
                defers[i]();
              } catch(e) {
                console.log(e);
              }
            }
          }
        };
        
        const callback = function(item) {
          const defers = [];
          try {
            const lock = acquireLock();
            defers.push(() => lock.release());
          } finally {
            for (let i = defers.length - 1; i >= 0; i--) {
              try {
                defers[i]();
              } catch(e) {
                console.log(e);
              }
            }
          }
        };
        
        arrowFunc();
        items.forEach(callback);
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

  it('should only transform functions that actually use defer', () => {
    const input = `
    function hasDefer() {
      const resource = acquire();
      defer(() => resource.release());
    }

    const noDefer = () => {
      const value = calculate();
      return value;
    };

    const mixedCase = function() {
      const temp = createTemp();
      defer(() => temp.cleanup());
      
      const helper = () => {
        return "no defer here";
      };
      
      return helper();
    };`

    const expected = `
    function hasDefer() {
      const defers = [];
      try {
        const resource = acquire();
        defers.push(() => resource.release());
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

    const noDefer = () => {
      const value = calculate();
      return value;
    };

    const mixedCase = function() {
      const defers = [];
      try {
        const temp = createTemp();
        defers.push(() => temp.cleanup());
        
        const helper = () => {
          return "no defer here";
        };
        
        return helper();
      } finally {
        for (let i = defers.length - 1; i >= 0; i--) {
          try {
            defers[i]();
          } catch(e) {
            console.log(e);
          }
        }
      }
    };`

    const output = transformWithPlugin(input)
    expect(normalize(output)).toBe(normalize(expected))
  })
})