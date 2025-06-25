import { transform } from '@babel/core'
import { createTranspilerPlugin, createConfigurablePlugin } from '../src/plugin'
import type { PluginOptions } from '../src/types'

/**
 * Test utilities for the transpiler plugin
 */

/**
 * Transform code using the main transpiler plugin
 */
export function transformWithPlugin(code: string, debug = false): string {
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

  return result.code
}

/**
 * Transform code using the configurable plugin
 */
export function transformWithConfigurablePlugin(
  code: string, 
  options: PluginOptions = {}
): string {
  const result = transform(code, {
    plugins: [createConfigurablePlugin(options)],
    parserOpts: {
      sourceType: 'module',
      allowImportExportEverywhere: true,
    },
  })

  if (!result || !result.code) {
    throw new Error('Transformation failed')
  }

  return result.code
}

/**
 * Test helper to check if a transformation was applied correctly
 */
export function expectTransformation(
  input: string,
  expectedOutputs: string[],
  plugin: 'main' | 'configurable' = 'main',
  options?: PluginOptions
) {
  const output = plugin === 'main' 
    ? transformWithPlugin(input)
    : transformWithConfigurablePlugin(input, options)

  expectedOutputs.forEach(expected => {
    expect(output).toContain(expected)
  })

  return output
}

/**
 * Test helper to check that certain strings are NOT in the output
 */
export function expectNoTransformation(
  input: string,
  unexpectedOutputs: string[],
  plugin: 'main' | 'configurable' = 'main',
  options?: PluginOptions
) {
  const output = plugin === 'main' 
    ? transformWithPlugin(input)
    : transformWithConfigurablePlugin(input, options)

  unexpectedOutputs.forEach(unexpected => {
    expect(output).not.toContain(unexpected)
  })

  return output
}

/**
 * Common test cases for println transformations
 */
export const printlnTestCases = [
  {
    name: 'simple string',
    input: 'println("Hello")',
    expected: 'console.log(`${"Hello"}\\n`)'
  },
  {
    name: 'variable',
    input: 'println(message)',
    expected: 'console.log(`${message}\\n`)'
  },
  {
    name: 'template literal',
    input: 'println(`Hello ${name}`)',
    expected: 'console.log(`${`Hello ${name}`}\\n`)'
  },
  {
    name: 'expression',
    input: 'println(a + b)',
    expected: 'console.log(`${a + b}\\n`)'
  }
]

/**
 * Common test cases for equality transformations
 */
export const equalityTestCases = [
  {
    name: 'loose equality',
    input: 'a == b',
    expected: 'a === b'
  },
  {
    name: 'loose inequality',
    input: 'a != b',
    expected: 'a !== b'
  },
  {
    name: 'null check',
    input: 'user == null',
    expected: 'user === null'
  },
  {
    name: 'number comparison',
    input: 'id != 123',
    expected: 'id !== 123'
  }
]

/**
 * Helper to create test code with multiple features
 */
export function createTestCode(features: {
  println?: boolean
  equality?: boolean
  defer?: boolean
  imports?: boolean
  classes?: boolean
  async?: boolean
}): string {
  let code = ''

  if (features.imports) {
    code += 'import { helper } from "./utils"\n\n'
  }

  if (features.classes) {
    code += 'class TestClass {\n'
    code += '  constructor() {\n'
    code += '    this.value = null\n'
    code += '  }\n\n'
  }

  if (features.async) {
    code += '  async process() {\n'
  } else {
    code += '  process() {\n'
  }

  if (features.defer) {
    code += '    defer(() => this.cleanup())\n'
  }

  if (features.equality) {
    code += '    if (this.value == null) {\n'
  } else {
    code += '    if (this.value === null) {\n'
  }

  if (features.println) {
    code += '      println("Value is null")\n'
  } else {
    code += '      console.log("Value is null")\n'
  }

  code += '      return false\n'
  code += '    }\n'
  code += '    return true\n'
  code += '  }\n'

  if (features.classes) {
    code += '}\n'
  }

  return code
}

/**
 * Snapshot testing helper
 */
export function createSnapshot(input: string, description: string) {
  return {
    description,
    input: input.trim(),
    output: transformWithPlugin(input).trim()
  }
}
