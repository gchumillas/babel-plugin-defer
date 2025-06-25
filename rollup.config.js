const typescript = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')

module.exports = [
  // Build JavaScript (CommonJS and ESM)
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
        module: 'esnext' // Force ES modules
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
