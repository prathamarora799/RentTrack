import mongoose from 'mongoose'

// Payment schema — stores each rent payment made by a tenant
const paymentSchema = new mongoose.Schema({

  // Links this payment to the tenant who made it
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  amount: { type: Number, required: true },
  date: { type: Date, required: true },

  // How the tenant paid
  method: {
    type: String,
    enum: ['bank transfer', 'cash', 'online', 'cheque'],
    default: 'bank transfer'
  },

  month: { type: String, required: true },

  // Status is updated by the landlord
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'flagged'],
    default: 'pending'
  },

  note: { type: String, default: '' },

  // Path to the uploaded proof image
  proofImage: { type: String, default: '' }

}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)