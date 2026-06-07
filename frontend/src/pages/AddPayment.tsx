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
    // Validations
    if (!amount) {
      setMessage('Amount is required')
      return
    }
    if (Number(amount) <= 0) {
      setMessage('Amount must be greater than 0')
      return
    }
    if (Number(amount) > 100000) {
      setMessage('Amount seems too high — please check')
      return
    }
    if (!date) {
      setMessage('Date is required')
      return
    }
    if (!month) {
      setMessage('Month is required')
      return
    }

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

      if (res.ok) {
        navigate('/tenant')
      } else {
        setMessage('Error adding payment — please try again')
      }
    } catch {
      setMessage('Server error — please try again')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      <div style={{ background: '#185FA5', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>🏠 RentTrack</h2>
        <button onClick={() => navigate('/tenant')}
          style={{ padding: '6px 14px', background: 'white', color: '#185FA5', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          ← Back
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '0.5px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 20px', color: '#333' }}>Add New Payment</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                Amount ($) <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="number" value={amount}
                onChange={(e) => { setAmount(e.target.value); setMessage('') }}
                placeholder="1200"
                style={{ width: '100%', padding: '9px', border: `1px solid ${!amount && message ? '#dc2626' : '#ddd'}`, borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                Month <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="text" value={month}
                onChange={(e) => { setMonth(e.target.value); setMessage('') }}
                placeholder="June 2026"
                style={{ width: '100%', padding: '9px', border: `1px solid ${!month && message ? '#dc2626' : '#ddd'}`, borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="date" value={date}
                onChange={(e) => { setDate(e.target.value); setMessage('') }}
                style={{ width: '100%', padding: '9px', border: `1px solid ${!date && message ? '#dc2626' : '#ddd'}`, borderRadius: '8px', boxSizing: 'border-box' }} />
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
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Any note..."
              style={{ width: '100%', padding: '9px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              Transaction Proof (screenshot/receipt)
            </label>
            <label style={{ display: 'block', border: '2px dashed #B5D4F4', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#f0f7ff' }}>
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              {preview ? (
                <img src={preview} alt="proof" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
              ) : (
                <div>
                  <p style={{ color: '#185FA5', fontWeight: 500, margin: '0 0 4px' }}>Click to upload</p>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>PNG, JPG supported · Max 5MB</p>
                </div>
              )}
            </label>
            {proof && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>✅ Selected: {proof.name}</p>
            )}
          </div>

          {message && (
            <div style={{ background: '#FCEBEB', color: '#791F1F', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, padding: '11px', background: loading ? '#aaa' : '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '15px' }}>
              {loading ? 'Submitting...' : 'Submit Payment'}
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

export default AddPayment