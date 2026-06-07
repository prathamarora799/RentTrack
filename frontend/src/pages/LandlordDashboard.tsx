import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function LandlordDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name') || 'Landlord'
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
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, msg: 'Alex Johnson added a payment of $1,200 for June', time: '1 hour ago', read: false },
    { id: 2, msg: 'New tenant registered — Sarah Connor', time: '2 days ago', read: false },
    { id: 3, msg: 'May payment flagged by system', time: '4 days ago', read: true },
  ])
  const notifRef = useRef<HTMLDivElement>(null)
  const unread = notifications.filter(n => !n.read).length

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
    } catch { showToast('Error loading payments', 'error') }
    setLoading(false)
  }

  const fetchTenants = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setTenants(data)
    } catch { console.log('Error loading tenants') }
  }

  useEffect(() => {
    fetchPayments()
    fetchTenants()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleStatus = async (id: string, status: string) => {
    try {
      await fetch(`http://localhost:5000/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      showToast(`Payment ${status}!`, 'success')
      fetchPayments()
    } catch { showToast('Error updating', 'error') }
  }

  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Remove this tenant?')) return
    try {
      await fetch(`http://localhost:5000/api/users/tenants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Tenant removed', 'error')
      fetchTenants()
    } catch { showToast('Error removing tenant', 'error') }
  }

  const handleSetRent = async () => {
    if (!rentInput || !dueDateInput) return
    try {
      await fetch(`http://localhost:5000/api/users/tenants/${editTenant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rentAmount: rentInput, dueDate: dueDateInput })
      })
      showToast('Rent details updated!', 'success')
      setEditTenant(null)
      fetchTenants()
    } catch { showToast('Error updating', 'error') }
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0)
  const confirmed = payments.filter(p => p.status === 'confirmed').length
  const pending = payments.filter(p => p.status === 'pending').length
  const flagged = payments.filter(p => p.status === 'flagged').length

  const filteredPayments = payments.filter(p =>
    p.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.month?.toLowerCase().includes(search.toLowerCase())
  )

  const statusBadge: any = {
    confirmed: { bg: '#DCFCE7', color: '#166534' },
    pending: { bg: '#FFFBEB', color: '#D97706' },
    flagged: { bg: '#FEF2F2', color: '#DC2626' }
  }

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'tenants', label: 'Tenants', icon: '👥' },
    { id: 'payments', label: 'All payments', icon: '🧾' },
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

      {/* Set Rent Modal */}
      {editTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '380px', border: '1px solid #D1FAE5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#052E16' }}>Set rent details</h3>
              <span onClick={() => setEditTenant(null)} style={{ cursor: 'pointer', color: '#9CA3AF', fontSize: '18px' }}>✕</span>
            </div>
            <div style={{ background: '#F0FDF4', borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontWeight: 500, fontSize: '14px' }}>
                {editTenant.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#052E16' }}>{editTenant.name}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>{editTenant.email}</div>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Monthly rent ($)</label>
              <input type="number" value={rentInput} onChange={(e) => setRentInput(e.target.value)} placeholder="e.g. 1200"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Due date (day of month)</label>
              <input type="number" min="1" max="31" value={dueDateInput} onChange={(e) => setDueDateInput(e.target.value)} placeholder="e.g. 1 = 1st of every month"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }} />
              <p style={{ color: '#9CA3AF', fontSize: '11px', margin: '4px 0 0' }}>Tenant will get notified 7, 3, and 1 day before this date</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSetRent}
                style={{ flex: 1, padding: '11px', background: '#0A3622', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                Save changes
              </button>
              <button onClick={() => setEditTenant(null)}
                style={{ flex: 1, padding: '11px', background: '#F0FDF4', color: '#374151', border: '1px solid #D1FAE5', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div onClick={() => setSelectedImage('')}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'relative' }}>
            <img src={selectedImage} alt="proof" style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px' }} />
            <button onClick={() => setSelectedImage('')}
              style={{ position: 'absolute', top: '-14px', right: '-14px', background: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#374151' }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: '210px', background: '#052E16', display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '20px 14px 16px', borderBottom: '0.5px solid #14532D' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#14532D', borderRadius: '10px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>🏠</div>
            <div>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>RentTrack</div>
              <div style={{ color: '#4ADE80', fontSize: '10px' }}>Landlord account</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{ fontSize: '9px', color: '#4ADE80', letterSpacing: '0.8px', margin: '8px 10px 8px', textTransform: 'uppercase' }}>Main</div>
          {navItems.map(item => (
            <div key={item.id}
              onClick={() => {
                if (item.id === 'profile') navigate('/profile')
                else setActivePage(item.id)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px', background: activePage === item.id ? '#14532D' : 'transparent', borderLeft: activePage === item.id ? '3px solid #4ADE80' : '3px solid transparent' }}>
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <span style={{ fontSize: '12px', color: activePage === item.id ? 'white' : '#4ADE80' }}>{item.label}</span>
              {item.id === 'payments' && flagged > 0 && (
                <span style={{ background: '#DC2626', color: 'white', fontSize: '9px', padding: '1px 6px', borderRadius: '10px', marginLeft: 'auto' }}>{flagged}</span>
              )}
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
              <div style={{ color: '#4ADE80', fontSize: '10px' }}>Landlord</div>
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
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#052E16', textTransform: 'capitalize' }}>{activePage === 'dashboard' ? 'Overview' : activePage}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <div onClick={() => { setShowNotif(!showNotif); setNotifications(prev => prev.map(n => ({ ...n, read: true }))) }}
                style={{ position: 'relative', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '16px' }}>🔔</span>
                {unread > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#DC2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: 700 }}>
                    {unread}
                  </div>
                )}
              </div>

              {showNotif && (
                <div style={{ position: 'absolute', top: '44px', right: 0, width: '300px', background: 'white', borderRadius: '12px', border: '1px solid #D1FAE5', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 999 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #F0FDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#052E16' }}>Notifications</span>
                    <span style={{ fontSize: '11px', color: '#22C55E', cursor: 'pointer' }}>Mark all read</span>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '0.5px solid #F9FFF9', background: n.read ? 'white' : '#F0FDF4', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.read ? '#D1FAE5' : '#22C55E', flexShrink: 0, marginTop: '4px' }}></div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#111827' }}>{n.msg}</div>
                        <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#22C55E', cursor: 'pointer' }}>View all notifications</span>
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
              <div style={{ color: '#86EFAC', fontSize: '12px', marginBottom: '4px' }}>Total rent collected</div>
              <div style={{ color: 'white', fontSize: '36px', fontWeight: 500 }}>${total.toLocaleString()}</div>
              <div style={{ color: '#4ADE80', fontSize: '13px', marginTop: '4px' }}>{tenants.length} tenants · {payments.length} payments</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 24px', marginTop: '-20px' }}>

          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Total tenants', value: tenants.length, color: '#052E16' },
                  { label: 'Confirmed', value: confirmed, color: '#166534' },
                  { label: 'Pending', value: pending, color: '#D97706' },
                  { label: 'Flagged', value: flagged, color: '#DC2626' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '0.5px solid #D1FAE5' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>{s.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 500, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {flagged > 0 && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🚩</span>
                    <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>{flagged} payment(s) need review</div>
                  </div>
                  <button onClick={() => setActivePage('payments')}
                    style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                    Review now
                  </button>
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid #D1FAE5', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #F0FDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#052E16' }}>Recent payments</span>
                  <span onClick={() => setActivePage('payments')} style={{ fontSize: '12px', color: '#22C55E', cursor: 'pointer' }}>View all</span>
                </div>
                <div style={{ padding: '10px 18px', background: '#F9FAFB', borderBottom: '0.5px solid #F0FDF4', display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '8px' }}>
                  {['Tenant', 'Month', 'Amount', 'Status'].map((h, i) => (
                    <span key={i} style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{h}</span>
                  ))}
                </div>
                {payments.slice(0, 5).map((p, idx) => (
                  <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '8px', padding: '12px 18px', alignItems: 'center', borderBottom: idx < 4 ? '0.5px solid #F0FDF4' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontSize: '11px', fontWeight: 500 }}>
                        {p.tenant?.name?.charAt(0) || 'T'}
                      </div>
                      <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{p.tenant?.name || 'Tenant'}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{p.month}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#052E16' }}>${p.amount}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: statusBadge[p.status]?.bg, color: statusBadge[p.status]?.color }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TENANTS */}
          {activePage === 'tenants' && (
            <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid #D1FAE5', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #F0FDF4' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#052E16' }}>All tenants ({tenants.length})</span>
              </div>
              {tenants.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No tenants yet</div>
              ) : tenants.map((t, idx) => (
                <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: idx < tenants.length - 1 ? '0.5px solid #F0FDF4' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontSize: '15px', fontWeight: 500 }}>
                      {t.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.email}</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {t.unitNumber && <span style={{ fontSize: '11px', background: '#F0FDF4', color: '#166534', padding: '2px 8px', borderRadius: '20px', border: '0.5px solid #D1FAE5' }}>Unit {t.unitNumber}</span>}
                        {t.rentAmount ? <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '20px' }}>${t.rentAmount}/mo</span>
                          : <span style={{ fontSize: '11px', background: '#FFFBEB', color: '#D97706', padding: '2px 8px', borderRadius: '20px' }}>Rent not set</span>}
                        {t.dueDate && <span style={{ fontSize: '11px', background: '#FFFBEB', color: '#D97706', padding: '2px 8px', borderRadius: '20px' }}>Due day {t.dueDate}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditTenant(t); setRentInput(t.rentAmount || ''); setDueDateInput(t.dueDate || '') }}
                      style={{ padding: '7px 14px', background: '#F0FDF4', color: '#166534', border: '1px solid #D1FAE5', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                      Set rent
                    </button>
                    <button onClick={() => handleDeleteTenant(t._id)}
                      style={{ padding: '7px 14px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAYMENTS */}
          {activePage === 'payments' && (
            <div style={{ background: 'white', borderRadius: '14px', border: '0.5px solid #D1FAE5', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #F0FDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#052E16' }}>All payments</span>
                <input type="text" placeholder="Search tenant..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '7px 12px', border: '1px solid #D1FAE5', borderRadius: '8px', fontSize: '12px', outline: 'none', width: '180px', color: '#111827' }} />
              </div>
              <div style={{ padding: '10px 18px', background: '#F9FAFB', borderBottom: '0.5px solid #F0FDF4', display: 'grid', gridTemplateColumns: '1.5fr 1fr auto auto auto', gap: '8px' }}>
                {['Tenant', 'Month', 'Amount', 'Status', 'Actions'].map((h, i) => (
                  <span key={i} style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{h}</span>
                ))}
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
              ) : filteredPayments.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No payments found</div>
              ) : filteredPayments.map((p, idx) => (
                <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto auto auto', gap: '8px', padding: '12px 18px', alignItems: 'center', borderBottom: idx < filteredPayments.length - 1 ? '0.5px solid #F0FDF4' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
                      {p.tenant?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>{p.tenant?.name}</div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{p.tenant?.email}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#111827' }}>{p.month}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{p.method}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#052E16' }}>${p.amount}</span>
                    {p.proofImage && (
                      <img src={`http://localhost:5000${p.proofImage}`} alt="proof"
                        onClick={() => setSelectedImage(`http://localhost:5000${p.proofImage}`)}
                        style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #D1FAE5' }} />
                    )}
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: statusBadge[p.status]?.bg, color: statusBadge[p.status]?.color, whiteSpace: 'nowrap' }}>
                    {p.status}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleStatus(p._id, 'confirmed')}
                      style={{ padding: '5px 8px', background: '#DCFCE7', color: '#166534', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 500 }}>
                      Confirm
                    </button>
                    <button onClick={() => handleStatus(p._id, 'flagged')}
                      style={{ padding: '5px 8px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 500 }}>
                      Flag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandlordDashboard