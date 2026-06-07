import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import webpush from 'web-push'
import authRoutes from './routes/authRoutes'
import paymentRoutes from './routes/paymentRoutes'
import userRoutes from './routes/userRoutes'
import notificationRoutes from './routes/notificationRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// VAPID keys setup
webpush.setVapidDetails(
  'mailto:renttrack@gmail.com',
  process.env.VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
)

app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'RentTrack API running ✅' })
})

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.log('MongoDB error:', err))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app