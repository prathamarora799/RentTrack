import express from 'express'
import webpush from 'web-push'
import { protect } from '../middleware/auth'
import User from '../models/User'

const router = express.Router()

// Save subscription
router.post('/subscribe', protect, async (req, res) => {
  try {
    const subscription = req.body
    await User.findByIdAndUpdate(
      (req as any).user.id,
      { pushSubscription: subscription }
    )
    res.status(201).json({ message: 'Subscribed successfully' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Send notification to specific user
router.post('/send', protect, async (req, res) => {
  try {
    const { userId, title, body } = req.body
    const user = await User.findById(userId)

    if (!user?.pushSubscription) {
      return res.status(404).json({ message: 'No subscription found' })
    }

    const payload = JSON.stringify({ title, body })
    await webpush.sendNotification(user.pushSubscription as any, payload)
    res.json({ message: 'Notification sent ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to send notification' })
  }
})

// Get public VAPID key
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

export default router