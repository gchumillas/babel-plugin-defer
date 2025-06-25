import { BabelTranspiler } from '../src/index'

describe('Integration Tests', () => {
  const transpiler = new BabelTranspiler({ debug: false })

  describe('Real-world code examples', () => {
    it('should transform a complete function with multiple features', () => {
      const input = `
        import { createConnection } from './db'
        
        async function processUser(userId) {
          let connection = null
          
          try {
            connection = createConnection()
            defer(() => {
              if (connection) {
                connection.close()
              }
            })
            
            println("Connecting to database...")
            
            const user = await connection.findUser(userId)
            if (user == null) {
              println("User not found")
              return null
            }
            
            if (user.status != "active") {
              println(\`User \${user.name} is not active\`)
              return null
            }
            
            println(\`Processing user: \${user.name}\`)
            const result = await processUserData(user)
            
            println("User processed successfully")
            return result
            
          } catch (error) {
            println(\`Error: \${error.message}\`)
            throw error
          }
        }
        
        export default processUser
      `
      
      const output = transpiler.transform(input)
      
      // Should transform equality operators
      expect(output).toContain('user === null')
      expect(output).toContain('user.status !== "active"')
      
      // Should transform println calls
      expect(output).toContain('console.log(`${"Connecting to database..."}\\n`)')
      expect(output).toContain('console.log(`${"User not found"}\\n`)')
      expect(output).toContain('console.log(`${`User ${user.name} is not active`}\\n`)')
      expect(output).toContain('console.log(`${`Processing user: ${user.name}`}\\n`)')
      expect(output).toContain('console.log(`${"User processed successfully"}\\n`)')
      expect(output).toContain('console.log(`${`Error: ${error.message}`}\\n`)')
      
      // Should preserve imports and exports
      expect(output).toContain('import { createConnection } from \'./db\'')
      expect(output).toContain('export default processUser')
      
      // Should preserve async/await
      expect(output).toContain('async function processUser')
      expect(output).toContain('await connection.findUser')
      expect(output).toContain('await processUserData')
    })

    it('should handle React component with transformations', () => {
      const input = `
        import React, { useState, useEffect } from 'react'
        
        function UserProfile({ userId }) {
          const [user, setUser] = useState(null)
          const [loading, setLoading] = useState(true)
          
          useEffect(() => {
            defer(() => setLoading(false))
            
            fetchUser(userId).then(userData => {
              if (userData == null) {
                println("Failed to load user")
                return
              }
              
              println(\`Loaded user: \${userData.name}\`)
              setUser(userData)
            })
          }, [userId])
          
          if (loading) {
            return <div>Loading...</div>
          }
          
          if (user == null) {
            return <div>User not found</div>
          }
          
          return (
            <div>
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
          )
        }
        
        export default UserProfile
      `
      
      const output = transpiler.transform(input)
      
      // Should transform equality operators
      expect(output).toContain('userData === null')
      expect(output).toContain('user === null')
      
      // Should transform println calls
      expect(output).toContain('console.log(`${"Failed to load user"}\\n`)')
      expect(output).toContain('console.log(`${`Loaded user: ${userData.name}`}\\n`)')
      
      // Should preserve React JSX
      expect(output).toContain('<div>Loading...</div>')
      expect(output).toContain('<div>User not found</div>')
      expect(output).toContain('<h1>{user.name}</h1>')
    })

    it('should handle class with methods', () => {
      const input = `
        class DatabaseManager {
          constructor(config) {
            this.config = config
            this.connection = null
          }
          
          async connect() {
            if (this.connection != null) {
              println("Already connected")
              return
            }
            
            println("Establishing connection...")
            this.connection = await createConnection(this.config)
            
            defer(() => {
              if (this.connection != null) {
                this.connection.close()
                println("Connection closed")
              }
            })
            
            println("Connection established")
          }
          
          isConnected() {
            return this.connection != null
          }
        }
      `
      
      const output = transpiler.transform(input)
      
      // Should transform equality operators
      expect(output).toContain('this.connection !== null')
      expect(output).toContain('this.connection !== null')
      
      // Should transform println calls
      expect(output).toContain('console.log(`${"Already connected"}\\n`)')
      expect(output).toContain('console.log(`${"Establishing connection..."}\\n`)')
      expect(output).toContain('console.log(`${"Connection closed"}\\n`)')
      expect(output).toContain('console.log(`${"Connection established"}\\n`)')
      
      // Should preserve class structure
      expect(output).toContain('class DatabaseManager')
      expect(output).toContain('constructor(config)')
      expect(output).toContain('async connect()')
      expect(output).toContain('isConnected()')
    })
  })

  describe('Edge cases', () => {
    it('should handle nested function calls', () => {
      const input = `
        function outer() {
          println("Outer function")
          
          function inner() {
            println("Inner function")
            if (value == expected) {
              println("Match found")
            }
          }
          
          inner()
        }
      `
      
      const output = transpiler.transform(input)
      
      expect(output).toContain('console.log(`${"Outer function"}\\n`)')
      expect(output).toContain('console.log(`${"Inner function"}\\n`)')
      expect(output).toContain('console.log(`${"Match found"}\\n`)')
      expect(output).toContain('value === expected')
    })

    it('should handle arrow functions', () => {
      const input = `
        const processItems = (items) => {
          if (items == null) {
            println("No items to process")
            return []
          }
          
          return items.filter(item => {
            if (item.status != "active") {
              println(\`Skipping inactive item: \${item.id}\`)
              return false
            }
            return true
          })
        }
      `
      
      const output = transpiler.transform(input)
      
      expect(output).toContain('items === null')
      expect(output).toContain('item.status !== "active"')
      expect(output).toContain('console.log(`${"No items to process"}\\n`)')
      expect(output).toContain('console.log(`${`Skipping inactive item: ${item.id}`}\\n`)')
    })
  })
})
