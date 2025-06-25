import type { PluginObj } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { PluginOptions, TranspilerConfig } from './types';

/**
 * Main transpiler plugin
 */
export function createTranspilerPlugin(): PluginObj {
  return {
    name: 'custom-transpiler',
    visitor: {
      // Visitor for binary expressions (==, !=, etc.)
      BinaryExpression(path: NodePath<t.BinaryExpression>) {
        const { node } = path;

        // Here you will implement your transformations
        // Example: transform == to ===
        if (node.operator === '==') {
          node.operator = '===';
          this.log && console.log('✅ Transformed: == → ===');
        }

        if (node.operator === '!=') {
          node.operator = '!==';
          this.log && console.log('✅ Transformed: != → !==');
        }
      },

      // Visitor for function calls
      CallExpression(path: NodePath<t.CallExpression>) {
        const { node } = path;

        // Here you will implement defer() and other special functions
        if (t.isIdentifier(node.callee) && node.callee.name === 'defer') {
          this.log && console.log('🔍 Found defer() call');
          // TODO: Implement defer transformation
        }
      },

      // Visitor for function declarations
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        const name = path.node.id?.name || 'anonymous';
        this.log && console.log(`🔍 Found function: ${name}`);

        // Here you will handle scope for defer calls
      },

      // Visitor for variable declarations
      VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
        const { node } = path;

        // Example: transform var/const to let
        if (node.kind === 'var' || node.kind === 'const') {
          // node.kind = 'let';
          // this.log && console.log(`🔄 ${node.kind} → let`);
        }
      },

      // Visitor for imports
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        const source = path.node.source.value;
        this.log && console.log(`📦 Import: ${source}`);
      }
    }
  };
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
    ...options.config
  };

  return {
    name: 'configurable-transpiler',
    visitor: {
      BinaryExpression(path: NodePath<t.BinaryExpression>) {
        // Only transform if it's in the config
        if (config.transforms?.includes('equality')) {
          const { node } = path;

          if (node.operator === '==' && config.debug) {
            console.log('🔄 Equality transform enabled');
          }
        }
      }
    }
  };
}
