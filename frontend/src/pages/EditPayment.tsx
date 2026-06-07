import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function EditPayment() {
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem('token')

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [method, setMethod] = useState('bank transfer')
  const [month, setMonth] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Load existing payment
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/payments/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        const payment = data.find((p: any) => p._id === id)
        if (payment) {
          setAmount(payment.amount)
          setDate(payment.date.split('T')[0])
          setMethod(payment.method)
          setMonth(payment.month)
          setNote(payment.note || '')
        }
      } catch {
        setMessage('Error loading payment')
      }
    }
    fetchPayment()
  }, [id])

  const handleUpdate = async () => {
    if (!amount || !date || !month) {
      setMessage('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, date, method, month, note })
      })
      if (res.ok) {
        navigate('/tenant')
      } else {
        setMessage('Error updating payment')
      }
    } catch {
      setMessage('Server error')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>

      {/* Navbar */}
      <div style={{ background: '#185FA5', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏠</span>
          <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>RentTrack</h2>
        </div>
        <button onClick={() => navigate('/tenant')}
          style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
          ← Back
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '0.5px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a1a1a' }}>✏️ Edit Payment</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Amount ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Month</label>
              <input type="text" value={month} onChange={(e) => setMonth(e.target.value)}
                style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}>
                <option value="bank transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Note</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Any note..."
              style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          {message && <p style={{ color: 'red', marginTop: '10px', fontSize: '13px' }}>{message}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleUpdate} disabled={loading}
              style={{ flex: 1, padding: '11px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
              {loading ? 'Updating...' : 'Update Payment'}
            </button>
            <button onClick={() => navigate('/tenant')}
              style={{ flex: 1, padding: '11px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPayment