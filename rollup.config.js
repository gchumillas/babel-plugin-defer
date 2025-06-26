const typescript = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')

module.exports = [
  // Build main entry point (plugin only - for Babel configuration)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
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

  // Build runtime-only (browser-safe functions)
  {
    input: 'src/runtime.ts',
    output: [
      {
        file: 'dist/runtime.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
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
    // No external dependencies - this should be browser-safe
  },
  
  // Build TypeScript declarations for main entry
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

  // Build TypeScript declarations for runtime
  {
    input: 'src/runtime.ts',
    output: {
      file: 'dist/runtime.d.ts',
      format: 'es'
    },
    plugins: [dts.default()]
  }
]
