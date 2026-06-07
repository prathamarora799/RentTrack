import mongoose from 'mongoose'

// User schema — stores info for both tenants and landlords
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // Password is stored as a hash — never plain text
  password: { type: String, required: true },

  // Role decides what the user can see and do
  role: { type: String, enum: ['tenant', 'landlord'], default: 'tenant' },

  // Tenant specific fields
  unitNumber: { type: String, default: '' },
  rentAmount: { type: Number, default: 0 },
  dueDate: { type: Number, default: 1 },
  phone: { type: String, default: '' },

  // Saved when user subscribes to push notifications
  pushSubscription: { type: Object, default: null }

}, { timestamps: true })

export default mongoose.model('User', userSchema)