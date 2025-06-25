import { BabelTranspiler } from '../src/index'

// Example code to demonstrate transformations
const exampleCode = `
import { createConnection } from './database'

async function processUser(userId) {
  const connection = createConnection()
  
  // defer() will be implemented in the future
  defer(() => {
    connection.close()
  })
  
  // println() transforms to console.log() with \\n
  println("Processing user...")
  println(\`User ID: \${userId}\`)
  
  const user = await connection.findUser(userId)
  
  // Equality operators transform to strict
  if (user == null) {
    println("User not found")
    return null
  }
  
  if (user.status != "active") {
    println("User is not active")
    return null
  }
  
  println("User processed successfully")
  return user
}

export default processUser
`

console.log('=== DEMO: Transpiler Testing System ===\\n')

// Create transpiler instance
const transpiler = new BabelTranspiler({ debug: false })

// Show original code
console.log('📝 Original Code:')
console.log(exampleCode)

// Transform code
console.log('\\n✨ Transformed Code:')
const transformedCode = transpiler.transform(exampleCode)
console.log(transformedCode)

// Summary of transformations
console.log('\\n🔍 Applied Transformations:')
console.log('• println() → console.log(`${...}\\\\n`)')
console.log('• == → ===')
console.log('• != → !==')
console.log('• defer() detected (future implementation)')

console.log('\\n✅ All transformations have been tested with Jest!')
console.log('\\n🧪 To run tests:')
console.log('• npm test                 # All tests')
console.log('• npm run test:watch       # Watch mode')
console.log('• npm run test:coverage    # With coverage')
console.log('• npm test -- --testNamePattern="println"  # Specific tests')
