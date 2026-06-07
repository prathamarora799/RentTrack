import express from 'express'
import { protect } from '../middleware/auth'
import User from '../models/User'

const router = express.Router()

// Get my profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password')
    res.json(user)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update my profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      (req as any).user.id,
      { name: req.body.name, phone: req.body.phone, unitNumber: req.body.unitNumber },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all tenants (landlord)
router.get('/tenants', protect, async (req, res) => {
  try {
    const tenants = await User.find({ role: 'tenant' }).select('-password')
    res.json(tenants)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update tenant (landlord sets rent + due date)
// Update tenant rent + due date (landlord)
router.put('/tenants/:id', protect, async (req, res) => {
  try {
    const tenant = await User.findByIdAndUpdate(
      req.params.id,
      {
        rentAmount: req.body.rentAmount,
        dueDate: req.body.dueDate,
        unitNumber: req.body.unitNumber
      },
      { new: true }
    ).select('-password')
    res.json(tenant)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete tenant
router.delete('/tenants/:id', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Tenant removed' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router