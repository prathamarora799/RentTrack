import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendWelcomeNotification } from '../pushService'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tenant')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!name) { setMessage('Full name is required'); return }
    if (name.length < 2) { setMessage('Name must be at least 2 characters'); return }
    if (!email) { setMessage('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setMessage('Please enter a valid email'); return }
    if (!password) { setMessage('Password is required'); return }
    if (password.length < 6) { setMessage('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })
      const data = await res.json()
      if (res.ok) {
        sendWelcomeNotification(name)
        navigate('/')
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

      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '16px' }}>🏠</span>
        </div>
        <span style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>RentTrack</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 500, margin: '0 0 8px' }}>Create account</h1>
            <p style={{ color: '#86EFAC', fontSize: '14px', margin: 0 }}>Join RentTrack today — it's free</p>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '28px' }}>

            {/* Role selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              <div
                onClick={() => setRole('tenant')}
                style={{ padding: '12px', border: `2px solid ${role === 'tenant' ? '#22C55E' : '#E5E7EB'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: role === 'tenant' ? '#F0FDF4' : 'white' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏠</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: role === 'tenant' ? '#166534' : '#374151' }}>Tenant</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>I pay rent</div>
              </div>
              <div
                onClick={() => setRole('landlord')}
                style={{ padding: '12px', border: `2px solid ${role === 'landlord' ? '#22C55E' : '#E5E7EB'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: role === 'landlord' ? '#F0FDF4' : 'white' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏢</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: role === 'landlord' ? '#166534' : '#374151' }}>Landlord</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>I collect rent</div>
              </div>
            </div>

            {[
              { label: 'Full name', type: 'text', value: name, set: setName, placeholder: 'Your full name' },
              { label: 'Email address', type: 'email', value: email, set: setEmail, placeholder: 'you@email.com' },
              { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: 'Min 6 characters' },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => { f.set(e.target.value); setMessage('') }}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#111827', background: '#F9FAFB' }}
                  onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>
            ))}

            {message && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '14px' }}>
                {message}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#86EFAC' : '#0A3622', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '16px' }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/')} style={{ color: '#166534', cursor: 'pointer', fontWeight: 500 }}>
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register