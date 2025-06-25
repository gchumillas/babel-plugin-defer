import type { PluginObj } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { PluginOptions, TranspilerConfig } from './types';

/**
 * Plugin principal del transpilador
 */
export function createTranspilerPlugin(): PluginObj {
  return {
    name: 'custom-transpiler',
    visitor: {
      // Visitor para expresiones binarias (==, !=, etc.)
      BinaryExpression(path: NodePath<t.BinaryExpression>) {
        const { node } = path;
        
        // Aquí implementarás tus transformaciones
        // Ejemplo: transformar == a ===
        if (node.operator === '==') {
          node.operator = '===';
          this.log && console.log('✅ Transformed: == → ===');
        }
        
        if (node.operator === '!=') {
          node.operator = '!==';
          this.log && console.log('✅ Transformed: != → !==');
        }
      },
      
      // Visitor para llamadas a funciones
      CallExpression(path: NodePath<t.CallExpression>) {
        const { node } = path;
        
        // Aquí implementarás el defer() y otras funciones especiales
        if (t.isIdentifier(node.callee) && node.callee.name === 'defer') {
          this.log && console.log('🔍 Found defer() call');
          // TODO: Implementar transformación defer
        }
      },
      
      // Visitor para declaraciones de funciones
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        const name = path.node.id?.name || 'anonymous';
        this.log && console.log(`🔍 Found function: ${name}`);
        
        // Aquí manejarás el scope para defer calls
      },
      
      // Visitor para declaraciones de variables
      VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
        const { node } = path;
        
        // Ejemplo: transformar var/const a let
        if (node.kind === 'var' || node.kind === 'const') {
          // node.kind = 'let';
          // this.log && console.log(`🔄 ${node.kind} → let`);
        }
      },
      
      // Visitor para imports
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        const source = path.node.source.value;
        this.log && console.log(`📦 Import: ${source}`);
      }
    }
  };
}

/**
 * Plugin configurable con opciones
 */
export function createConfigurablePlugin(options: PluginOptions = {}): PluginObj {
  const config: TranspilerConfig = {
    debug: false,
    transforms: [],
    ...options.config
  };
  
  return {
    name: 'configurable-transpiler',
    visitor: {
      BinaryExpression(path: NodePath<t.BinaryExpression>) {
        // Solo transformar si está en la config
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