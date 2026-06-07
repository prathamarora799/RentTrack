import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeToPush } from '../pushService'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email) { setMessage('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setMessage('Please enter a valid email'); return }
    if (!password) { setMessage('Password is required'); return }
    if (password.length < 6) { setMessage('Password must be at least 6 characters'); return }

    setLoading(true)
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
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A3622', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '16px' }}>🏠</span>
        </div>
        <span style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>RentTrack</span>
      </div>

      {/* Center content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 500, margin: '0 0 8px' }}>Welcome back</h1>
            <p style={{ color: '#86EFAC', fontSize: '14px', margin: 0 }}>Sign in to your RentTrack account</p>
          </div>

          {/* Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px' }}>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setMessage('') }}
                placeholder="you@email.com"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#111827', background: '#F9FAFB' }}
                onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setMessage('') }}
                placeholder="Enter your password"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#111827', background: '#F9FAFB' }}
                onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
              />
            </div>

            {message && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
                {message}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#86EFAC' : '#0A3622', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#F0FDF4' }}></div>
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#F0FDF4' }}></div>
            </div>

            <button
              onClick={() => navigate('/register')}
              style={{ width: '100%', padding: '12px', background: '#F0FDF4', color: '#166534', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
              Create new account
            </button>
          </div>

          <p style={{ color: '#4ADE80', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
            Secure rent payment tracking for tenants and landlords
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login