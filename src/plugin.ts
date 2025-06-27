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

        // Create the defers array
        const defersDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('defers'),
            t.arrayExpression([])
          )
        ])

        // Transform all defer() calls in the function body
        const transformedBody: t.Statement[] = []

        for (const statement of node.body.body) {
          transformStatement(statement, transformedBody)
        }

        // Create the finally block with the reverse execution loop
        const finallyBlock = t.blockStatement([
          t.forStatement(
            // init: let i = defers.length - 1
            t.variableDeclaration('let', [
              t.variableDeclarator(
                t.identifier('i'),
                t.binaryExpression(
                  '-',
                  t.memberExpression(
                    t.identifier('defers'),
                    t.identifier('length')
                  ),
                  t.numericLiteral(1)
                )
              )
            ]),
            // test: i >= 0
            t.binaryExpression('>=', t.identifier('i'), t.numericLiteral(0)),
            // update: i--
            t.updateExpression('--', t.identifier('i')),
            // body: try { defers[i]() } catch(e) { console.log(e) }
            t.blockStatement([
              t.tryStatement(
                t.blockStatement([
                  t.expressionStatement(
                    t.callExpression(
                      t.memberExpression(
                        t.identifier('defers'),
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
function transformStatement(statement: t.Statement, result: t.Statement[]): void {
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
            t.identifier('defers'),
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
    const transformedConsequent = transformBlock(statement.consequent)
    const transformedAlternate = statement.alternate ? transformBlock(statement.alternate) : null

    result.push(t.ifStatement(
      statement.test,
      transformedConsequent,
      transformedAlternate
    ))
    return
  }

  if (t.isForStatement(statement)) {
    const transformedBody = transformBlock(statement.body)
    result.push(t.forStatement(
      statement.init,
      statement.test,
      statement.update,
      transformedBody
    ))
    return
  }

  if (t.isWhileStatement(statement)) {
    const transformedBody = transformBlock(statement.body)
    result.push(t.whileStatement(statement.test, transformedBody))
    return
  }

  if (t.isBlockStatement(statement)) {
    const transformedStatements: t.Statement[] = []
    for (const stmt of statement.body) {
      transformStatement(stmt, transformedStatements)
    }
    result.push(t.blockStatement(transformedStatements))
    return
  }

  // For any other statement, keep it unchanged
  result.push(statement)
}

// Helper function to transform blocks
function transformBlock(node: t.Statement): t.Statement {
  if (t.isBlockStatement(node)) {
    const transformedStatements: t.Statement[] = []
    for (const statement of node.body) {
      transformStatement(statement, transformedStatements)
    }
    return t.blockStatement(transformedStatements)
  } else {
    const transformedStatements: t.Statement[] = []
    transformStatement(node, transformedStatements)
    return transformedStatements.length === 1
      ? transformedStatements[0]
      : t.blockStatement(transformedStatements)
  }
}