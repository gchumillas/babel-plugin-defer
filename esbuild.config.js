const { build } = require('esbuild')

async function buildBundle() {
  try {
    // Build JavaScript bundle
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

    console.log('✅ Bundle created successfully!')
    console.log('📦 Output files:')
    console.log('  - dist/index.js (main bundle)')
    console.log('  - dist/index.js.map (source map)')
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildBundle()
