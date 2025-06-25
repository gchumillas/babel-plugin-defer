import type { PluginObj, NodePath } from '@babel/core'
import type * as t from '@babel/types'

export interface TranspilerConfig {
  debug?: boolean;
  transforms?: string[];
}

export interface PluginOptions {
  config?: TranspilerConfig;
}

export type BabelPlugin = (_api: any, _options: PluginOptions) => PluginObj;

// Types for common visitors
export type BinaryExpressionVisitor = (
  _path: NodePath<t.BinaryExpression>
) => void;
export type FunctionDeclarationVisitor = (
  _path: NodePath<t.FunctionDeclaration>
) => void;
export type CallExpressionVisitor = (_path: NodePath<t.CallExpression>) => void;
export type VariableDeclarationVisitor = (
  _path: NodePath<t.VariableDeclaration>
) => void;
