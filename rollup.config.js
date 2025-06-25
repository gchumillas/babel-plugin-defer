const typescript = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')

module.exports = [
  // Build main plugin (CommonJS and ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true,
        module: 'esnext'
      })
    ],
    external: [
      '@babel/core',
      '@babel/types', 
      '@babel/traverse'
    ]
  },

  // Build runtime-only bundle (for browser)
  {
    input: 'src/runtime.ts',
    output: [
      {
        file: 'dist/runtime.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/runtime.mjs',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true,
        module: 'esnext'
      })
    ]
  },
  
  // Build TypeScript declarations (bundled)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts.default()],
    external: [
      '@babel/core',
      '@babel/types',
      '@babel/traverse'
    ]
  },

  // Build runtime TypeScript declarations
  {
    input: 'src/runtime.ts',
    output: {
      file: 'dist/runtime.d.ts',
      format: 'es'
    },
    plugins: [dts.default()]
  }
]
