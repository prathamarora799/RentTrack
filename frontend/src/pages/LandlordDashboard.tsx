import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LandlordDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [payments, setPayments] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedImage, setSelectedImage] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState({ show: false, msg: '', type: '' })
  const [editTenant, setEditTenant] = useState<any>(null)
  const [rentInput, setRentInput] = useState('')
  const [dueDateInput, setDueDateInput] = useState('')

  const showToast = (msg: string, type: string) => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000)
  }

  const fetchPayments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/payments/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setPayments(data)
    } catch {
      showToast('Error loading payments', 'error')
    }
    setLoading(false)
  }

  const fetchTenants = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setTenants(data)
    } catch {
      console.log('Error loading tenants')
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchTenants()
  }, [])

  const handleStatus = async (id: string, status: string) => {
    try {
      await fetch(`http://localhost:5000/api/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      showToast(`Payment ${status}!`, 'success')
      fetchPayments()
    } catch {
      showToast('Error updating', 'error')
    }
  }

  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Remove this tenant?')) return
    try {
      await fetch(`http://localhost:5000/api/users/tenants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Tenant removed!', 'error')
      fetchTenants()
    } catch {
      showToast('Error removing tenant', 'error')
    }
  }

  const handleSetRent = async () => {
    if (!rentInput || !dueDateInput) return
    try {
      await fetch(`http://localhost:5000/api/users/tenants/${editTenant._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rentAmount: rentInput,
          dueDate: dueDateInput
        })
      })
      showToast('Rent details updated!', 'success')
      setEditTenant(null)
      fetchTenants()
    } catch {
      showToast('Error updating', 'error')
    }
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0)
  const confirmed = payments.filter(p => p.status === 'confirmed').length
  const pending = payments.filter(p => p.status === 'pending').length
  const flagged = payments.filter(p => p.status === 'flagged').length

  const filteredPayments = payments.filter(p =>
    p.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.month?.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor: any = {
    confirmed: { bg: '#EAF3DE', text: '#3B6D11' },
    pending: { bg: '#FAEEDA', text: '#854F0B' },
    flagged: { bg: '#FCEBEB', text: '#791F1F' }
  }

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'tenants', icon: '👥', label: 'Tenants' },
    { id: 'payments', icon: '🧾', label: 'All Payments' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'error' ? '#FCEBEB' : '#EAF3DE',
          border: `1px solid ${toast.type === 'error' ? '#F7C1C1' : '#9FE1CB'}`,
          color: toast.type === 'error' ? '#791F1F' : '#3B6D11',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: 500
        }}>
          {toast.msg}
        </div>
      )}

      {/* Set Rent Modal */}
      {editTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '14px', padding: '28px', width: '380px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#1a1a1a' }}>Set Rent Details</h3>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 20px' }}>
              For: <strong>{editTenant.name}</strong>
            </p>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                Monthly Rent ($)
              </label>
              <input
                type="number"
                value={rentInput}
                onChange={(e) => setRentInput(e.target.value)}
                placeholder="e.g. 1200"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                Due Date (day of month 1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                placeholder="e.g. 1 = 1st of every month"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
              />
              <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0 0' }}>
                Tenant will get reminder 7 days, 3 days, and 1 day before this date
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSetRent}
                style={{ flex: 1, padding: '10px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                Save
              </button>
              <button onClick={() => setEditTenant(null)}
                style={{ flex: 1, padding: '10px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div onClick={() => setSelectedImage('')}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'relative' }}>
            <img src={selectedImage} alt="proof" style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '10px' }} />
            <button onClick={() => setSelectedImage('')}
              style={{ position: 'absolute', top: '-12px', right: '-12px', background: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 700 }}>
              X
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0C447C', display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏠</span>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: 500 }}>RentTrack</h2>
              <p style={{ color: '#B5D4F4', margin: 0, fontSize: '11px' }}>Landlord Portal</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id}
              onClick={() => {
                if (item.id === 'profile') navigate('/profile')
                else setActivePage(item.id)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                background: activePage === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activePage === item.id ? 'white' : '#B5D4F4',
              }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ fontSize: '13px' }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 8px', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div onClick={() => { localStorage.clear(); navigate('/') }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#B5D4F4' }}>
            <span style={{ fontSize: '16px' }}>🚪</span>
            <span style={{ fontSize: '13px' }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#f0f4ff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #e0e0e0' }}>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#1a1a1a', textTransform: 'capitalize' }}>
            {activePage}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 500, color: '#534AB7' }}>
              DT
            </div>
            <span style={{ fontSize: '13px', color: '#333' }}>Landlord</span>
          </div>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>

          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Total tenants', value: tenants.length, color: '#185FA5', bg: '#E6F1FB', icon: '👥' },
                  { label: 'Confirmed', value: confirmed, color: '#3B6D11', bg: '#EAF3DE', icon: '✅' },
                  { label: 'Pending', value: pending, color: '#854F0B', bg: '#FAEEDA', icon: '⏳' },
                  { label: 'Collected', value: `$${total}`, color: '#185FA5', bg: '#E6F1FB', icon: '💰' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '0.5px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {s.icon}
                    </div>
                    <div>
                      <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px' }}>{s.label}</p>
                      <p style={{ color: s.color, fontSize: '20px', fontWeight: 500, margin: 0 }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {flagged > 0 && (
                <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🚩</span>
                  <p style={{ color: '#791F1F', margin: 0, fontSize: '13px' }}>
                    <strong>{flagged}</strong> payment(s) flagged — please review!
                  </p>
                  <button onClick={() => setActivePage('payments')}
                    style={{ marginLeft: 'auto', padding: '6px 14px', background: '#791F1F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    Review
                  </button>
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '0.5px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#1a1a1a' }}>Recent payments</h3>
                  <button onClick={() => setActivePage('payments')}
                    style={{ padding: '6px 14px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    View all
                  </button>
                </div>
                {payments.slice(0, 5).map((p) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '0.5px solid #f0f0f0', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 500, color: '#185FA5' }}>
                        {p.tenant?.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#1a1a1a' }}>{p.tenant?.name || 'Tenant'}</p>
                        <p style={{ margin: '2px 0 0', color: '#888', fontSize: '12px' }}>{p.month} · {p.method}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <p style={{ margin: 0, fontWeight: 500, color: '#185FA5', fontSize: '16px' }}>${p.amount}</p>
                      <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: statusColor[p.status]?.bg, color: statusColor[p.status]?.text }}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TENANTS */}
          {activePage === 'tenants' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '0.5px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#1a1a1a' }}>All tenants</h3>
              {tenants.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>No tenants yet</p>
              ) : (
                tenants.map((t) => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fafafa', borderRadius: '10px', marginBottom: '10px', border: '0.5px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 500, color: '#185FA5' }}>
                        {t.name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, color: '#1a1a1a' }}>{t.name}</p>
                        <p style={{ margin: '2px 0 0', color: '#888', fontSize: '12px' }}>{t.email}</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {t.unitNumber && (
                            <span style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: '20px' }}>
                              Unit {t.unitNumber}
                            </span>
                          )}
                          {t.rentAmount ? (
                            <span style={{ fontSize: '11px', background: '#EAF3DE', color: '#3B6D11', padding: '2px 8px', borderRadius: '20px' }}>
                              ${t.rentAmount}/mo
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', background: '#FAEEDA', color: '#854F0B', padding: '2px 8px', borderRadius: '20px' }}>
                              Rent not set
                            </span>
                          )}
                          {t.dueDate && (
                            <span style={{ fontSize: '11px', background: '#FAEEDA', color: '#854F0B', padding: '2px 8px', borderRadius: '20px' }}>
                              Due: Day {t.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditTenant(t)
                          setRentInput(t.rentAmount || '')
                          setDueDateInput(t.dueDate || '')
                        }}
                        style={{ padding: '7px 12px', background: '#E6F1FB', color: '#185FA5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                        Set Rent
                      </button>
                      <button onClick={() => handleDeleteTenant(t._id)}
                        style={{ padding: '7px 12px', background: '#FCEBEB', color: '#791F1F', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PAYMENTS */}
          {activePage === 'payments' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '0.5px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#1a1a1a' }}>All payments</h3>
                <input
                  type="text"
                  placeholder="Search tenant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', width: '180px', outline: 'none' }}
                />
              </div>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
              ) : filteredPayments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>No payments found</p>
              ) : (
                filteredPayments.map((p) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', border: '0.5px solid #f0f0f0', borderRadius: '10px', marginBottom: '10px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 500, color: '#185FA5' }}>
                        {p.tenant?.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, color: '#1a1a1a' }}>{p.tenant?.name}</p>
                        <p style={{ margin: '2px 0 0', color: '#888', fontSize: '12px' }}>{p.tenant?.email}</p>
                        <p style={{ margin: '2px 0 0', color: '#888', fontSize: '12px' }}>{p.month} · {p.method} · {new Date(p.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.proofImage && (
                        <img
                          src={`http://localhost:5000${p.proofImage}`}
                          alt="proof"
                          onClick={() => setSelectedImage(`http://localhost:5000${p.proofImage}`)}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0', cursor: 'pointer' }}
                        />
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: '16px', color: '#185FA5' }}>${p.amount}</p>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: statusColor[p.status]?.bg, color: statusColor[p.status]?.text }}>
                          {p.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button onClick={() => handleStatus(p._id, 'confirmed')}
                          style={{ padding: '5px 10px', background: '#EAF3DE', color: '#3B6D11', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                          Confirm
                        </button>
                        <button onClick={() => handleStatus(p._id, 'flagged')}
                          style={{ padding: '5px 10px', background: '#FCEBEB', color: '#791F1F', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                          Flag
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandlordDashboard