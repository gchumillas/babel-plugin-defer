import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Welcome from './components/Welcome'
import { defer } from 'babel-plugin-defer/runtime'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  // Example 6: Handling multiple resources with specific order
  const setupComplexOperation = () => {
    console.log('Setting up complex operation...')
    
    // First: Open database connection
    const db = { name: 'mydb', isOpen: true }
    console.log('Database opened')
    defer(() => {
      db.isOpen = false
      console.log('Database closed')
    })
    
    // Second: Create user session
    const session = { userId: 'user123', token: 'abc123', isActive: true }
    console.log('User session created')
    defer(() => {
      session.isActive = false
      console.log('User session destroyed')
    })
    
    // Third: Initialize cache
    const cache = new Map()
    cache.set('initialized', true)
    console.log('Cache initialized')
    defer(() => {
      cache.clear()
      console.log('Cache cleared')
    })
    
    setLogs(prev => [...prev, 'Complex operation setup completed'])
  }

  // Example 7: Conditional cleanup
  const conditionalSetup = (enableFeature: boolean) => {
    console.log('Starting conditional setup...')
    
    if (enableFeature) {
      const feature = { name: 'AdvancedFeature', isEnabled: true }
      console.log('Advanced feature enabled')
      
      defer(() => {
        feature.isEnabled = false
        console.log('Advanced feature disabled')
      })
    }
    
    // This defer always runs
    defer(() => {
      console.log('Conditional setup completed')
    })
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Defer Examples</h1>
      
      <Welcome name="Developer" message="Your React app with defer is ready!" />
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3>Defer Examples:</h3>
          
          <button onClick={setupComplexOperation}>
            5. Complex Operation (multiple resources)
          </button>
          
          <button onClick={() => conditionalSetup(true)}>
            6. Conditional Setup (conditional cleanup)
          </button>
          
          <button onClick={() => setLogs([])}>
            Clear Logs
          </button>
        </div>

        {logs.length > 0 && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <h4>Activity Logs:</h4>
            {logs.map((log, index) => (
              <div key={index} style={{ 
                fontSize: '12px', 
                fontFamily: 'monospace',
                padding: '2px 0',
                borderBottom: '1px solid #ddd'
              }}>
                {log}
              </div>
            ))}
          </div>
        )}
        
        <p style={{ marginTop: '20px' }}>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App