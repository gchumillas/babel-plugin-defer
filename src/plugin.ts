import type { PluginObj } from '@babel/core'
import type { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import type { PluginOptions, TranspilerConfig } from './types'

/**
 * Main transpiler plugin
 */
export function createTranspilerPlugin(): PluginObj {
  return {
    name: 'custom-transpiler',
    visitor: {
      // Visitor for binary expressions (==, !=, etc.)
      BinaryExpression(path: NodePath<t.BinaryExpression>) {
        const { node } = path

        // Transform loose equality to strict equality
        // Example: transform == to ===
        if (node.operator === '==') {
          node.operator = '==='
          this.log && console.log('✅ Transformed: == → ===')
        }

        if (node.operator === '!=') {
          node.operator = '!=='
          this.log && console.log('✅ Transformed: != → !==')
        }
      },

      // Visitor for function calls
      CallExpression(path: NodePath<t.CallExpression>) {
        const { node } = path

        // Transform println(text) to console.log(`${text}\n`)
        if (t.isIdentifier(node.callee) && node.callee.name === 'println') {
          this.log && console.log('🔍 Found println() call')

          // Create console.log member expression
          const consoleLog = t.memberExpression(
            t.identifier('console'),
            t.identifier('log')
          )

          // Transform the first argument to template literal with \n
          if (node.arguments.length > 0) {
            const arg = node.arguments[0]

            // Create template literal: `${arg}\n`
            const templateLiteral = t.templateLiteral(
              [
                t.templateElement({ raw: '', cooked: '' }, false),
                t.templateElement({ raw: '\\n', cooked: '\n' }, true),
              ],
              [arg as t.Expression]
            )

            // Replace the call expression
            path.replaceWith(t.callExpression(consoleLog, [templateLiteral]))

            this.log &&
              console.log(
                '✅ Transformed: println() → console.log(`${...}\\n`)'
              )
          }
        }

        // Detect defer() calls for future implementation
        if (t.isIdentifier(node.callee) && node.callee.name === 'defer') {
          this.log && console.log('🔍 Found defer() call')
          // TODO: Implement defer transformation
        }
      },

      // Visitor for function declarations
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        const name = path.node.id?.name || 'anonymous'
        this.log && console.log(`🔍 Found function: ${name}`)

        // Handle scope tracking for defer calls
      },

      // Visitor for variable declarations
      VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
        const { node } = path

        // Example: transform var/const to let (currently disabled)
        if (node.kind === 'var' || node.kind === 'const') {
          // node.kind = 'let';
          // this.log && console.log(`🔄 ${node.kind} → let`);
        }
      },

      // Visitor for imports
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        const source = path.node.source.value
        this.log && console.log(`📦 Import: ${source}`)
      },
    },
  }
}

/**
 * Configurable plugin with options
 */
export function createConfigurablePlugin(
  options: PluginOptions = {}
): PluginObj {
  const config: TranspilerConfig = {
    debug: false,
    transforms: [],
    ...options.config,
  }

  return {
    name: 'configurable-transpiler',
    visitor: {
      BinaryExpression(path: NodePath<t.BinaryExpression>) {
        // Only transform if enabled in configuration
        if (config.transforms?.includes('equality')) {
          const { node } = path

          if (node.operator === '==' && config.debug) {
            console.log('🔄 Equality transform enabled')
          }
        }
      },
    },
  }
}
