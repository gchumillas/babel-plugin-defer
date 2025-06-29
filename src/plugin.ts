import type { PluginObj } from '@babel/core'
import type { NodePath, Scope } from '@babel/traverse'
import * as t from '@babel/types'

/**
 * Main transpiler plugin
 */
export function createTranspilerPlugin(): PluginObj {
  return {
    name: 'custom-transpiler',
    visitor: {
      // Function declarations
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        const { node } = path

        if (!node.body || !hasDeferCall(node.body, path.scope)) {
          return
        }

        transformFunctionWithDefer(node.body, path.scope)
      },

      // Arrow functions
      ArrowFunctionExpression(path: NodePath<t.ArrowFunctionExpression>) {
        const { node } = path

        // Solo transformar si el cuerpo es un BlockStatement y contiene defer calls
        if (!t.isBlockStatement(node.body) || !hasDeferCall(node.body, path.scope)) {
          return
        }

        transformFunctionWithDefer(node.body, path.scope)
      },

      // Function expressions (callbacks)
      FunctionExpression(path: NodePath<t.FunctionExpression>) {
        const { node } = path

        if (!node.body || !hasDeferCall(node.body, path.scope)) {
          return
        }

        transformFunctionWithDefer(node.body, path.scope)
      },
    },
  }
}

// Función común para transformar cualquier tipo de función que contenga defer
function transformFunctionWithDefer(body: t.BlockStatement, scope: Scope): void {
  // Generate a unique identifier for defers
  const defersId = scope.generateUidIdentifier('defers')

  // Create the defers array
  const defersDeclaration = t.variableDeclaration('const', [
    t.variableDeclarator(
      defersId,
      t.arrayExpression([])
    )
  ])

  // Transform all defer() calls in the function body
  const transformedBody: t.Statement[] = []
  for (const statement of body.body) {
    transformStatement(statement, transformedBody, defersId, scope)
  }

  // Create the finally block with the reverse execution loop
  const finallyBlock = t.blockStatement([
    t.forStatement(
      t.variableDeclaration('let', [
        t.variableDeclarator(
          t.identifier('i'),
          t.binaryExpression(
            '-',
            t.memberExpression(
              defersId,
              t.identifier('length')
            ),
            t.numericLiteral(1)
          )
        )
      ]),
      t.binaryExpression('>=', t.identifier('i'), t.numericLiteral(0)),
      t.updateExpression('--', t.identifier('i')),
      t.blockStatement([
        t.tryStatement(
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  defersId,
                  t.identifier('i'),
                  true // computed: defers[i]
                ),
                []
              )
            )
          ]),
          t.catchClause(
            t.identifier('e'),
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier('console'),
                    t.identifier('log')
                  ),
                  [t.identifier('e')]
                )
              )
            ])
          )
        )
      ])
    )
  ])

  // Create the try-finally statement
  const tryFinally = t.tryStatement(
    t.blockStatement(transformedBody),
    null, // no catch
    finallyBlock
  )

  // Replace the function body
  body.body = [
    defersDeclaration,
    tryFinally
  ]
}

// Helper: check if a function body contains any defer() calls
// Now takes scope to verify that 'defer' refers to the global defer function
function hasDeferCall(body: t.BlockStatement, scope: Scope): boolean {
  let found = false
  t.traverseFast(body, (node) => {
    if (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === 'defer' &&
      isGlobalDefer(node.callee, scope)
    ) {
      found = true
    }
  })
  return found
}

// Helper function to check if an identifier refers to the global 'defer' function
function isGlobalDefer(identifier: t.Identifier, scope: Scope): boolean {
  if (identifier.name !== 'defer') {
    return false
  }

  // Check if 'defer' is defined in any local scope
  let currentScope: Scope | null = scope
  while (currentScope) {
    if (currentScope.hasOwnBinding('defer')) {
      return false
    }
    currentScope = currentScope.parent
  }

  return true
}

// Helper function to recursively transform statements
function transformStatement(statement: t.Statement, result: t.Statement[], defersId: t.Identifier, scope: Scope): void {
  if (t.isExpressionStatement(statement)) {
    const expr = statement.expression

    // If it is a defer() call, transform it - but only if it's the global defer
    if (
      t.isCallExpression(expr) &&
      t.isIdentifier(expr.callee) &&
      expr.callee.name === 'defer' &&
      isGlobalDefer(expr.callee, scope)
    ) {
      // Convert defer(fn) to defers.push(fn)
      const pushCall = t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            defersId,
            t.identifier('push')
          ),
          expr.arguments
        )
      )
      result.push(pushCall)
      return
    }
  }

  // For statements with nested blocks (if, for, etc.)
  if (t.isIfStatement(statement)) {
    const transformedConsequent = transformBlock(statement.consequent, defersId, scope)
    const transformedAlternate = statement.alternate ? transformBlock(statement.alternate, defersId, scope) : null

    result.push(t.ifStatement(
      statement.test,
      transformedConsequent,
      transformedAlternate
    ))
    return
  }

  if (t.isForStatement(statement)) {
    const transformedBody = transformBlock(statement.body, defersId, scope)
    result.push(t.forStatement(
      statement.init,
      statement.test,
      statement.update,
      transformedBody
    ))
    return
  }

  if (t.isWhileStatement(statement)) {
    const transformedBody = transformBlock(statement.body, defersId, scope)
    result.push(t.whileStatement(statement.test, transformedBody))
    return
  }

  if (t.isBlockStatement(statement)) {
    const transformedStatements: t.Statement[] = []
    for (const stmt of statement.body) {
      transformStatement(stmt, transformedStatements, defersId, scope)
    }
    result.push(t.blockStatement(transformedStatements))
    return
  }

  // For any other statement, keep it unchanged
  result.push(statement)
}

// Helper function to transform blocks
function transformBlock(node: t.Statement, defersId: t.Identifier, scope: Scope): t.Statement {
  if (t.isBlockStatement(node)) {
    const transformedStatements: t.Statement[] = []
    for (const statement of node.body) {
      transformStatement(statement, transformedStatements, defersId, scope)
    }
    return t.blockStatement(transformedStatements)
  } else {
    const transformedStatements: t.Statement[] = []
    transformStatement(node, transformedStatements, defersId, scope)
    return transformedStatements.length === 1
      ? transformedStatements[0]
      : t.blockStatement(transformedStatements)
  }
}