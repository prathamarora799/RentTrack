import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setName(data.name || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setUnitNumber(data.unitNumber || '')
        setRentAmount(data.rentAmount || '')
        setDueDate(data.dueDate || '')
      } catch {
        setMessage('Error loading profile')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleUpdate = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, unitNumber })
      })
      if (res.ok) {
        localStorage.setItem('name', name)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setMessage('Error updating profile')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>

      {/* Navbar */}
      <div style={{ background: '#185FA5', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏠</span>
          <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>RentTrack</h2>
        </div>
        <button onClick={() => navigate(role === 'landlord' ? '/landlord' : '/tenant')}
          style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
          ← Back
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Profile Header */}
        <div style={{ background: '#185FA5', borderRadius: '16px', padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '32px' }}>
            👤
          </div>
          <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: '20px' }}>{name}</h2>
          <p style={{ color: '#B5D4F4', margin: 0, fontSize: '13px', textTransform: 'capitalize' }}>{role}</p>
          {unitNumber && <p style={{ color: '#B5D4F4', margin: '4px 0 0', fontSize: '13px' }}>Unit {unitNumber}</p>}
        </div>

        {/* Success Toast */}
        {success && (
          <div style={{ background: '#EAF3DE', border: '1px solid #9FE1CB', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#3B6D11', fontSize: '14px', fontWeight: 500 }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Profile Form */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '0.5px solid #e0e0e0', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a1a1a', fontSize: '16px' }}>Personal Information</h3>

          {loading ? (
            <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p>
          ) : (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Email Address</label>
                <input type="email" value={email} disabled
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px', background: '#f5f5f5', color: '#888' }} />
                <p style={{ fontSize: '11px', color: '#aaa', margin: '4px 0 0' }}>Email cannot be changed</p>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+64 21 000 0000"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>

              {role === 'tenant' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Unit Number</label>
                  <input type="text" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="e.g. 2A"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
                </div>
              )}

              {message && <p style={{ color: 'red', fontSize: '13px' }}>{message}</p>}

              <button onClick={handleUpdate}
                style={{ width: '100%', padding: '11px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '15px', marginTop: '8px' }}>
                Save Changes
              </button>
            </>
          )}
        </div>

        {/* Rent Info — Tenant Only */}
        {role === 'tenant' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '0.5px solid #e0e0e0' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1a1a1a', fontSize: '16px' }}>Rent Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#E6F1FB', borderRadius: '10px', padding: '16px' }}>
                <p style={{ color: '#0C447C', fontSize: '12px', margin: '0 0 4px' }}>Monthly Rent</p>
                <p style={{ color: '#185FA5', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                  {rentAmount ? `$${rentAmount}` : 'Not set'}
                </p>
              </div>
              <div style={{ background: '#FAEEDA', borderRadius: '10px', padding: '16px' }}>
                <p style={{ color: '#854F0B', fontSize: '12px', margin: '0 0 4px' }}>Due Date</p>
                <p style={{ color: '#854F0B', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                  {dueDate ? `Day ${dueDate}` : 'Not set'}
                </p>
              </div>
            </div>
            <p style={{ color: '#aaa', fontSize: '12px', margin: '12px 0 0', textAlign: 'center' }}>
              Contact your landlord to update rent details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile