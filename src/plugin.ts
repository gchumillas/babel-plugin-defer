import type { PluginObj } from '@babel/core'
import type { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

/**
 * Main transpiler plugin
 */
export function createTranspilerPlugin(): PluginObj {
  return {
    name: 'custom-transpiler',
    visitor: {
      // Helper: check if a function body contains any defer() calls
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        const { node } = path

        // Check if the function has defer calls
        if (!node.body || !hasDeferCall(node.body)) {
          return // Do not transform if there are no defer calls
        }

        // Generate a unique identifier for defers
        const defersId = path.scope.generateUidIdentifier('defers')

        // Create the defers array
        const defersDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(
            defersId,
            t.arrayExpression([])
          )
        ])

        // Transform all defer() calls in the function body
        const transformedBody: t.Statement[] = []
        for (const statement of node.body.body) {
          transformStatement(statement, transformedBody, defersId)
        }

        // Create the finally block with the reverse execution loop, using the unique defersId
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
        node.body = t.blockStatement([
          defersDeclaration,
          tryFinally
        ])
      },
    },
  }
}

// Helper: check if a function body contains any defer() calls
function hasDeferCall(body: t.BlockStatement): boolean {
  let found = false
  t.traverseFast(body, (node) => {
    if (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === 'defer'
    ) {
      found = true
    }
  })
  return found
}

// Helper function to recursively transform statements
function transformStatement(statement: t.Statement, result: t.Statement[], defersId: t.Identifier): void {
  if (t.isExpressionStatement(statement)) {
    const expr = statement.expression

    // If it is a defer() call, transform it
    if (
      t.isCallExpression(expr) &&
      t.isIdentifier(expr.callee) &&
      expr.callee.name === 'defer'
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
    const transformedConsequent = transformBlock(statement.consequent, defersId)
    const transformedAlternate = statement.alternate ? transformBlock(statement.alternate, defersId) : null

    result.push(t.ifStatement(
      statement.test,
      transformedConsequent,
      transformedAlternate
    ))
    return
  }

  if (t.isForStatement(statement)) {
    const transformedBody = transformBlock(statement.body, defersId)
    result.push(t.forStatement(
      statement.init,
      statement.test,
      statement.update,
      transformedBody
    ))
    return
  }

  if (t.isWhileStatement(statement)) {
    const transformedBody = transformBlock(statement.body, defersId)
    result.push(t.whileStatement(statement.test, transformedBody))
    return
  }

  if (t.isBlockStatement(statement)) {
    const transformedStatements: t.Statement[] = []
    for (const stmt of statement.body) {
      transformStatement(stmt, transformedStatements, defersId)
    }
    result.push(t.blockStatement(transformedStatements))
    return
  }

  // For any other statement, keep it unchanged
  result.push(statement)
}

// Helper function to transform blocks
function transformBlock(node: t.Statement, defersId: t.Identifier): t.Statement {
  if (t.isBlockStatement(node)) {
    const transformedStatements: t.Statement[] = []
    for (const statement of node.body) {
      transformStatement(statement, transformedStatements, defersId)
    }
    return t.blockStatement(transformedStatements)
  } else {
    const transformedStatements: t.Statement[] = []
    transformStatement(node, transformedStatements, defersId)
    return transformedStatements.length === 1
      ? transformedStatements[0]
      : t.blockStatement(transformedStatements)
  }
}