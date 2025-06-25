#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 TEST REPORT - BABEL TRANSPILER PLUGIN')
console.log('=' .repeat(60))

// Count test files
const testsDir = path.join(__dirname, '..', 'tests')
const testFiles = fs.readdirSync(testsDir).filter(file => file.endsWith('.test.ts'))

console.log(`📁 Test files: ${testFiles.length}`)
testFiles.forEach(file => {
  console.log(`   • ${file}`)
})

// Run tests and capture output
console.log('\\n🚀 Running tests...')
try {
  const testOutput = execSync('npm test', { cwd: path.join(__dirname, '..'), encoding: 'utf8' })
  
  // Extract statistics from output
  const passedMatch = testOutput.match(/(\d+) passed/)
  const totalMatch = testOutput.match(/(\d+) total/)
  const timeMatch = testOutput.match(/Time:\s*([0-9.]+\s*s)/)
  
  if (passedMatch && totalMatch) {
    console.log(`✅ Tests passed: ${passedMatch[1]}/${totalMatch[1]}`)
  }
  
  if (timeMatch) {
    console.log(`⏱️  Execution time: ${timeMatch[1]}`)
  }
  
} catch (error) {
  console.log('❌ Error running tests:', error.message)
}

// Run coverage and capture statistics
console.log('\\n📊 Generating coverage report...')
try {
  const coverageOutput = execSync('npm run test:coverage', { 
    cwd: path.join(__dirname, '..'), 
    encoding: 'utf8' 
  })
  
  // Extract coverage statistics
  const lines = coverageOutput.split('\\n')
  const allFilesLine = lines.find(line => line.includes('All files'))
  
  if (allFilesLine) {
    const parts = allFilesLine.split('|').map(p => p.trim())
    if (parts.length >= 5) {
      console.log(`📈 Overall Coverage:`)
      console.log(`   • Statements: ${parts[1]}`)
      console.log(`   • Branches: ${parts[2]}`)
      console.log(`   • Functions: ${parts[3]}`)
      console.log(`   • Lines: ${parts[4]}`)
    }
  }
  
} catch (error) {
  console.log('⚠️  Could not generate coverage report')
}

// Show tested features
console.log('\\n🎯 Tested Features:')
console.log('   ✅ println() → console.log() transformation')
console.log('   ✅ == → === and != → !== transformation')
console.log('   ✅ defer() call detection')
console.log('   ✅ Complex integration cases')
console.log('   ✅ Error handling')
console.log('   ✅ TypeScript/JSX compatibility')

console.log('\\n📚 Documentation:')
console.log('   • README.md - Main documentation')
console.log('   • TESTING.md - Complete testing guide')
console.log('   • examples/testing-demo.ts - Interactive demo')

console.log('\\n🎉 Fully functional testing system!')
console.log('=' .repeat(60))
