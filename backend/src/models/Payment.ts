import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  method: {
    type: String,
    enum: ['bank transfer', 'cash', 'online', 'cheque'],
    default: 'bank transfer'
  },
  month: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'flagged'],
    default: 'pending'
  },
  note: { type: String, default: '' },
  proofImage: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)