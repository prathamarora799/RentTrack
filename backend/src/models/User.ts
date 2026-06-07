import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['tenant', 'landlord'], default: 'tenant' },
  unitNumber: { type: String, default: '' },
  rentAmount: { type: Number, default: 0 },
  dueDate: { type: Number, default: 1 },
  phone: { type: String, default: '' },
  pushSubscription: { type: Object, default: null }
}, { timestamps: true })

export default mongoose.model('User', userSchema)