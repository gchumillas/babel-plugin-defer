import type { PluginObj, NodePath, PluginPass } from '@babel/core'
import type * as t from '@babel/types'

export interface TranspilerConfig {
  debug?: boolean
  transforms?: string[]
}

export interface PluginOptions {
  config?: TranspilerConfig
}

export type BabelPlugin = (_api: PluginPass, _options: PluginOptions) => PluginObj

// Types for common visitors
export type BinaryExpressionVisitor = (
  _path: NodePath<t.BinaryExpression>
) => void
export type FunctionDeclarationVisitor = (
  _path: NodePath<t.FunctionDeclaration>
) => void
export type CallExpressionVisitor = (_path: NodePath<t.CallExpression>) => void
export type VariableDeclarationVisitor = (
  _path: NodePath<t.VariableDeclaration>
) => void

// Global type declarations for babel-defer
declare global {
  /**
   * Print a value to console with newline
   * This function is transpiled by babel-defer plugin to console.log()
   */
  function println(_value: unknown): void
}
