// src/pages/login-test.tsx
import { useState } from 'react'
import { AuthResponse } from '@/types/auth'

export default function LoginTest() {
  const [email, setEmail] = useState('admin@carterisland.com')
  const [password, setPassword] = useState('admin123')
  const [result, setResult] = useState<AuthResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data: AuthResponse = await response.json()
      setResult(data)
      
      if (data.success && data.token) {
        // Store token in localStorage for testing
        localStorage.setItem('token', data.token)
        console.log('Token saved:', data.token)
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '500px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>
        🚢 Carter Island AUV Login
      </h1>
      
      <form onSubmit={handleLogin} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Logging in...' : '🔐 Login'}
        </button>
      </form>
      
      {result && (
        <div style={{
          padding: '20px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          <h3>{result.success ? '✅ LOGIN SUCCESS' : '❌ LOGIN FAILED'}</h3>
          <p><strong>Message:</strong> {result.message}</p>
          
          {result.success && result.user && (
            <div style={{ marginTop: '15px' }}>
              <h4>👤 User Info:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>Name:</strong> {result.user.firstName} {result.user.lastName}</li>
                <li><strong>Email:</strong> {result.user.email}</li>
                <li><strong>Role:</strong> {result.user.role}</li>
                <li><strong>Department:</strong> {result.user.department}</li>
                <li><strong>Position:</strong> {result.user.position}</li>
              </ul>
            </div>
          )}
          
          <details style={{ marginTop: '15px' }}>
            <summary style={{ cursor: 'pointer' }}>🔍 View Full Response</summary>
            <pre style={{ 
              fontSize: '12px', 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '3px',
              overflow: 'auto',
              marginTop: '10px'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px' 
      }}>
        <h4>🧪 Test Credentials:</h4>
        <p><strong>Email:</strong> admin@carterisland.com</p>
        <p><strong>Password:</strong> admin123</p>
        <p><strong>Role:</strong> ADMIN</p>
      </div>
    </div>
  )
}