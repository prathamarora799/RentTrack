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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    <div style={{ minHeight: '100vh', background: '#F0FDF4', display: 'flex', flexDirection: 'column' }}>

      {/* Topbar */}
      <div style={{ background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #D1FAE5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#0A3622', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🏠</div>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#052E16' }}>RentTrack</span>
          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>/</span>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>Profile</span>
        </div>
        <button onClick={() => navigate(role === 'landlord' ? '/landlord' : '/tenant')}
          style={{ padding: '7px 14px', background: '#F0FDF4', color: '#166534', border: '1px solid #D1FAE5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
          ← Back
        </button>
      </div>

      {/* Green header */}
      <div style={{ background: '#0A3622', padding: '24px 24px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#166534', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86EFAC', fontSize: '22px', fontWeight: 500 }}>
            {name.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 500 }}>{name || 'Loading...'}</div>
            <div style={{ color: '#86EFAC', fontSize: '13px', textTransform: 'capitalize', marginTop: '2px' }}>{role} account</div>
            {unitNumber && <div style={{ color: '#4ADE80', fontSize: '12px', marginTop: '2px' }}>Unit {unitNumber}</div>}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px', marginTop: '-28px', maxWidth: '600px', width: '100%', margin: '-28px auto 0' }}>

        {/* Success */}
        {success && (
          <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', color: '#166534', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Profile form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '0.5px solid #D1FAE5', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', color: '#052E16', fontWeight: 500 }}>Personal information</h3>

          {loading ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>Loading...</p>
          ) : (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }}
                  onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Email address</label>
                <input type="email" value={email} disabled
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', background: '#F5F5F5', color: '#9CA3AF' }} />
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0' }}>Email cannot be changed</p>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Phone number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+64 21 000 0000"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }}
                  onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>

              {role === 'tenant' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Unit number</label>
                  <input type="text" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)}
                    placeholder="e.g. 2A"
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }}
                    onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                    onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                  />
                </div>
              )}

              {message && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '14px' }}>
                  {message}
                </div>
              )}

              <button onClick={handleUpdate}
                style={{ width: '100%', padding: '12px', background: '#0A3622', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '14px', marginTop: '4px' }}>
                Save changes
              </button>
            </>
          )}
        </div>

        {/* Rent info — tenant only */}
        {role === 'tenant' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '0.5px solid #D1FAE5', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#052E16', fontWeight: 500 }}>Rent information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '0.5px solid #D1FAE5' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px', fontWeight: 500 }}>Monthly rent</div>
                <div style={{ fontSize: '26px', fontWeight: 500, color: '#052E16' }}>
                  {rentAmount ? `$${rentAmount}` : <span style={{ fontSize: '16px', color: '#9CA3AF' }}>Not set</span>}
                </div>
              </div>
              <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '16px', border: '0.5px solid #FDE68A' }}>
                <div style={{ fontSize: '11px', color: '#92400E', marginBottom: '6px', fontWeight: 500 }}>Due date</div>
                <div style={{ fontSize: '26px', fontWeight: 500, color: '#D97706' }}>
                  {dueDate ? `Day ${dueDate}` : <span style={{ fontSize: '16px', color: '#9CA3AF' }}>Not set</span>}
                </div>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '12px 0 0', textAlign: 'center' }}>
              Contact your landlord to update rent details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile