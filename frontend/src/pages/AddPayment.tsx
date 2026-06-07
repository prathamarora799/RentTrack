import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AddPayment() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [method, setMethod] = useState('bank transfer')
  const [month, setMonth] = useState('')
  const [note, setNote] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB')
        return
      }
      setProof(file)
      setPreview(URL.createObjectURL(file))
      setMessage('')
    }
  }

  const handleSubmit = async () => {
    if (!amount) { setMessage('Amount is required'); return }
    if (Number(amount) <= 0) { setMessage('Amount must be greater than 0'); return }
    if (Number(amount) > 100000) { setMessage('Amount seems too high — please check'); return }
    if (!date) { setMessage('Date is required'); return }
    if (!month) { setMessage('Month is required'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('amount', amount)
      formData.append('date', date)
      formData.append('method', method)
      formData.append('month', month)
      formData.append('note', note)
      if (proof) formData.append('proofImage', proof)

      const res = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (res.ok) navigate('/tenant')
      else setMessage('Error adding payment — please try again')
    } catch {
      setMessage('Server error — please try again')
    }
    setLoading(false)
  }

  const methods = [
    { value: 'bank transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'online', label: 'Online', icon: '💻' },
    { value: 'cheque', label: 'Cheque', icon: '📝' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F0FDF4', display: 'flex', flexDirection: 'column' }}>

      {/* Topbar */}
      <div style={{ background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #D1FAE5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#0A3622', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🏠</div>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#052E16' }}>RentTrack</span>
          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>/</span>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>Add payment</span>
        </div>
        <button onClick={() => navigate('/tenant')}
          style={{ padding: '7px 14px', background: '#F0FDF4', color: '#166534', border: '1px solid #D1FAE5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
          ← Back
        </button>
      </div>

      {/* Green header */}
      <div style={{ background: '#0A3622', padding: '24px 24px 44px' }}>
        <div style={{ color: '#86EFAC', fontSize: '12px', marginBottom: '4px' }}>New payment</div>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 500 }}>Log a rent payment</div>
        <div style={{ color: '#4ADE80', fontSize: '13px', marginTop: '4px' }}>Fill in the details below and upload proof</div>
      </div>

      <div style={{ padding: '0 24px', marginTop: '-20px', maxWidth: '680px', width: '100%', margin: '-20px auto 0' }}>

        {/* Main form card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '0.5px solid #D1FAE5', marginBottom: '16px' }}>

          <h3 style={{ margin: '0 0 20px', fontSize: '15px', color: '#052E16', fontWeight: 500 }}>Payment details</h3>

          {/* Amount + Month */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>
                Amount ($) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '14px' }}>$</span>
                <input type="number" value={amount}
                  onChange={(e) => { setAmount(e.target.value); setMessage('') }}
                  placeholder="1200"
                  style={{ width: '100%', padding: '11px 14px 11px 26px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }}
                  onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                  onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>
                Month <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input type="text" value={month}
                onChange={(e) => { setMonth(e.target.value); setMessage('') }}
                placeholder="June 2026"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }}
                onFocus={(e) => e.target.style.borderColor = '#22C55E'}
                onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
              />
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>
              Payment date <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input type="date" value={date}
              onChange={(e) => { setDate(e.target.value); setMessage('') }}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#22C55E'}
              onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
            />
          </div>

          {/* Payment method */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '8px', fontWeight: 500 }}>Payment method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
              {methods.map(m => (
                <div key={m.value} onClick={() => setMethod(m.value)}
                  style={{ padding: '10px 8px', border: `2px solid ${method === m.value ? '#22C55E' : '#E5E7EB'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: method === m.value ? '#F0FDF4' : 'white' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{m.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: method === m.value ? '#166534' : '#374151' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: '6px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes..."
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #D1FAE5', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#F9FAFB', color: '#111827' }}
              onFocus={(e) => e.target.style.borderColor = '#22C55E'}
              onBlur={(e) => e.target.style.borderColor = '#D1FAE5'}
            />
          </div>
        </div>

        {/* Upload card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '0.5px solid #D1FAE5', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#052E16', fontWeight: 500 }}>Payment proof</h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280' }}>Upload a screenshot or photo of your bank transfer receipt</p>

          <label style={{ display: 'block', border: '2px dashed #86EFAC', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#F9FAFB' }}>
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            {preview ? (
              <div>
                <img src={preview} alt="proof" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px', marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>✅ {proof?.name}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Click to change</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📎</div>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: 500, marginBottom: '4px' }}>Click to upload proof</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>PNG, JPG supported · Max 5MB</div>
              </div>
            )}
          </label>
        </div>

        {/* Error */}
        {message && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
            ⚠️ {message}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex: 1, padding: '13px', background: loading ? '#86EFAC' : '#0A3622', color: 'white', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '15px' }}>
            {loading ? 'Submitting...' : 'Submit payment'}
          </button>
          <button onClick={() => navigate('/tenant')}
            style={{ flex: 1, padding: '13px', background: '#F0FDF4', color: '#374151', border: '1px solid #D1FAE5', borderRadius: '12px', cursor: 'pointer', fontSize: '15px' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddPayment