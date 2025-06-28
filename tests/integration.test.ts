import { transform } from '@babel/core'
import { createTranspilerPlugin } from '../src/plugin'

/**
 * Helper function to transform and execute code
 */
function transformAndExecute(code: string): any {
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

  // Create a context object to store results
  const context: any = {}
  
  // Wrap the code in a function that assigns the result to context
  const wrappedCode = `
    ${result.code}
    return context;
  `
  
  // Execute the transformed code with context
  const executeCode = new Function('context', wrappedCode)
  return executeCode(context)
}

/**
 * Helper to capture console.log outputs during execution
 */
function captureConsoleOutput(fn: () => void): string[] {
  const logs: string[] = []
  const originalLog = console.log
  
  console.log = (...args: any[]) => {
    logs.push(args.join(' '))
  }
  
  try {
    fn()
  } finally {
    console.log = originalLog
  }
  
  return logs
}

describe('Defer Integration Tests', () => {
  describe('Function Declarations', () => {
    it('should execute defer calls in reverse order', () => {
      const code = `
        const executionOrder = [];
        
        function testDefer() {
          executionOrder.push('start');
          defer(() => executionOrder.push('defer1'));
          executionOrder.push('middle');
          defer(() => executionOrder.push('defer2'));
          executionOrder.push('end');
        }
        
        testDefer();
        context.result = executionOrder;
      `

      const ctx = transformAndExecute(code)
      
      expect(ctx.result).toEqual([
        'start',
        'middle', 
        'end',
        'defer2',  // Last defer executes first
        'defer1'   // First defer executes last
      ])
    })

    it('should handle resource cleanup pattern', () => {
      const code = `
        const resources = [];
        
        // Mock resource classes
        class Database {
          constructor(name) { 
            this.name = name;
            this.isOpen = true;
            resources.push(\`\${name} opened\`);
          }
          close() { 
            this.isOpen = false;
            resources.push(\`\${this.name} closed\`);
          }
        }
        
        class File {
          constructor(path) { 
            this.path = path;
            this.isOpen = true;
            resources.push(\`\${path} opened\`);
          }
          close() { 
            this.isOpen = false;
            resources.push(\`\${this.path} closed\`);
          }
        }
        
        function processData() {
          const db = new Database('main_db');
          defer(() => db.close());
          
          const configFile = new File('config.json');
          defer(() => configFile.close());
          
          const dataFile = new File('data.csv');
          defer(() => dataFile.close());
          
          resources.push('processing data');
        }
        
        processData();
        context.result = resources;
      `

      const ctx = transformAndExecute(code)
      
      expect(ctx.result).toEqual([
        'main_db opened',
        'config.json opened', 
        'data.csv opened',
        'processing data',
        'data.csv closed',    // Last opened, first closed
        'config.json closed',
        'main_db closed'      // First opened, last closed
      ])
    })

    it('should handle errors in defer without stopping other defers', () => {
      const code = `
        const logs = [];
        
        // Override console.log to capture it
        const originalLog = console.log;
        console.log = (msg) => logs.push(msg);
        
        function testErrorHandling() {
          defer(() => logs.push('defer1 executed'));
          defer(() => { 
            throw new Error('This should be caught');
          });
          defer(() => logs.push('defer3 executed'));
          
          logs.push('function body executed');
        }
        
        testErrorHandling();
        
        // Restore console.log
        console.log = originalLog;
        context.result = logs;
      `

      const ctx = transformAndExecute(code)
      
      expect(ctx.result).toContain('function body executed')
      expect(ctx.result).toContain('defer3 executed')
      expect(ctx.result).toContain('defer1 executed')
      // Should also contain the error (logged by catch block)
      expect(ctx.result.some((log: any) => log.toString().includes('Error'))).toBe(true)
    })
  })

  describe('Arrow Functions', () => {
    it('should execute arrow function defers correctly', () => {
      const code = `
        const executionOrder = [];
        
        const processItems = () => {
          executionOrder.push('arrow start');
          defer(() => executionOrder.push('arrow defer1'));
          executionOrder.push('arrow middle');
          defer(() => executionOrder.push('arrow defer2'));
          executionOrder.push('arrow end');
        };
        
        processItems();
        context.result = executionOrder;
      `

      const ctx = transformAndExecute(code)
      
      expect(ctx.result).toEqual([
        'arrow start',
        'arrow middle',
        'arrow end',
        'arrow defer2',
        'arrow defer1'
      ])
    })
  })

  describe('Function Expressions', () => {
    it('should execute function expression defers correctly', () => {
      const code = `
        const executionOrder = [];
        
        const handler = function(id) {
          executionOrder.push(\`handler \${id} start\`);
          defer(() => executionOrder.push(\`handler \${id} defer1\`));
          executionOrder.push(\`handler \${id} middle\`);
          defer(() => executionOrder.push(\`handler \${id} defer2\`));
          executionOrder.push(\`handler \${id} end\`);
        };
        
        handler('test');
        context.result = executionOrder;
      `

      const ctx = transformAndExecute(code)
      
      expect(ctx.result).toEqual([
        'handler test start',
        'handler test middle',
        'handler test end',
        'handler test defer2',
        'handler test defer1'
      ])
    })
  })

  describe('Nested Functions', () => {
    it('should handle nested functions with independent defer scopes', () => {
      const code = `
        const executionOrder = [];
        
        function outer() {
          executionOrder.push('outer start');
          defer(() => executionOrder.push('outer defer'));
          
          function inner() {
            executionOrder.push('inner start');
            defer(() => executionOrder.push('inner defer'));
            executionOrder.push('inner end');
          }
          
          inner();
          executionOrder.push('outer end');
        }
        
        outer();
        context.result = executionOrder;
      `

      const ctx = transformAndExecute(code)
      
      expect(ctx.result).toEqual([
        'outer start',
        'inner start',
        'inner end',
        'inner defer',  // Inner defer executes when inner function ends
        'outer end',
        'outer defer'   // Outer defer executes when outer function ends
      ])
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle database transaction pattern', () => {
      const code = `
        const logs = [];
        
        class Transaction {
          constructor() {
            this.isActive = true;
            logs.push('transaction started');
          }
          
          commit() {
            if (this.isActive) {
              logs.push('transaction committed');
              this.isActive = false;
            }
          }
          
          rollback() {
            if (this.isActive) {
              logs.push('transaction rolled back');
              this.isActive = false;
            }
          }
        }
        
        function processOrder(shouldFail = false) {
          const tx = new Transaction();
          defer(() => {
            if (tx.isActive) {
              tx.rollback();
            }
          });
          
          logs.push('processing order');
          
          if (shouldFail) {
            throw new Error('Order processing failed');
          }
          
          logs.push('order processed successfully');
          tx.commit();
        }
        
        // Test successful case
        try {
          processOrder(false);
        } catch (e) {
          logs.push('caught error: ' + e.message);
        }
        
        // Test failure case
        try {
          processOrder(true);
        } catch (e) {
          logs.push('caught error: ' + e.message);
        }
        
        context.result = logs;
      `

      const ctx = transformAndExecute(code)
      
      expect(ctx.result).toContain('transaction started')
      expect(ctx.result).toContain('processing order')
      expect(ctx.result).toContain('order processed successfully')
      expect(ctx.result).toContain('transaction committed')
      expect(ctx.result).toContain('transaction rolled back')
      expect(ctx.result).toContain('caught error: Order processing failed')
    })

    it('should handle file processing with multiple resources', () => {
      const code = `
        const logs = [];
        
        class FileHandle {
          constructor(name) {
            this.name = name;
            logs.push(\`opened \${name}\`);
          }
          close() {
            logs.push(\`closed \${this.name}\`);
          }
        }
        
        class Lock {
          constructor(resource) {
            this.resource = resource;
            logs.push(\`acquired lock on \${resource}\`);
          }
          release() {
            logs.push(\`released lock on \${this.resource}\`);
          }
        }
        
        function processFiles(files) {
          files.forEach(function(filename) {
            const lock = new Lock(filename);
            defer(() => lock.release());
            
            const file = new FileHandle(filename);
            defer(() => file.close());
            
            logs.push(\`processing \${filename}\`);
          });
        }
        
        processFiles(['file1.txt', 'file2.txt']);
        context.result = logs;
      `

      const ctx = transformAndExecute(code)
      
      // Verify that resources are properly cleaned up for each file
      expect(ctx.result).toEqual([
        'acquired lock on file1.txt',
        'opened file1.txt',
        'processing file1.txt',
        'closed file1.txt',
        'released lock on file1.txt',
        'acquired lock on file2.txt', 
        'opened file2.txt',
        'processing file2.txt',
        'closed file2.txt',
        'released lock on file2.txt'
      ])
    })
  })
})