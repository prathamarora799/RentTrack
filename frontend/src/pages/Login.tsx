import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeToPush } from '../pushService'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    // Validations
    if (!email) {
      setMessage('Email is required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address')
      return
    }
    if (!password) {
      setMessage('Password is required')
      return
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('name', data.name)
        await subscribeToPush(data.token)
        if (data.role === 'landlord') navigate('/landlord')
        else navigate('/tenant')
      } else {
        setMessage(data.message)
      }
    } catch {
      setMessage('Server error — please try again')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f0f4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '0.5px solid #e0e0e0', padding: '36px', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: '#185FA5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>
            🏠
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 4px' }}>RentTrack</h2>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Welcome back! Please login</p>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setMessage('') }}
            placeholder="you@email.com"
            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${message && !email ? '#dc2626' : '#e0e0e0'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setMessage('') }}
            placeholder="Enter your password"
            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${message && !password ? '#dc2626' : '#e0e0e0'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        {message && (
          <div style={{ background: '#FCEBEB', color: '#791F1F', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {message}
          </div>
        )}

        <button onClick={handleLogin}
          style={{ width: '100%', padding: '11px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
          Login to RentTrack
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: '#e0e0e0' }}></div>
          <span style={{ fontSize: '12px', color: '#aaa' }}>or</span>
          <div style={{ flex: 1, height: '0.5px', background: '#e0e0e0' }}></div>
        </div>

        <button onClick={() => navigate('/register')}
          style={{ width: '100%', padding: '11px', background: '#f5f5f5', color: '#333', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
          Create new account
        </button>
      </div>
    </div>
  )
}

export default Login