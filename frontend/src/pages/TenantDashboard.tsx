import { useState, useEffect, useRef } from 'react'
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
  const [rentInfo, setRentInfo] = useState({ rentAmount: 0, dueDate: 1 })
  const [toast, setToast] = useState({ show: false, msg: '', type: '' })
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const notifRef = useRef<HTMLDivElement>(null)
  const unread = notifications.filter(n => !n.read).length

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
    } catch { showToast('Error loading payments', 'error') }
    setLoading(false)
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRentInfo({ rentAmount: data.rentAmount || 0, dueDate: data.dueDate || 1 })
    } catch { console.log('Error fetching profile') }
  }

  // Notifications — real payments se banate hain
  const buildNotifications = (payments: any[]) => {
    const notifs: any[] = []

    payments.forEach(p => {
      if (p.status === 'confirmed') {
        notifs.push({
          id: `confirmed-${p._id}`,
          msg: `Your payment of $${p.amount} for ${p.month} was confirmed ✅`,
          time: new Date(p.updatedAt || p.createdAt).toLocaleDateString(),
          read: false
        })
      }
      if (p.status === 'flagged') {
        notifs.push({
          id: `flagged-${p._id}`,
          msg: `Your payment of $${p.amount} for ${p.month} was flagged 🚩`,
          time: new Date(p.updatedAt || p.createdAt).toLocaleDateString(),
          read: false
        })
      }
      if (p.status === 'pending') {
        notifs.push({
          id: `pending-${p._id}`,
          msg: `Payment of $${p.amount} for ${p.month} is pending review`,
          time: new Date(p.createdAt).toLocaleDateString(),
          read: true
        })
      }
    })

    // Rent due reminder
    const dueDay = rentInfo.dueDate || 1
    const today = new Date()
    let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
    if (today.getDate() > dueDay) {
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
    }
    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (rentInfo.rentAmount > 0 && daysLeft <= 7) {
      notifs.unshift({
        id: 'rent-due',
        msg: `Rent due in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — $${rentInfo.rentAmount} 🔔`,
        time: 'Today',
        read: false
      })
    }

    return notifs
  }

  useEffect(() => {
    fetchPayments()
    fetchProfile()
  }, [])

  // Jab payments ya rentInfo update ho — notifications rebuild karo
  useEffect(() => {
    if (payments.length > 0) {
      setNotifications(buildNotifications(payments))
    }
  }, [payments, rentInfo])

  useEffect(() => {
    let result = payments
    if (activeTab !== 'all') result = payments.filter(p => p.status === activeTab)
    if (search) result = result.filter(p =>
      p.month.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, payments, activeTab])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment?')) return
    try {
      await fetch(`http://localhost:5000/api/payments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Payment deleted', 'error')
      fetchPayments()
    } catch { showToast('Error deleting', 'error') }
  }

  const getDaysLeft = () => {
    const dueDay = rentInfo.dueDate || 1
    const today = new Date()
    let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
    if (today.getDate() > dueDay) {
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
    }
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const daysLeft = getDaysLeft()
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const confirmed = payments.filter(p => p.status === 'confirmed').length
  const pending = payments.filter(p => p.status === 'pending').length

  const statusBadge: any = {
    confirmed: { bg: '#DCFCE7', color: '#166534' },
    pending: { bg: '#FFFBEB', color: '#D97706' },
    flagged: { bg: '#FEF2F2', color: '#DC2626' }
  }

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'payments', label: 'Payments', icon: '🧾' },
    { id: 'add', label: 'Add payment', icon: '➕' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0FDF4' }}>

      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: toast.type === 'error' ? '#FEF2F2' : '#DCFCE7', border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#86EFAC'}`, color: toast.type === 'error' ? '#DC2626' : '#166534', padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: '210px', background: '#052E16', display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '20px 14px 16px', borderBottom: '0.5px solid #14532D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#14532D', borderRadius: '10px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>🏠</div>
            <div>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>RentTrack</div>
              <div style={{ color: '#4ADE80', fontSize: '10px' }}>Tenant account</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{ fontSize: '9px', color: '#4ADE80', letterSpacing: '0.8px', margin: '8px 10px 8px', textTransform: 'uppercase' }}>Main</div>
          {navItems.map(item => (
            <div key={item.id}
              onClick={() => {
                if (item.id === 'add') navigate('/add-payment')
                else if (item.id === 'profile') navigate('/profile')
                else setActivePage(item.id)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px', background: activePage === item.id ? '#14532D' : 'transparent', borderLeft: activePage === item.id ? '3px solid #4ADE80' : '3px solid transparent' }}>
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <span style={{ fontSize: '12px', color: activePage === item.id ? 'white' : '#4ADE80' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 10px', borderTop: '0.5px solid #14532D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#14532D', borderRadius: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86EFAC', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ color: '#4ADE80', fontSize: '10px' }}>Tenant</div>
            </div>
            <div onClick={() => { localStorage.clear(); navigate('/') }} style={{ cursor: 'pointer' }}>
              <span style={{ color: '#4ADE80', fontSize: '16px' }}>🚪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <div style={{ background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #D1FAE5' }}>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#052E16' }}>
            {activePage === 'dashboard' ? 'Overview' : 'Payment History'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setShowNotif(!showNotif)
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                }}
                style={{ position: 'relative', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '16px' }}>🔔</span>
                {unread > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#DC2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: 700 }}>
                    {unread}
                  </div>
                )}
              </div>

              {/* Dropdown */}
              {showNotif && (
                <div style={{ position: 'absolute', top: '44px', right: 0, width: '300px', background: 'white', borderRadius: '12px', border: '1px solid #D1FAE5', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 999 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #F0FDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#052E16' }}>Notifications</span>
                    <span style={{ fontSize: '11px', color: '#22C55E', cursor: 'pointer' }}
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
                      Mark all read
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div key={n.id} style={{ padding: '12px 16px', borderBottom: '0.5px solid #F9FFF9', background: n.read ? 'white' : '#F0FDF4', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.read ? '#D1FAE5' : '#22C55E', flexShrink: 0, marginTop: '4px' }}></div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#111827' }}>{n.msg}</div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{n.time}</div>
                        </div>
                      </div>
                    ))
                  )}

                  <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#22C55E', cursor: 'pointer' }}>
                      View all notifications
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: '8px', padding: '6px 12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86EFAC', fontSize: '11px', fontWeight: 500 }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', color: '#052E16', fontWeight: 500 }}>{name}</span>
            </div>
          </div>
        </div>

        {/* Green header */}
        <div style={{ background: '#0A3622', padding: '24px 24px 44px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#86EFAC', fontSize: '12px', marginBottom: '4px' }}>Total rent paid</div>
              <div style={{ color: 'white', fontSize: '36px', fontWeight: 500 }}>${totalPaid.toLocaleString()}</div>
              <div style={{ color: '#4ADE80', fontSize: '13px', marginTop: '4px' }}>{payments.length} payments recorded</div>
            </div>
            <button onClick={() => navigate('/add-payment')}
              style={{ background: '#166534', border: '1px solid #22C55E', borderRadius: '10px', color: '#86EFAC', fontSize: '13px', fontWeight: 500, padding: '10px 18px', cursor: 'pointer' }}>
              + Add payment
            </button>
          </div>
        </div>

        <div style={{ padding: '0 24px', marginTop: '-20px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Confirmed', value: confirmed, color: '#166534', extra: 'payments' },
              { label: 'Pending', value: pending, color: '#D97706', extra: 'payments' },
              { label: 'Days until rent', value: daysLeft, color: daysLeft <= 3 ? '#DC2626' : daysLeft <= 7 ? '#D97706' : '#166534', extra: 'remaining' },
              { label: 'Rent amount', value: rentInfo.rentAmount ? `$${rentInfo.rentAmount}` : 'Not set', color: '#052E16', extra: 'per month' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '0.5px solid #D1FAE5' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 500, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{s.extra}</div>
              </div>
            ))}
          </div>

          {/* Countdown alert */}
          {rentInfo.rentAmount > 0 && daysLeft <= 7 && (
            <div style={{ background: daysLeft <= 3 ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${daysLeft <= 3 ? '#FECACA' : '#FDE68A'}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{daysLeft <= 3 ? '🚨' : '🔔'}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: daysLeft <= 3 ? '#DC2626' : '#D97706' }}>
                    {daysLeft <= 0 ? 'Rent is due TODAY!' : daysLeft === 1 ? 'Rent due TOMORROW!' : `Rent due in ${daysLeft} days`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Amount: ${rentInfo.rentAmount} — Due day {rentInfo.dueDate}</div>
                </div>
              </div>
              <button onClick={() => navigate('/add-payment')}
                style={{ background: daysLeft <= 3 ? '#DC2626' : '#D97706', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                Pay now
              </button>
            </div>
          )}

          {/* Payment table */}
          <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid #D1FAE5', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #F0FDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#052E16' }}>Payment history</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" placeholder="Search..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '7px 12px', border: '1px solid #D1FAE5', borderRadius: '8px', fontSize: '12px', outline: 'none', width: '140px', color: '#111827' }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['all', 'confirmed', 'pending', 'flagged'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 500, textTransform: 'capitalize', background: activeTab === tab ? '#0A3622' : '#F0FDF4', color: activeTab === tab ? 'white' : '#166534' }}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '8px', padding: '10px 18px', background: '#F9FAFB', borderBottom: '0.5px solid #F0FDF4' }}>
              {['Month', 'Method', 'Amount', 'Status', 'Actions'].map((h, i) => (
                <span key={i} style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>No payments found</div>
                <button onClick={() => navigate('/add-payment')}
                  style={{ background: '#0A3622', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}>
                  Add first payment
                </button>
              </div>
            ) : (
              filtered.map((p, idx) => (
                <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '8px', padding: '12px 18px', alignItems: 'center', borderBottom: idx < filtered.length - 1 ? '0.5px solid #F0FDF4' : 'none', background: 'white' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>{p.month}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{new Date(p.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'capitalize' }}>{p.method}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#052E16' }}>${p.amount}</div>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: statusBadge[p.status]?.bg, color: statusBadge[p.status]?.color, whiteSpace: 'nowrap' }}>
                    {p.status}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => navigate(`/edit-payment/${p._id}`)}
                      style={{ padding: '5px 10px', background: '#F0FDF4', color: '#166534', border: '1px solid #D1FAE5', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      style={{ padding: '5px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                      Del
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