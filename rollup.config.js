const typescript = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')

module.exports = [
  // Build main plugin (CommonJS and ESM) - for Babel use only
  {
    input: 'src/plugin.ts',
    output: [
      {
        file: 'dist/plugin.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/plugin.mjs',
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

  // Build runtime-only (browser-safe)
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
  },

  // Build main entry point (combines plugin and runtime exports)
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
  }
]
