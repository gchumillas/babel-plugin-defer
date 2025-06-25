const { build } = require('esbuild')

async function buildBundle() {
  try {
    // Build CommonJS bundle
    await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      outfile: 'dist/index.js',
      format: 'cjs',
      platform: 'node',
      target: 'node16',
      sourcemap: true,
      external: ['@babel/core', '@babel/types', '@babel/traverse'],
      minify: false,
      keepNames: true,
      packages: 'external' // Don't bundle any dependencies
    })

    // Build ESM bundle
    await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      outfile: 'dist/index.mjs',
      format: 'esm',
      platform: 'node',
      target: 'node16',
      sourcemap: true,
      external: ['@babel/core', '@babel/types', '@babel/traverse'],
      minify: false,
      keepNames: true,
      packages: 'external' // Don't bundle any dependencies
    })

    console.log('✅ Bundle created successfully!')
    console.log('📦 Output files:')
    console.log('  - dist/index.js (CommonJS bundle)')
    console.log('  - dist/index.js.map (CommonJS source map)')
    console.log('  - dist/index.mjs (ESM bundle)')
    console.log('  - dist/index.mjs.map (ESM source map)')
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildBundle()
