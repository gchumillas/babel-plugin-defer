import type { PluginObj, NodePath } from '@babel/core';
import type * as t from '@babel/types';

export interface TranspilerConfig {
  debug?: boolean;
  transforms?: string[];
}

export interface PluginOptions {
  config?: TranspilerConfig;
}

export type BabelPlugin = (api: any, options: PluginOptions) => PluginObj;

// Types for common visitors
export type BinaryExpressionVisitor = (path: NodePath<t.BinaryExpression>) => void;
export type FunctionDeclarationVisitor = (path: NodePath<t.FunctionDeclaration>) => void;
export type CallExpressionVisitor = (path: NodePath<t.CallExpression>) => void;
export type VariableDeclarationVisitor = (path: NodePath<t.VariableDeclaration>) => void;