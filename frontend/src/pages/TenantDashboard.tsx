import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function TenantDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name') || 'Tenant'
  const [payments, setPayments] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [activePage, setActivePage] = useState('dashboard')
  const [toast, setToast] = useState({ show: false, msg: '', type: '' })
  const [rentInfo, setRentInfo] = useState({ rentAmount: 0, dueDate: 1 })

  const showToast = (msg: string, type: string) => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000)
  }

  const fetchPayments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/payments/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setPayments(data)
      setFiltered(data)
    } catch {
      showToast('Error loading', 'error')
    }
    setLoading(false)
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRentInfo({
        rentAmount: data.rentAmount || 0,
        dueDate: data.dueDate || 1
      })
      localStorage.setItem('dueDate', data.dueDate || '1')
      localStorage.setItem('rentAmount', data.rentAmount || '0')
    } catch {
      console.log('Error fetching profile')
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchProfile()
  }, [])

  useEffect(() => {
    let result = payments
    if (activeTab !== 'all') result = payments.filter(p => p.status === activeTab)
    if (search) result = result.filter(p =>
      p.month.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, payments, activeTab])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment?')) return
    try {
      await fetch(`http://localhost:5000/api/payments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Payment deleted!', 'error')
      fetchPayments()
    } catch {
      showToast('Error deleting', 'error')
    }
  }

  // Countdown calculate karo
  const getDaysLeft = () => {
    const dueDay = rentInfo.dueDate || 1
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    let dueDate = new Date(currentYear, currentMonth, dueDay)
    if (currentDay > dueDay) {
      dueDate = new Date(currentYear, currentMonth + 1, dueDay)
    }

    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysLeft = getDaysLeft()
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const confirmed = payments.filter(p => p.status === 'confirmed').length
  const pending = payments.filter(p => p.status === 'pending').length

  const statusColor: any = {
    confirmed: { bg: '#EAF3DE', text: '#3B6D11' },
    pending: { bg: '#FAEEDA', text: '#854F0B' },
    flagged: { bg: '#FCEBEB', text: '#791F1F' }
  }

  const statusIcon: any = {
    confirmed: '✅',
    pending: '⏳',
    flagged: '🚩'
  }

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'payments', icon: '🧾', label: 'Payments' },
    { id: 'add', icon: '➕', label: 'Add Payment' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ]

  const getCountdownStyle = () => {
    if (daysLeft <= 0) return { bg: '#FCEBEB', border: '#F7C1C1', text: '#791F1F', icon: '🚨', msg: 'Rent is due TODAY!' }
    if (daysLeft === 1) return { bg: '#FCEBEB', border: '#F7C1C1', text: '#791F1F', icon: '🚨', msg: 'Rent is due TOMORROW!' }
    if (daysLeft <= 3) return { bg: '#FCEBEB', border: '#F7C1C1', text: '#791F1F', icon: '🚨', msg: `Rent is due in ${daysLeft} days!` }
    if (daysLeft <= 7) return { bg: '#FAEEDA', border: '#FAC775', text: '#854F0B', icon: '🔔', msg: `Rent is due in ${daysLeft} days` }
    return { bg: '#EAF3DE', border: '#9FE1CB', text: '#3B6D11', icon: '✅', msg: `Rent is due in ${daysLeft} days` }
  }

  const countdown = getCountdownStyle()

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

      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0C447C', display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏠</span>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: 500 }}>RentTrack</h2>
              <p style={{ color: '#B5D4F4', margin: 0, fontSize: '11px' }}>Tenant Portal</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id}
              onClick={() => {
                if (item.id === 'add') navigate('/add-payment')
                else if (item.id === 'profile') navigate('/profile')
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'white', fontWeight: 500 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: 'white', margin: 0, fontSize: '13px', fontWeight: 500 }}>{name}</p>
              <p style={{ color: '#B5D4F4', margin: 0, fontSize: '11px' }}>Tenant</p>
            </div>
          </div>
          <div onClick={() => { localStorage.clear(); navigate('/') }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#B5D4F4' }}>
            <span style={{ fontSize: '16px' }}>🚪</span>
            <span style={{ fontSize: '13px' }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#f0f4ff', display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <div style={{ background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #e0e0e0' }}>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#1a1a1a' }}>Dashboard</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 500, color: '#185FA5' }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: '#333' }}>{name}</span>
          </div>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>

          {/* Welcome Banner */}
          <div style={{ background: '#185FA5', borderRadius: '14px', padding: '22px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#B5D4F4', fontSize: '12px', margin: '0 0 4px' }}>Welcome back</p>
              <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: '18px', fontWeight: 500 }}>{name}</h3>
              <p style={{ color: '#B5D4F4', fontSize: '13px', margin: 0 }}>Manage your rent payments easily</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 20px', textAlign: 'center' }}>
              <p style={{ color: '#B5D4F4', fontSize: '11px', margin: '0 0 4px' }}>Total paid</p>
              <p style={{ color: 'white', fontSize: '28px', fontWeight: 500, margin: 0 }}>${totalPaid}</p>
            </div>
          </div>

          {/* Countdown Banner */}
          {rentInfo.rentAmount > 0 && (
            <div style={{
              background: countdown.bg,
              border: `1px solid ${countdown.border}`,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{countdown.icon}</span>
                <div>
                  <p style={{ color: countdown.text, margin: 0, fontWeight: 600, fontSize: '15px' }}>
                    {countdown.msg}
                  </p>
                  <p style={{ color: countdown.text, margin: '4px 0 0', fontSize: '13px' }}>
                    Rent amount: <strong>${rentInfo.rentAmount}</strong> · Due on day <strong>{rentInfo.dueDate}</strong> of every month
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/add-payment')}
                style={{
                  padding: '9px 18px',
                  background: countdown.text,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}>
                Pay now
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Confirmed', value: confirmed, color: '#3B6D11', bg: '#EAF3DE', icon: '✅', tab: 'confirmed' },
              { label: 'Pending', value: pending, color: '#854F0B', bg: '#FAEEDA', icon: '⏳', tab: 'pending' },
              { label: 'Total payments', value: payments.length, color: '#185FA5', bg: '#E6F1FB', icon: '🧾', tab: 'all' },
            ].map((s, i) => (
              <div key={i}
                onClick={() => setActiveTab(s.tab)}
                style={{ background: 'white', padding: '18px', borderRadius: '12px', border: '0.5px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                <div style={{ width: '44px', height: '44px', background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>{s.label}</p>
                  <p style={{ color: s.color, fontSize: '24px', fontWeight: 500, margin: 0 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment History */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '0.5px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#1a1a1a' }}>Payment history</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', width: '150px', outline: 'none' }}
                />
                <button onClick={() => navigate('/add-payment')}
                  style={{ padding: '8px 16px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  + Add
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {['all', 'confirmed', 'pending', 'flagged'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, textTransform: 'capitalize',
                    background: activeTab === tab ? '#185FA5' : '#f0f0f0',
                    color: activeTab === tab ? 'white' : '#666'
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>Loading...</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                <p style={{ fontWeight: 500 }}>No payments found</p>
                <button onClick={() => navigate('/add-payment')}
                  style={{ marginTop: '14px', padding: '9px 20px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  + Add first payment
                </button>
              </div>
            ) : (
              filtered.map((p) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '0.5px solid #f0f0f0', borderRadius: '10px', marginBottom: '8px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: statusColor[p.status]?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {statusIcon[p.status]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, color: '#1a1a1a' }}>{p.month}</p>
                      <p style={{ margin: '2px 0 0', color: '#888', fontSize: '12px' }}>{p.method} · {new Date(p.date).toLocaleDateString()}</p>
                      {p.note && <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: '11px' }}>📝 {p.note}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.proofImage && (
                      <img src={`http://localhost:5000${p.proofImage}`} alt="proof"
                        style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e0e0e0' }} />
                    )}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: '16px', color: '#185FA5' }}>${p.amount}</p>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: statusColor[p.status]?.bg, color: statusColor[p.status]?.text }}>
                        {p.status}
                      </span>
                    </div>
                    <button onClick={() => navigate(`/edit-payment/${p._id}`)}
                      style={{ padding: '6px 10px', background: '#E6F1FB', color: '#185FA5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      style={{ padding: '6px 10px', background: '#FCEBEB', color: '#791F1F', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenantDashboard