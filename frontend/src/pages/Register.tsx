import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendWelcomeNotification } from '../pushService'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tenant')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    // Validations
    if (!name) {
      setMessage('Full name is required')
      return
    }
    if (name.length < 2) {
      setMessage('Name must be at least 2 characters')
      return
    }
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
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '0.5px solid #e0e0e0', padding: '36px', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: '#185FA5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>
            🏠
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 4px' }}>Create account</h2>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Join RentTrack today</p>
        </div>

        {[
          { label: 'Full name', type: 'text', value: name, onChange: setName, placeholder: 'Your full name' },
          { label: 'Email address', type: 'email', value: email, onChange: setEmail, placeholder: 'you@email.com' },
          { label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: 'Min 6 characters' },
        ].map((field, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>{field.label}</label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => { field.onChange(e.target.value); setMessage('') }}
              placeholder={field.placeholder}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>I am a</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>

        {message && (
          <div style={{ background: '#FCEBEB', color: '#791F1F', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {message}
          </div>
        )}

        <button onClick={handleRegister}
          style={{ width: '100%', padding: '11px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
          Create account
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '16px' }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/')} style={{ color: '#185FA5', cursor: 'pointer', fontWeight: 500 }}>
            Login here
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register